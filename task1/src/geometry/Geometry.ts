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

  sign(value: number): number {
    if (this.isNearlyZero(value)) {
      return 0;
    }
    if (value > 0) {
      return 1;
    }
    return -1;
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

  interpolateToZero(from: Point, to: Point, fromCoord: number, toCoord: number): Point {
    const parameter = fromCoord / (fromCoord - toCoord);
    const x = from.getX() + parameter * (to.getX() - from.getX());
    const y = from.getY() + parameter * (to.getY() - from.getY());
    const z = from.getZ() + parameter * (to.getZ() - from.getZ());
    return new Point('intersection', x, y, z);
  }

  tetrahedronVolume(first: Point, second: Point, third: Point, fourth: Point): number {
    const ax = second.getX() - first.getX();
    const ay = second.getY() - first.getY();
    const az = second.getZ() - first.getZ();
    const bx = third.getX() - first.getX();
    const by = third.getY() - first.getY();
    const bz = third.getZ() - first.getZ();
    const cx = fourth.getX() - first.getX();
    const cy = fourth.getY() - first.getY();
    const cz = fourth.getZ() - first.getZ();
    const scalarTriple = ax * (by * cz - bz * cy)
      - ay * (bx * cz - bz * cx)
      + az * (bx * cy - by * cx);
    return Math.abs(scalarTriple) / 6;
  }
}
