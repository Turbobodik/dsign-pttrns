import type { FictionBook } from '../domain/FictionBook';
import type { Textbook } from '../domain/Textbook';
import type { BookVisitor } from './BookVisitor';
import { LoanRulesVisitor } from './LoanRulesVisitor';

export interface FineLine {
  bookId: string;
  title: string;
  readerName: string;
  daysOverdue: number;
  fine: number;
}

/** Visitor: долг по книгам, которые не вернули к сроку. */
export class FineVisitor implements BookVisitor {
  private lines: FineLine[] = [];
  private now: Date;

  constructor(now = new Date()) {
    this.now = now;
  }

  visitFiction(book: FictionBook): void {
    this.pushIfOverdue(book);
  }

  visitTextbook(book: Textbook): void {
    this.pushIfOverdue(book);
  }

  getLines(): FineLine[] {
    return this.lines;
  }

  getTotal(): number {
    return this.lines.reduce((sum, line) => sum + line.fine, 0);
  }

  private pushIfOverdue(book: FictionBook | Textbook): void {
    const dueAt = book.getDueAt();
    const readerName = book.getReaderName();
    if (!dueAt || !readerName) return;
    const daysOverdue = Math.floor((this.now.getTime() - dueAt.getTime()) / (24 * 60 * 60 * 1000));
    if (daysOverdue <= 0) return;
    const rules = new LoanRulesVisitor();
    book.accept(rules);
    this.lines.push({
      bookId: book.getId(),
      title: book.getTitle(),
      readerName,
      daysOverdue,
      fine: daysOverdue * rules.getRules().dailyFine,
    });
  }
}
