import type { FictionBook } from '../domain/FictionBook';
import type { Textbook } from '../domain/Textbook';
import type { BookVisitor } from './BookVisitor';

export interface InventoryReport {
  total: number;
  available: number;
  borrowed: number;
  fiction: number;
  textbooks: number;
  genres: Record<string, number>;
  subjects: Record<string, number>;
  lines: string[];
}

/** Visitor: сводка по фонду без if/else по типам в Facade. */
export class InventoryVisitor implements BookVisitor {
  private report: InventoryReport = {
    total: 0,
    available: 0,
    borrowed: 0,
    fiction: 0,
    textbooks: 0,
    genres: {},
    subjects: {},
    lines: [],
  };

  visitFiction(book: FictionBook): void {
    this.countStatus(book.getStatus());
    this.report.fiction += 1;
    this.report.genres[book.getGenre()] = (this.report.genres[book.getGenre()] ?? 0) + 1;
    this.report.lines.push(
      `[fiction] ${book.getTitle()} — ${book.getAuthor()} (${book.getGenre()}), ${book.getStatus()}`,
    );
  }

  visitTextbook(book: Textbook): void {
    this.countStatus(book.getStatus());
    this.report.textbooks += 1;
    this.report.subjects[book.getSubject()] =
      (this.report.subjects[book.getSubject()] ?? 0) + 1;
    this.report.lines.push(
      `[textbook] ${book.getTitle()} — ${book.getSubject()}, изд. ${book.getEdition()}, ${book.getStatus()}`,
    );
  }

  getReport(): InventoryReport {
    return this.report;
  }

  private countStatus(status: 'available' | 'borrowed'): void {
    this.report.total += 1;
    if (status === 'available') this.report.available += 1;
    else this.report.borrowed += 1;
  }
}
