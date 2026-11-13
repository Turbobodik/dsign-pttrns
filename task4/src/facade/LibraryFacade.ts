import type { Book, BookKind, BookSnapshot } from '../domain/Book';
import { createId } from '../domain/Book';
import { FictionBook } from '../domain/FictionBook';
import { Textbook } from '../domain/Textbook';
import { BookTemplates, type TemplateInfo } from '../prototype/BookTemplates';
import { LibraryStorage, type CollectedFine } from '../storage/LibraryStorage';
import { FineVisitor, type FineLine } from '../visitor/FineVisitor';
import { InventoryVisitor, type InventoryReport } from '../visitor/InventoryVisitor';
import { LoanRulesVisitor, type LoanRules } from '../visitor/LoanRulesVisitor';

export interface AddFictionInput {
  title: string;
  author: string;
  year: number;
  genre: string;
}

export interface AddTextbookInput {
  title: string;
  author: string;
  year: number;
  subject: string;
  edition: number;
}

/**
 * Facade: UI вызывает только эти методы.
 * Скрывает storage, templates, visitor и конкретные классы книг.
 */
export interface ReturnResult {
  book: BookSnapshot;
  fine: CollectedFine | null;
}

export class LibraryFacade {
  private books: Book[] = [];
  private fines: CollectedFine[] = [];
  private clock: string | null = null;

  constructor(
    private readonly storage = new LibraryStorage(),
    private readonly templates = new BookTemplates(),
  ) {
    const loaded = this.storage.load();
    this.books = loaded.books;
    this.fines = loaded.fines;
    this.clock = loaded.clock;
    if (this.books.length === 0) {
      this.seed();
    }
  }

  getNow(): Date {
    return this.now();
  }

  isCustomDate(): boolean {
    return this.clock !== null;
  }

  /** Календарная «сегодня» для проверки сроков. Время суток сохраняется. */
  setSystemDate(value: string): void {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) throw new Error('Некорректная дата');
    const current = this.now();
    const next = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      current.getHours(),
      current.getMinutes(),
      current.getSeconds(),
      current.getMilliseconds(),
    );
    if (Number.isNaN(next.getTime())) throw new Error('Некорректная дата');
    this.clock = next.toISOString();
    this.persist();
  }

  useRealDate(): void {
    this.clock = null;
    this.persist();
  }

  listBooks(): BookSnapshot[] {
    return this.books.map((book) => book.toSnapshot());
  }

  listTemplates(): TemplateInfo[] {
    return this.templates.list();
  }

  addFiction(input: AddFictionInput): BookSnapshot {
    const book = new FictionBook(
      createId(),
      input.title.trim(),
      input.author.trim(),
      input.year,
      input.genre.trim() || 'проза',
    );
    return this.push(book);
  }

  addTextbook(input: AddTextbookInput): BookSnapshot {
    const book = new Textbook(
      createId(),
      input.title.trim(),
      input.author.trim(),
      input.year,
      input.subject.trim() || 'общее',
      input.edition,
    );
    return this.push(book);
  }

  /** Prototype через шаблон. */
  addFromTemplate(templateKey: string): BookSnapshot {
    return this.push(this.templates.clone(templateKey));
  }

  /** Prototype: ещё один экземпляр уже существующей книги. */
  duplicateBook(bookId: string): BookSnapshot {
    const source = this.require(bookId);
    return this.push(source.clone());
  }

  borrowBook(bookId: string, readerName: string): BookSnapshot {
    const book = this.require(bookId);
    const rules = rulesOf(book);
    const issuedAt = this.now();
    book.borrow(readerName, issuedAt, addDays(issuedAt, rules.loanDays));
    this.persist();
    return book.toSnapshot();
  }

  renewBook(bookId: string): BookSnapshot {
    const book = this.require(bookId);
    const rules = rulesOf(book);
    const dueAt = book.getDueAt();
    if (!dueAt) throw new Error(`«${book.getTitle()}» не выдана`);
    if (rules.maxRenewals === 0) throw new Error('Учебники не продлеваются');
    if (book.getRenewals() >= rules.maxRenewals) throw new Error('Выдачу уже продлевали');
    if (dueAt.getTime() < this.now().getTime()) {
      throw new Error('Просроченную выдачу нельзя продлить. Оформите возврат');
    }
    book.renew(addDays(dueAt, rules.loanDays));
    this.persist();
    return book.toSnapshot();
  }

  returnBook(bookId: string): ReturnResult {
    const book = this.require(bookId);
    const openFine = this.fineFor(book);
    book.returnBook();
    const charged = openFine
      ? {
          id: createId(),
          bookTitle: openFine.title,
          readerName: openFine.readerName,
          daysOverdue: openFine.daysOverdue,
          amount: openFine.fine,
          paidAt: this.now().toISOString(),
        }
      : null;
    if (charged) this.fines.push(charged);
    this.persist();
    return { book: book.toSnapshot(), fine: charged };
  }

  removeBook(bookId: string): void {
    const book = this.require(bookId);
    if (book.getStatus() === 'borrowed') {
      throw new Error('Книга на руках у читателя — сначала оформите возврат');
    }
    this.books = this.books.filter((item) => item.getId() !== bookId);
    this.persist();
  }

  /** Visitor: инвентаризация. */
  getInventoryReport(): InventoryReport {
    const visitor = new InventoryVisitor();
    this.books.forEach((book) => book.accept(visitor));
    return visitor.getReport();
  }

  /** Visitor: текущие просроченные выдачи. */
  getFines(): { total: number; lines: FineLine[] } {
    const visitor = new FineVisitor(this.now());
    this.books.forEach((book) => book.accept(visitor));
    return { total: visitor.getTotal(), lines: visitor.getLines() };
  }

  listCollectedFines(): CollectedFine[] {
    return [...this.fines];
  }

  reset(): void {
    this.storage.clear();
    this.books = [];
    this.fines = [];
    this.clock = null;
    this.seed();
  }

  private seed(): void {
    (['dostoevsky', 'ts-book'] as const).forEach((key) => {
      this.books.push(this.templates.clone(key));
    });
    this.persist();
  }

  private push(book: Book): BookSnapshot {
    this.books.push(book);
    this.persist();
    return book.toSnapshot();
  }

  private require(bookId: string): Book {
    const book = this.books.find((item) => item.getId() === bookId);
    if (!book) throw new Error(`Книга ${bookId} не найдена`);
    return book;
  }

  private fineFor(book: Book): FineLine | null {
    const visitor = new FineVisitor(this.now());
    book.accept(visitor);
    return visitor.getLines()[0] ?? null;
  }

  private now(): Date {
    return this.clock ? new Date(this.clock) : new Date();
  }

  private persist(): void {
    this.storage.save(this.books, this.fines, this.clock);
  }
}

function rulesOf(book: Book): LoanRules {
  const visitor = new LoanRulesVisitor();
  book.accept(visitor);
  return visitor.getRules();
}

function addDays(from: Date, days: number): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next;
}

export type { BookKind };
