import { Point } from './Point';

export abstract class Shape {
  constructor(private readonly id: string) {}

  getId(): string {
    return this.id;
  }

  abstract getPoints(): Point[];
}
