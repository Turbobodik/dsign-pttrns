import { CoordinateAxis, CoordinatePlane, COORDINATE_PLANES } from '../constants/geometry';
import { Point } from '../entities/Point';
import { Pyramid } from '../entities/Pyramid';
import { Geometry } from '../geometry/Geometry';
import { CalculationValidator } from '../validators/CalculationValidator';
import { ParsedPointCoordinates, PyramidDataValidator } from '../validators/PyramidDataValidator';

export interface VolumeSplit {
  plane: CoordinatePlane;
  volumePositive: number;
  volumeNegative: number;
  ratio: number;
  cutsInterior: boolean;
}

export class PyramidService {
  constructor(
    private readonly geometry: Geometry,
    private readonly calculationValidator: CalculationValidator,
    private readonly dataValidator: PyramidDataValidator,
  ) {}

  isPyramid(pyramid: Pyramid): boolean {
    const parsed = this.toParsed(pyramid.getPoints());
    const base = this.toParsed(pyramid.getBasePoints());
    const apex = this.toParsed([pyramid.getApex()])[0];
    return this.dataValidator.hasDistinctPoints(parsed)
      && this.dataValidator.isAxisAlignedRectangle(base)
      && this.dataValidator.isApexOffBasePlane(base, apex);
  }

  isBaseOnCoordinatePlane(pyramid: Pyramid): boolean {
    const base = pyramid.getBasePoints();
    const axes: CoordinateAxis[] = ['x', 'y', 'z'];
    return axes.some((axis) => (
      base.every((point) => this.geometry.isNearlyZero(this.coord(point, axis)))
    ));
  }

  calculateVolume(pyramid: Pyramid): number {
    const orderedBase = this.orderedBase(pyramid);
    const baseArea = this.rectangleArea(orderedBase);
    const height = this.baseHeight(pyramid);
    const volume = (baseArea * height) / 3;
    return this.calculationValidator.validatePositive(volume, 'Pyramid volume');
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
    const surfaceArea = baseArea + lateralArea;
    return this.calculationValidator.validatePositive(surfaceArea, 'Pyramid surface area');
  }

  calculateVolumeSplits(pyramid: Pyramid): VolumeSplit[] {
    return COORDINATE_PLANES.map((plane) => this.splitByPlane(pyramid, plane));
  }

  private splitByPlane(pyramid: Pyramid, plane: CoordinatePlane): VolumeSplit {
    const axis = this.planeNormal(plane);
    let volumePositive = 0;
    let volumeNegative = 0;
    this.toTetrahedra(pyramid).forEach((tetrahedron) => {
      const split = this.splitTetrahedron(tetrahedron, axis);
      volumePositive += split.positive;
      volumeNegative += split.negative;
    });
    const cutsInterior = !this.geometry.isNearlyZero(volumePositive)
      && !this.geometry.isNearlyZero(volumeNegative);
    let ratio = 0;
    if (cutsInterior) {
      const smaller = Math.min(volumePositive, volumeNegative);
      const larger = Math.max(volumePositive, volumeNegative);
      ratio = this.calculationValidator.validateRatio(smaller / larger, `Volume ratio for ${plane}`);
    }
    return {
      plane,
      volumePositive: this.calculationValidator.validateNonNegative(volumePositive, 'Positive volume'),
      volumeNegative: this.calculationValidator.validateNonNegative(volumeNegative, 'Negative volume'),
      ratio,
      cutsInterior,
    };
  }

  private splitTetrahedron(
    tetrahedron: [Point, Point, Point, Point],
    axis: CoordinateAxis,
  ): { positive: number; negative: number } {
    const total = this.geometry.tetrahedronVolume(
      tetrahedron[0],
      tetrahedron[1],
      tetrahedron[2],
      tetrahedron[3],
    );
    const positiveVertices: Point[] = [];
    const negativeVertices: Point[] = [];
    const zeroVertices: Point[] = [];
    tetrahedron.forEach((vertex) => {
      const sign = this.geometry.sign(this.coord(vertex, axis));
      if (sign > 0) {
        positiveVertices.push(vertex);
      } else if (sign < 0) {
        negativeVertices.push(vertex);
      } else {
        zeroVertices.push(vertex);
      }
    });
    if (negativeVertices.length === 0) {
      return { positive: total, negative: 0 };
    }
    if (positiveVertices.length === 0) {
      return { positive: 0, negative: total };
    }
    // Always compute the smaller cap, then get the other side by subtraction.
    if (positiveVertices.length <= negativeVertices.length) {
      const positive = this.capVolume(axis, positiveVertices, negativeVertices, zeroVertices);
      const clamped = Math.min(Math.max(positive, 0), total);
      return { positive: clamped, negative: total - clamped };
    }
    const negative = this.capVolume(axis, negativeVertices, positiveVertices, zeroVertices);
    const clamped = Math.min(Math.max(negative, 0), total);
    return { positive: total - clamped, negative: clamped };
  }

  /** Volume of the polyhedron on the `near` side of the plane (axis = 0). */
  private capVolume(
    axis: CoordinateAxis,
    near: Point[],
    far: Point[],
    zero: Point[],
  ): number {
    if (near.length === 1 && far.length === 3) {
      const hits = far.map((vertex) => this.intersect(axis, near[0], vertex));
      return this.geometry.tetrahedronVolume(near[0], hits[0], hits[1], hits[2]);
    }
    if (near.length === 1 && far.length === 2 && zero.length === 1) {
      const hits = far.map((vertex) => this.intersect(axis, near[0], vertex));
      return this.geometry.tetrahedronVolume(near[0], zero[0], hits[0], hits[1]);
    }
    if (near.length === 1 && far.length === 1 && zero.length === 2) {
      const hit = this.intersect(axis, near[0], far[0]);
      return this.geometry.tetrahedronVolume(near[0], zero[0], zero[1], hit);
    }
    if (near.length === 2 && far.length === 2) {
      const a = near[0];
      const b = near[1];
      const c = far[0];
      const d = far[1];
      const ac = this.intersect(axis, a, c);
      const ad = this.intersect(axis, a, d);
      const bc = this.intersect(axis, b, c);
      const bd = this.intersect(axis, b, d);
      return this.geometry.tetrahedronVolume(a, ac, ad, b)
        + this.geometry.tetrahedronVolume(ac, ad, bd, b)
        + this.geometry.tetrahedronVolume(ac, bc, bd, b);
    }
    return 0;
  }

  private intersect(axis: CoordinateAxis, from: Point, to: Point): Point {
    return this.geometry.interpolateToZero(from, to, this.coord(from, axis), this.coord(to, axis));
  }

  private coord(point: Point, axis: CoordinateAxis): number {
    if (axis === 'x') {
      return point.getX();
    }
    if (axis === 'y') {
      return point.getY();
    }
    return point.getZ();
  }

  private planeNormal(plane: CoordinatePlane): CoordinateAxis {
    if (plane === 'XY') {
      return 'z';
    }
    if (plane === 'XZ') {
      return 'y';
    }
    return 'x';
  }

  private baseHeight(pyramid: Pyramid): number {
    const base = this.toParsed(pyramid.getBasePoints());
    const constantAxis = this.dataValidator.findConstantAxis(base);
    if (constantAxis === null) {
      return 0;
    }
    return Math.abs(this.coord(pyramid.getApex(), constantAxis) - base[0][constantAxis]);
  }

  private toTetrahedra(pyramid: Pyramid): [Point, Point, Point, Point][] {
    const orderedBase = this.orderedBase(pyramid);
    const apex = pyramid.getApex();
    return [
      [orderedBase[0], orderedBase[1], orderedBase[2], apex],
      [orderedBase[0], orderedBase[2], orderedBase[3], apex],
    ];
  }

  private orderedBase(pyramid: Pyramid): Point[] {
    const base = pyramid.getBasePoints();
    const parsed = this.toParsed(base);
    const constantAxis = this.dataValidator.findConstantAxis(parsed);
    const varying = (['x', 'y', 'z'] as CoordinateAxis[]).filter((axis) => axis !== constantAxis);
    const firstValues = this.geometry.uniqueSorted(parsed.map((point) => point[varying[0]]));
    const secondValues = this.geometry.uniqueSorted(parsed.map((point) => point[varying[1]]));
    const findCorner = (first: number, second: number): Point => {
      const found = base.find((point) => {
        const parsedPoint = this.toParsed([point])[0];
        return this.geometry.areAlmostEqual(parsedPoint[varying[0]], first)
          && this.geometry.areAlmostEqual(parsedPoint[varying[1]], second);
      });
      return found ?? base[0];
    };
    return [
      findCorner(firstValues[0], secondValues[0]),
      findCorner(firstValues[1], secondValues[0]),
      findCorner(firstValues[1], secondValues[1]),
      findCorner(firstValues[0], secondValues[1]),
    ];
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

  private toParsed(points: Point[]): ParsedPointCoordinates[] {
    return points.map((point) => ({
      x: point.getX(),
      y: point.getY(),
      z: point.getZ(),
    }));
  }
}
