import type { LibraryFacade } from './facade/LibraryFacade';
import type { BookSnapshot } from './domain/Book';

export function mountUi(root: HTMLElement, facade: LibraryFacade): void {
  root.innerHTML = `
    <header>
      <h1>Библиотека</h1>
      <p>Каталог, выдача читателю, продление и возврат. Срок и штраф зависят от типа книги.</p>
      <div class="patterns">
        <span>Prototype — clone / шаблоны</span>
        <span>Facade — LibraryFacade</span>
        <span>Visitor — inventory / fines</span>
      </div>
    </header>

    <div class="layout">
      <section class="panel">
        <h2>Добавить книгу</h2>
        <form id="add-form" class="row">
          <label>Тип
            <select name="kind">
              <option value="fiction">Художественная</option>
              <option value="textbook">Учебник</option>
            </select>
          </label>
          <label>Название<input name="title" required placeholder="Название" /></label>
          <label>Автор<input name="author" required placeholder="Автор" /></label>
          <label>Год<input name="year" type="number" required value="2020" /></label>
          <label id="extra-label">Жанр<input name="extra" required placeholder="роман" /></label>
          <label id="edition-label" hidden>Издание
            <input name="edition" type="number" min="1" value="1" />
          </label>
          <button type="submit">Добавить</button>
        </form>

        <h2>Типовые книги</h2>
        <p class="hint">Ещё один экземпляр с тем же названием — как повторное поступление в фонд.</p>
        <div class="templates" id="templates"></div>

        <h2>Текущая дата</h2>
        <div class="row">
          <label class="inline-field">Дата
            <input type="date" id="system-date" />
          </label>
          <button type="button" id="real-today" class="secondary">Реальная дата</button>
        </div>
        <p class="hint" id="clock-hint"></p>

        <h2>Отчёты</h2>
        <p class="hint">Художественные: 21 день и одно продление, 5 ₽/день. Учебники: 14 дней, без продления, 10 ₽/день.</p>
        <div class="row">
          <button type="button" id="inventory-btn">Инвентаризация</button>
          <button type="button" id="fines-btn" class="secondary">Просроченные</button>
          <button type="button" id="journal-btn" class="secondary">Журнал штрафов</button>
          <button type="button" id="reset-btn" class="danger">Сбросить данные</button>
        </div>
        <pre class="report" id="report">Нажмите кнопку отчёта.</pre>
        <div class="note" id="note"></div>
        <div class="toast" id="toast"></div>
      </section>

      <section class="panel">
        <h2>Каталог</h2>
        <div class="book-list" id="books"></div>
      </section>
    </div>
  `;

  const form = root.querySelector('#add-form') as HTMLFormElement;
  const kindSelect = form.elements.namedItem('kind') as HTMLSelectElement;
  const extraLabel = root.querySelector('#extra-label') as HTMLLabelElement;
  const editionLabel = root.querySelector('#edition-label') as HTMLLabelElement;
  const booksEl = root.querySelector('#books') as HTMLElement;
  const systemDate = root.querySelector('#system-date') as HTMLInputElement;
  const clockHint = root.querySelector('#clock-hint') as HTMLElement;
  const templatesEl = root.querySelector('#templates') as HTMLElement;
  const reportEl = root.querySelector('#report') as HTMLElement;
  const noteEl = root.querySelector('#note') as HTMLElement;
  const toastEl = root.querySelector('#toast') as HTMLElement;

  const showError = (error: unknown): void => {
    noteEl.textContent = '';
    toastEl.textContent = error instanceof Error ? error.message : String(error);
  };

  const showNote = (message: string): void => {
    toastEl.textContent = '';
    noteEl.textContent = message;
  };

  const clearError = (): void => {
    toastEl.textContent = '';
    noteEl.textContent = '';
  };

  const syncExtraFields = (): void => {
    const isTextbook = kindSelect.value === 'textbook';
    extraLabel.firstChild!.textContent = isTextbook ? 'Предмет' : 'Жанр';
    (extraLabel.querySelector('input') as HTMLInputElement).placeholder = isTextbook
      ? 'математика'
      : 'роман';
    editionLabel.hidden = !isTextbook;
  };

  const renderTemplates = (): void => {
    templatesEl.innerHTML = facade
      .listTemplates()
      .map(
        (tpl) => `
        <button type="button" class="template-btn" data-key="${tpl.key}">
          ${escapeHtml(tpl.label)}
          <small>${tpl.kind === 'fiction' ? 'художественная' : 'учебник'}</small>
        </button>`,
      )
      .join('');
  };

  const renderBooks = (): void => {
    const books = facade.listBooks();
    if (books.length === 0) {
      booksEl.innerHTML = '<p class="hint">Каталог пуст.</p>';
      return;
    }
    const now = facade.getNow();
    booksEl.innerHTML = books.map((book) => bookCard(book, now)).join('');
  };

  const syncClock = (): void => {
    systemDate.value = toInputDate(facade.getNow());
    clockHint.textContent = facade.isCustomDate()
      ? 'Дата задана вручную. Сроки и штрафы считаются от неё, уже оформленные выдачи не меняются.'
      : 'Стоит реальная дата. Сдвиньте её вперёд, чтобы проверить просрочку и штраф.';
  };

  const refresh = (): void => {
    renderBooks();
    renderTemplates();
    syncClock();
  };

  systemDate.addEventListener('change', () => {
    clearError();
    try {
      facade.setSystemDate(systemDate.value);
      refresh();
    } catch (error) {
      showError(error);
    }
  });

  root.querySelector('#real-today')!.addEventListener('click', () => {
    clearError();
    facade.useRealDate();
    refresh();
  });

  kindSelect.addEventListener('change', syncExtraFields);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearError();
    const data = new FormData(form);
    const title = String(data.get('title') ?? '');
    const author = String(data.get('author') ?? '');
    const year = Number(data.get('year'));
    const extra = String(data.get('extra') ?? '');
    try {
      if (kindSelect.value === 'fiction') {
        facade.addFiction({ title, author, year, genre: extra });
      } else {
        facade.addTextbook({
          title,
          author,
          year,
          subject: extra,
          edition: Number(data.get('edition') || 1),
        });
      }
      form.reset();
      kindSelect.value = 'fiction';
      syncExtraFields();
      refresh();
    } catch (error) {
      showError(error);
    }
  });

  templatesEl.addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-key]');
    if (!btn?.dataset.key) return;
    clearError();
    try {
      facade.addFromTemplate(btn.dataset.key);
      refresh();
    } catch (error) {
      showError(error);
    }
  });

  booksEl.addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (!action || !id) return;
    clearError();
    try {
      if (action === 'borrow') {
        const card = btn.closest('article');
        const input = card?.querySelector<HTMLInputElement>('input[name="reader"]');
        const snapshot = facade.borrowBook(id, input?.value ?? '');
        showNote(
          `«${snapshot.title}» выдана ${snapshot.readerName} до ${formatDateTime(snapshot.dueAt)}.`,
        );
      }
      if (action === 'renew') {
        const snapshot = facade.renewBook(id);
        showNote(`Выдача продлена до ${formatDateTime(snapshot.dueAt)}.`);
      }
      if (action === 'return') {
        const { book, fine } = facade.returnBook(id);
        showNote(
          fine
            ? `«${book.title}» возвращена. Штраф ${fine.amount} ₽ за ${fine.daysOverdue} дн.`
            : `«${book.title}» возвращена вовремя.`,
        );
      }
      if (action === 'duplicate') facade.duplicateBook(id);
      if (action === 'remove') facade.removeBook(id);
      refresh();
    } catch (error) {
      showError(error);
    }
  });

  root.querySelector('#inventory-btn')!.addEventListener('click', () => {
    const report = facade.getInventoryReport();
    reportEl.textContent = [
      `Всего: ${report.total} | доступно: ${report.available} | выдано: ${report.borrowed}`,
      `Худож.: ${report.fiction} | учебников: ${report.textbooks}`,
      `Жанры: ${formatMap(report.genres)}`,
      `Предметы: ${formatMap(report.subjects)}`,
      '',
      ...report.lines,
    ].join('\n');
  });

  root.querySelector('#fines-btn')!.addEventListener('click', () => {
    const { total, lines } = facade.getFines();
    if (lines.length === 0) {
      reportEl.textContent = 'Просроченных выдач нет.';
      return;
    }
    reportEl.textContent = [
      `К оплате сейчас: ${total} ₽`,
      ...lines.map(
        (line) =>
          `• «${line.title}», читатель ${line.readerName}: ${line.daysOverdue} дн. → ${line.fine} ₽`,
      ),
    ].join('\n');
  });

  root.querySelector('#journal-btn')!.addEventListener('click', () => {
    const fines = facade.listCollectedFines();
    if (fines.length === 0) {
      reportEl.textContent = 'Штрафы ещё не начислялись. Они фиксируются при возврате просроченной книги.';
      return;
    }
    const total = fines.reduce((sum, fine) => sum + fine.amount, 0);
    reportEl.textContent = [
      `Начислено при возвратах: ${total} ₽`,
      ...fines.map(
        (fine) =>
          `• ${formatDateTime(fine.paidAt)} — читатель ${fine.readerName}, «${fine.bookTitle}»: ${fine.amount} ₽`,
      ),
    ].join('\n');
  });

  root.querySelector('#reset-btn')!.addEventListener('click', () => {
    facade.reset();
    reportEl.textContent = 'Данные сброшены, каталог засеян из шаблонов.';
    clearError();
    refresh();
  });

  syncExtraFields();
  refresh();
}

function bookCard(book: BookSnapshot, now: Date): string {
  const detail =
    book.kind === 'fiction'
      ? `жанр: ${book.genre}`
      : `предмет: ${book.subject}, изд. ${book.edition}`;

  return `
    <article class="book">
      <div class="book-top">
        <h3>${escapeHtml(book.title)}</h3>
        <span class="badge ${book.status}">${book.status === 'available' ? 'в наличии' : 'выдана'}</span>
      </div>
      <p class="meta">${escapeHtml(book.author)} · ${book.year} · ${detail}</p>
      ${loanLine(book, now)}
      <div class="actions">
        ${
          book.status === 'available'
            ? `<label class="inline-field">Читатель
                 <input name="reader" placeholder="Имя" />
               </label>
               <button type="button" data-action="borrow" data-id="${book.id}">Выдать</button>`
            : `<button type="button" data-action="renew" data-id="${book.id}" class="secondary">Продлить</button>
               <button type="button" data-action="return" data-id="${book.id}">Вернуть</button>`
        }
        <button type="button" class="secondary" data-action="duplicate" data-id="${book.id}">
          Ещё экземпляр
        </button>
        <button type="button" class="danger" data-action="remove" data-id="${book.id}">
          Удалить
        </button>
      </div>
    </article>
  `;
}

function loanLine(book: BookSnapshot, now: Date): string {
  if (book.status !== 'borrowed' || !book.borrowedAt || !book.dueAt || !book.readerName) return '';
  const due = new Date(book.dueAt);
  const overdue = Math.floor((now.getTime() - due.getTime()) / (24 * 60 * 60 * 1000));
  const left = Math.ceil((due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  const status = overdue > 0 ? `просрочка ${overdue} дн.` : `в срок, осталось ${left} дн.`;
  const renewed = book.renewals > 0 ? ' · продлевалась' : '';
  return `<p class="meta loan">Читатель: ${escapeHtml(book.readerName)} · выдана ${formatDateTime(book.borrowedAt)} · вернуть до ${formatDateTime(book.dueAt)} · ${status}${renewed}</p>`;
}

function toInputDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatDateTime(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMap(map: Record<string, number>): string {
  const entries = Object.entries(map);
  return entries.length === 0 ? '—' : entries.map(([k, v]) => `${k}(${v})`).join(', ');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
