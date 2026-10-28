import { CoordinateAxis } from '../constants/geometry';
import { Geometry } from '../geometry/Geometry';
import { NumberValidator } from './NumberValidator';

export interface ParsedPointCoordinates {
  x: number;
  y: number;
  z: number;
}

export class PyramidDataValidator {
  constructor(
    private readonly numberValidator: NumberValidator,
    private readonly geometry: Geometry,
  ) {}

  hasValidTokenCount(tokens: string[]): boolean {
    return tokens.length === 16;
  }

  hasValidCoordinates(coordinateTokens: string[]): boolean {
    return this.numberValidator.areAllNumberTokens(coordinateTokens);
  }

  findConstantAxis(points: ParsedPointCoordinates[]): CoordinateAxis | null {
    const axes: CoordinateAxis[] = ['x', 'y', 'z'];
    const constantAxes = axes.filter((axis) => {
      const values = points.map((point) => point[axis]);
      const uniqueValues = this.geometry.uniqueSorted(values);
      return uniqueValues.length === 1;
    });
    if (constantAxes.length === 1) {
      return constantAxes[0];
    }
    return null;
  }

  isAxisAlignedRectangle(base: ParsedPointCoordinates[]): boolean {
    const constantAxis = this.findConstantAxis(base);
    if (constantAxis === null) {
      return false;
    }
    const varyingAxes = (['x', 'y', 'z'] as CoordinateAxis[])
      .filter((axis) => axis !== constantAxis);
    const firstAxisValues = this.geometry.uniqueSorted(base.map((point) => point[varyingAxes[0]]));
    const secondAxisValues = this.geometry.uniqueSorted(base.map((point) => point[varyingAxes[1]]));
    if (firstAxisValues.length !== 2 || secondAxisValues.length !== 2) {
      return false;
    }
    const expectedCombinations = firstAxisValues.length * secondAxisValues.length;
    return expectedCombinations === 4 && base.length === 4;
  }

  isApexOffBasePlane(base: ParsedPointCoordinates[], apex: ParsedPointCoordinates): boolean {
    const constantAxis = this.findConstantAxis(base);
    if (constantAxis === null) {
      return false;
    }
    const baseValue = base[0][constantAxis];
    return !this.geometry.areAlmostEqual(apex[constantAxis], baseValue);
  }

  hasDistinctPoints(points: ParsedPointCoordinates[]): boolean {
    let distinct = true;
    points.forEach((left, leftIndex) => {
      points.forEach((right, rightIndex) => {
        if (leftIndex < rightIndex) {
          const sameX = this.geometry.areAlmostEqual(left.x, right.x);
          const sameY = this.geometry.areAlmostEqual(left.y, right.y);
          const sameZ = this.geometry.areAlmostEqual(left.z, right.z);
          if (sameX && sameY && sameZ) {
            distinct = false;
          }
        }
      });
    });
    return distinct;
  }
}
