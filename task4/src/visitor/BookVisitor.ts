import type { FictionBook } from '../domain/FictionBook';
import type { Textbook } from '../domain/Textbook';

export interface BookVisitor {
  visitFiction(book: FictionBook): void;
  visitTextbook(book: Textbook): void;
}
