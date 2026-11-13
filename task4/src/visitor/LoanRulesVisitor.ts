import type { FictionBook } from '../domain/FictionBook';
import type { Textbook } from '../domain/Textbook';
import type { BookVisitor } from './BookVisitor';

export interface LoanRules {
  loanDays: number;
  dailyFine: number;
  maxRenewals: number;
}

/** Visitor: срок, продление и ставка штрафа зависят от типа книги. */
export class LoanRulesVisitor implements BookVisitor {
  private rules: LoanRules = { loanDays: 14, dailyFine: 0, maxRenewals: 0 };

  visitFiction(book: FictionBook): void {
    void book;
    this.rules = { loanDays: 21, dailyFine: 5, maxRenewals: 1 };
  }

  visitTextbook(book: Textbook): void {
    void book;
    this.rules = { loanDays: 14, dailyFine: 10, maxRenewals: 0 };
  }

  getRules(): LoanRules {
    return this.rules;
  }
}
