import type { BookVisitor } from '../visitor/BookVisitor';

export type BookKind = 'fiction' | 'textbook';
export type BookStatus = 'available' | 'borrowed';

export interface BookSnapshot {
  id: string;
  kind: BookKind;
  title: string;
  author: string;
  year: number;
  status: BookStatus;
  borrowedAt: string | null;
  dueAt: string | null;
  readerName: string | null;
  renewals: number;
  genre?: string;
  subject?: string;
  edition?: number;
}

/** Prototype: каждая книга умеет клонировать себя. */
export interface Book {
  getId(): string;
  getKind(): BookKind;
  getTitle(): string;
  getAuthor(): string;
  getYear(): number;
  getStatus(): BookStatus;
  getBorrowedAt(): Date | null;
  getDueAt(): Date | null;
  getReaderName(): string | null;
  getRenewals(): number;
  borrow(readerName: string, borrowedAt: Date, dueAt: Date): void;
  renew(dueAt: Date): void;
  returnBook(): void;
  clone(newId?: string): Book;
  accept(visitor: BookVisitor): void;
  toSnapshot(): BookSnapshot;
}

export abstract class BaseBook implements Book {
  protected status: BookStatus = 'available';
  protected borrowedAt: Date | null = null;
  protected dueAt: Date | null = null;
  protected readerName: string | null = null;
  protected renewals = 0;

  constructor(
    protected id: string,
    protected title: string,
    protected author: string,
    protected year: number,
  ) {}

  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getAuthor(): string {
    return this.author;
  }

  getYear(): number {
    return this.year;
  }

  getStatus(): BookStatus {
    return this.status;
  }

  getBorrowedAt(): Date | null {
    return this.borrowedAt;
  }

  getDueAt(): Date | null {
    return this.dueAt;
  }

  getReaderName(): string | null {
    return this.readerName;
  }

  getRenewals(): number {
    return this.renewals;
  }

  borrow(readerName: string, borrowedAt: Date, dueAt: Date): void {
    if (this.status === 'borrowed') {
      throw new Error(`«${this.title}» уже выдана`);
    }
    const reader = readerName.trim();
    if (!reader) throw new Error('Укажите читателя');
    this.status = 'borrowed';
    this.readerName = reader;
    this.borrowedAt = borrowedAt;
    this.dueAt = dueAt;
    this.renewals = 0;
  }

  renew(dueAt: Date): void {
    if (this.status !== 'borrowed') {
      throw new Error(`«${this.title}» не выдана`);
    }
    this.dueAt = dueAt;
    this.renewals += 1;
  }

  returnBook(): void {
    if (this.status === 'available') {
      throw new Error(`«${this.title}» уже в библиотеке`);
    }
    this.status = 'available';
    this.readerName = null;
    this.borrowedAt = null;
    this.dueAt = null;
    this.renewals = 0;
  }

  abstract getKind(): BookKind;
  abstract clone(newId?: string): Book;
  abstract accept(visitor: BookVisitor): void;
  abstract toSnapshot(): BookSnapshot;

  protected loanFields(): Pick<
    BookSnapshot,
    'status' | 'borrowedAt' | 'dueAt' | 'readerName' | 'renewals'
  > {
    return {
      status: this.status,
      borrowedAt: this.borrowedAt?.toISOString() ?? null,
      dueAt: this.dueAt?.toISOString() ?? null,
      readerName: this.readerName,
      renewals: this.renewals,
    };
  }

  protected applySnapshotState(snapshot: BookSnapshot): void {
    const reader = snapshot.readerName?.trim() || null;
    if (snapshot.status === 'borrowed' && reader && snapshot.borrowedAt && snapshot.dueAt) {
      this.status = 'borrowed';
      this.readerName = reader;
      this.borrowedAt = new Date(snapshot.borrowedAt);
      this.dueAt = new Date(snapshot.dueAt);
      this.renewals = snapshot.renewals ?? 0;
      return;
    }
    this.status = 'available';
    this.readerName = null;
    this.borrowedAt = null;
    this.dueAt = null;
    this.renewals = 0;
  }
}

export function createId(): string {
  return `book_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
