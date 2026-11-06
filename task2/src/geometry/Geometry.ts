import { EPSILON } from '../constants/geometry';
import { Point } from '../entities/Point';

export class Geometry {
  areAlmostEqual(left: number, right: number): boolean {
    return Math.abs(left - right) < EPSILON;
  }

  isNearlyZero(value: number): boolean {
    return Math.abs(value) < EPSILON;
  }

  distance(first: Point, second: Point): number {
    const dx = first.getX() - second.getX();
    const dy = first.getY() - second.getY();
    const dz = first.getZ() - second.getZ();
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  uniqueSorted(values: number[]): number[] {
    const sortedValues = [...values].sort((left, right) => left - right);
    const uniqueValues: number[] = [];
    sortedValues.forEach((value) => {
      const last = uniqueValues[uniqueValues.length - 1];
      if (last === undefined || !this.areAlmostEqual(last, value)) {
        uniqueValues.push(value);
      }
    });
    return uniqueValues;
  }
}
