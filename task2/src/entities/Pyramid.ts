import { Point } from './Point';
import { Shape } from './Shape';

export class Pyramid extends Shape {
  constructor(
    id: string,
    name: string,
    private basePoints: Point[],
    private apex: Point,
  ) {
    super(id, name);
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

  setBasePoints(basePoints: Point[]): void {
    this.basePoints = [...basePoints];
    this.notifyObservers();
  }

  setApex(apex: Point): void {
    this.apex = apex;
    this.notifyObservers();
  }
}
