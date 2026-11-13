import type { BookVisitor } from '../visitor/BookVisitor';
import { BaseBook, createId, type BookSnapshot } from './Book';

export class Textbook extends BaseBook {
  constructor(
    id: string,
    title: string,
    author: string,
    year: number,
    private subject: string,
    private edition: number,
  ) {
    super(id, title, author, year);
  }

  getKind(): 'textbook' {
    return 'textbook';
  }

  getSubject(): string {
    return this.subject;
  }

  getEdition(): number {
    return this.edition;
  }

  clone(newId = createId()): Textbook {
    return new Textbook(
      newId,
      this.title,
      this.author,
      this.year,
      this.subject,
      this.edition,
    );
  }

  accept(visitor: BookVisitor): void {
    visitor.visitTextbook(this);
  }

  toSnapshot(): BookSnapshot {
    return {
      id: this.id,
      kind: 'textbook',
      title: this.title,
      author: this.author,
      year: this.year,
      ...this.loanFields(),
      subject: this.subject,
      edition: this.edition,
    };
  }

  static fromSnapshot(snapshot: BookSnapshot): Textbook {
    const book = new Textbook(
      snapshot.id,
      snapshot.title,
      snapshot.author,
      snapshot.year,
      snapshot.subject ?? 'общее',
      snapshot.edition ?? 1,
    );
    book.applySnapshotState(snapshot);
    return book;
  }
}
