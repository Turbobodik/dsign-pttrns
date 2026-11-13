import { FictionBook } from '../domain/FictionBook';
import { Textbook } from '../domain/Textbook';
import type { Book } from '../domain/Book';
import { createId } from '../domain/Book';

export interface TemplateInfo {
  key: string;
  label: string;
  kind: 'fiction' | 'textbook';
}

/**
 * Prototype-реестр: хранит эталонные экземпляры.
 * Клиент берёт копию через clone(), не создаёт книгу с нуля.
 */
export class BookTemplates {
  private readonly prototypes = new Map<string, Book>();

  constructor() {
    this.prototypes.set(
      'dostoevsky',
      new FictionBook(createId(), 'Преступление и наказание', 'Ф. Достоевский', 1866, 'роман'),
    );
    this.prototypes.set(
      'orwell',
      new FictionBook(createId(), '1984', 'Дж. Оруэлл', 1949, 'антиутопия'),
    );
    this.prototypes.set(
      'ts-book',
      new Textbook(createId(), 'Programming TypeScript', 'Boris Cherny', 2019, 'TypeScript', 1),
    );
    this.prototypes.set(
      'algorithms',
      new Textbook(
        createId(),
        'Introduction to Algorithms',
        'CLRS',
        2009,
        'алгоритмы',
        3,
      ),
    );
  }

  list(): TemplateInfo[] {
    return [...this.prototypes.entries()].map(([key, book]) => ({
      key,
      label: `${book.getTitle()} — ${book.getAuthor()}`,
      kind: book.getKind(),
    }));
  }

  /** Prototype: клонируем шаблон → новый экземпляр с новым id. */
  clone(key: string): Book {
    const proto = this.prototypes.get(key);
    if (!proto) throw new Error(`Шаблон «${key}» не найден`);
    return proto.clone();
  }
}
