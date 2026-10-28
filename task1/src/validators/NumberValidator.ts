import { STRICT_NUMBER_PATTERN } from '../constants/regex';

export class NumberValidator {
  isNumberToken(token: string): boolean {
    return STRICT_NUMBER_PATTERN.test(token);
  }

  parseNumber(token: string): number {
    return Number(token);
  }

  areAllNumberTokens(tokens: string[]): boolean {
    return tokens.every((token) => this.isNumberToken(token));
  }
}
