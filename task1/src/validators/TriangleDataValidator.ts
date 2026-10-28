import { Geometry } from '../geometry/Geometry';
import { NumberValidator } from './NumberValidator';

export class TriangleDataValidator {
  constructor(
    private readonly numberValidator: NumberValidator,
    private readonly geometry: Geometry,
  ) {}

  hasValidTokenCount(tokens: string[]): boolean {
    return tokens.length === 7;
  }

  hasValidCoordinates(coordinateTokens: string[]): boolean {
    return this.numberValidator.areAllNumberTokens(coordinateTokens);
  }

  formsTriangle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
  ): boolean {
    const areaTwice = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1);
    return !this.geometry.isNearlyZero(areaTwice);
  }
}
