import type { BookVisitor } from '../visitor/BookVisitor';
import { BaseBook, createId, type BookSnapshot } from './Book';

export class FictionBook extends BaseBook {
  constructor(
    id: string,
    title: string,
    author: string,
    year: number,
    private genre: string,
  ) {
    super(id, title, author, year);
  }

  getKind(): 'fiction' {
    return 'fiction';
  }

  getGenre(): string {
    return this.genre;
  }

  clone(newId = createId()): FictionBook {
    const copy = new FictionBook(newId, this.title, this.author, this.year, this.genre);
    // новая копия на полке — всегда available
    return copy;
  }

  accept(visitor: BookVisitor): void {
    visitor.visitFiction(this);
  }

  toSnapshot(): BookSnapshot {
    return {
      id: this.id,
      kind: 'fiction',
      title: this.title,
      author: this.author,
      year: this.year,
      ...this.loanFields(),
      genre: this.genre,
    };
  }

  static fromSnapshot(snapshot: BookSnapshot): FictionBook {
    const book = new FictionBook(
      snapshot.id,
      snapshot.title,
      snapshot.author,
      snapshot.year,
      snapshot.genre ?? 'проза',
    );
    book.applySnapshotState(snapshot);
    return book;
  }
}
