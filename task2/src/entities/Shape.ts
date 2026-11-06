import type { Observer } from '../observer/Observer';
import { Point } from './Point';

/** Observable geometric figure. Parameter changes notify attached observers. */
export abstract class Shape {
  private readonly observers: Observer[] = [];

  constructor(
    private readonly id: string,
    private name: string,
  ) {}

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
    this.notifyObservers();
  }

  attach(observer: Observer): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index >= 0) {
      this.observers.splice(index, 1);
    }
  }

  protected notifyObservers(): void {
    this.observers.forEach((observer) => {
      observer.update(this);
    });
  }

  abstract getPoints(): Point[];

  getFirstPoint(): Point {
    const points = this.getPoints();
    return points[0];
  }
}
