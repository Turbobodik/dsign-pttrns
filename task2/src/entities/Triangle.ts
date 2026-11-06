import { Point } from './Point';
import { Shape } from './Shape';

export class Triangle extends Shape {
  constructor(
    id: string,
    name: string,
    private firstPoint: Point,
    private secondPoint: Point,
    private thirdPoint: Point,
  ) {
    super(id, name);
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

  setFirstPoint(point: Point): void {
    this.firstPoint = point;
    this.notifyObservers();
  }

  setSecondPoint(point: Point): void {
    this.secondPoint = point;
    this.notifyObservers();
  }

  setThirdPoint(point: Point): void {
    this.thirdPoint = point;
    this.notifyObservers();
  }

  setPoints(first: Point, second: Point, third: Point): void {
    this.firstPoint = first;
    this.secondPoint = second;
    this.thirdPoint = third;
    this.notifyObservers();
  }
}
