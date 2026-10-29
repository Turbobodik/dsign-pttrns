import { Point } from './Point';
import { Shape } from './Shape';

/** Rectangular base (4 points) + apex. Data only — volume lives in PyramidService. */
export class Pyramid extends Shape {
  constructor(
    id: string,
    private readonly basePoints: Point[],
    private readonly apex: Point,
  ) {
    super(id);
  }

  getBasePoints(): Point[] {
    return [...this.basePoints];
  }

  getApex(): Point {
    return this.apex;
  }

  getPoints(): Point[] {
    return [...this.basePoints, this.apex];
  }
}
