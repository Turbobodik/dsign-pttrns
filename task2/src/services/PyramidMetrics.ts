import { Point } from '../entities/Point';
import { Pyramid } from '../entities/Pyramid';
import { Geometry } from '../geometry/Geometry';

type Axis = 'x' | 'y' | 'z';

/** Axis-aligned rectangular-base pyramid metrics (volume + surface area). */
export class PyramidMetrics {
  constructor(private readonly geometry: Geometry) {}

  calculateVolume(pyramid: Pyramid): number {
    const orderedBase = this.orderedBase(pyramid);
    const baseArea = this.rectangleArea(orderedBase);
    const height = this.baseHeight(pyramid, orderedBase);
    return (baseArea * height) / 3;
  }

  calculateSurfaceArea(pyramid: Pyramid): number {
    const orderedBase = this.orderedBase(pyramid);
    const apex = pyramid.getApex();
    const baseArea = this.rectangleArea(orderedBase);
    let lateralArea = 0;
    for (let index = 0; index < orderedBase.length; index += 1) {
      const current = orderedBase[index];
      const next = orderedBase[(index + 1) % orderedBase.length];
      lateralArea += this.triangleArea(current, next, apex);
    }
    return baseArea + lateralArea;
  }

  private baseHeight(pyramid: Pyramid, orderedBase: Point[]): number {
    const constantAxis = this.findConstantAxis(orderedBase);
    if (constantAxis === null) {
      return 0;
    }
    return Math.abs(this.coord(pyramid.getApex(), constantAxis) - this.coord(orderedBase[0], constantAxis));
  }

  private orderedBase(pyramid: Pyramid): Point[] {
    const base = pyramid.getBasePoints();
    const constantAxis = this.findConstantAxis(base);
    if (constantAxis === null) {
      return base;
    }
    const varying = (['x', 'y', 'z'] as Axis[]).filter((axis) => axis !== constantAxis);
    const firstValues = this.geometry.uniqueSorted(base.map((point) => this.coord(point, varying[0])));
    const secondValues = this.geometry.uniqueSorted(base.map((point) => this.coord(point, varying[1])));
    const findCorner = (first: number, second: number): Point => {
      const found = base.find((point) => (
        this.geometry.areAlmostEqual(this.coord(point, varying[0]), first)
        && this.geometry.areAlmostEqual(this.coord(point, varying[1]), second)
      ));
      return found ?? base[0];
    };
    return [
      findCorner(firstValues[0], secondValues[0]),
      findCorner(firstValues[1], secondValues[0]),
      findCorner(firstValues[1], secondValues[1]),
      findCorner(firstValues[0], secondValues[1]),
    ];
  }

  private findConstantAxis(points: Point[]): Axis | null {
    const axes: Axis[] = ['x', 'y', 'z'];
    const found = axes.find((axis) => {
      const values = points.map((point) => this.coord(point, axis));
      return values.every((value) => this.geometry.areAlmostEqual(value, values[0]));
    });
    return found ?? null;
  }

  private rectangleArea(orderedBase: Point[]): number {
    return this.geometry.distance(orderedBase[0], orderedBase[1])
      * this.geometry.distance(orderedBase[1], orderedBase[2]);
  }

  private triangleArea(first: Point, second: Point, third: Point): number {
    const ab = this.geometry.distance(first, second);
    const bc = this.geometry.distance(second, third);
    const ca = this.geometry.distance(third, first);
    const semiPerimeter = (ab + bc + ca) / 2;
    const underRoot = semiPerimeter
      * (semiPerimeter - ab)
      * (semiPerimeter - bc)
      * (semiPerimeter - ca);
    return Math.sqrt(Math.max(underRoot, 0));
  }

  private coord(point: Point, axis: Axis): number {
    if (axis === 'x') {
      return point.getX();
    }
    if (axis === 'y') {
      return point.getY();
    }
    return point.getZ();
  }
}
