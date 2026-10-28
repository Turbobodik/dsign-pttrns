import { Point } from './Point';
import { Shape } from './Shape';

export class Triangle extends Shape {
  constructor(
    id: string,
    private readonly firstPoint: Point,
    private readonly secondPoint: Point,
    private readonly thirdPoint: Point,
  ) {
    super(id);
  }

  getFirstPoint(): Point {
    return this.firstPoint;
  }

  getSecondPoint(): Point {
    return this.secondPoint;
  }

  getThirdPoint(): Point {
    return this.thirdPoint;
  }

  getPoints(): Point[] {
    return [this.firstPoint, this.secondPoint, this.thirdPoint];
  }
}
