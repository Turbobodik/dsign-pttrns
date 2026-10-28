import { Triangle } from '../entities/Triangle';
import { Geometry } from '../geometry/Geometry';
import { CalculationValidator } from '../validators/CalculationValidator';

export class TriangleService {
  constructor(
    private readonly geometry: Geometry,
    private readonly calculationValidator: CalculationValidator,
  ) {}

  calculatePerimeter(triangle: Triangle): number {
    const sides = this.sideLengths(triangle);
    const perimeter = sides.reduce((sum, side) => sum + side, 0);
    return this.calculationValidator.validatePositive(perimeter, 'Triangle perimeter');
  }

  calculateArea(triangle: Triangle): number {
    const [ab, bc, ca] = this.sideLengths(triangle);
    const semiPerimeter = (ab + bc + ca) / 2;
    const underRoot = semiPerimeter
      * (semiPerimeter - ab)
      * (semiPerimeter - bc)
      * (semiPerimeter - ca);
    const area = Math.sqrt(Math.max(underRoot, 0));
    return this.calculationValidator.validatePositive(area, 'Triangle area');
  }

  isTriangle(triangle: Triangle): boolean {
    const areaTwice = this.signedAreaTwice(triangle);
    return !this.geometry.isNearlyZero(areaTwice);
  }

  isEquilateral(triangle: Triangle): boolean {
    const [ab, bc, ca] = this.sideLengths(triangle);
    return this.geometry.areAlmostEqual(ab, bc) && this.geometry.areAlmostEqual(bc, ca);
  }

  isIsosceles(triangle: Triangle): boolean {
    const [ab, bc, ca] = this.sideLengths(triangle);
    return this.geometry.areAlmostEqual(ab, bc)
      || this.geometry.areAlmostEqual(bc, ca)
      || this.geometry.areAlmostEqual(ca, ab);
  }

  isRight(triangle: Triangle): boolean {
    const [ab, bc, ca] = this.sortedSides(triangle);
    return this.geometry.areAlmostEqual(ab * ab + bc * bc, ca * ca);
  }

  isAcute(triangle: Triangle): boolean {
    const [ab, bc, ca] = this.sortedSides(triangle);
    return ab * ab + bc * bc > ca * ca && !this.geometry.areAlmostEqual(ab * ab + bc * bc, ca * ca);
  }

  isObtuse(triangle: Triangle): boolean {
    const [ab, bc, ca] = this.sortedSides(triangle);
    return ab * ab + bc * bc < ca * ca && !this.geometry.areAlmostEqual(ab * ab + bc * bc, ca * ca);
  }

  private sideLengths(triangle: Triangle): [number, number, number] {
    const first = triangle.getFirstPoint();
    const second = triangle.getSecondPoint();
    const third = triangle.getThirdPoint();
    const ab = this.geometry.distance(first, second);
    const bc = this.geometry.distance(second, third);
    const ca = this.geometry.distance(third, first);
    return [ab, bc, ca];
  }

  private sortedSides(triangle: Triangle): [number, number, number] {
    const sides = this.sideLengths(triangle);
    sides.sort((left, right) => left - right);
    return [sides[0], sides[1], sides[2]];
  }

  private signedAreaTwice(triangle: Triangle): number {
    const first = triangle.getFirstPoint();
    const second = triangle.getSecondPoint();
    const third = triangle.getThirdPoint();
    return (second.getX() - first.getX()) * (third.getY() - first.getY())
      - (third.getX() - first.getX()) * (second.getY() - first.getY());
  }
}
