import { Triangle } from '../entities/Triangle';
import { Geometry } from '../geometry/Geometry';

export class TriangleMetrics {
  constructor(private readonly geometry: Geometry) {}

  calculatePerimeter(triangle: Triangle): number {
    const [ab, bc, ca] = this.sideLengths(triangle);
    return ab + bc + ca;
  }

  calculateArea(triangle: Triangle): number {
    const [ab, bc, ca] = this.sideLengths(triangle);
    const semiPerimeter = (ab + bc + ca) / 2;
    const underRoot = semiPerimeter
      * (semiPerimeter - ab)
      * (semiPerimeter - bc)
      * (semiPerimeter - ca);
    return Math.sqrt(Math.max(underRoot, 0));
  }

  private sideLengths(triangle: Triangle): [number, number, number] {
    const first = triangle.getFirstPoint();
    const second = triangle.getSecondPoint();
    const third = triangle.getThirdPoint();
    return [
      this.geometry.distance(first, second),
      this.geometry.distance(second, third),
      this.geometry.distance(third, first),
    ];
  }
}
