import { Pyramid } from '../entities/Pyramid';
import { Shape } from '../entities/Shape';
import { Triangle } from '../entities/Triangle';
import { Geometry } from '../geometry/Geometry';
import type { Observer } from '../observer/Observer';
import { PyramidMetrics } from '../services/PyramidMetrics';
import { TriangleMetrics } from '../services/TriangleMetrics';
import { ShapeParameters } from './ShapeParameters';

/**
 * Singleton observer that keeps area / perimeter / volume / surface area
 * for every registered shape and recalculates them on each update.
 */
export class Warehouse implements Observer {
  private static instance: Warehouse | null = null;

  private readonly parametersById = new Map<string, ShapeParameters>();

  private readonly triangleMetrics: TriangleMetrics;

  private readonly pyramidMetrics: PyramidMetrics;

  private constructor(geometry: Geometry = new Geometry()) {
    this.triangleMetrics = new TriangleMetrics(geometry);
    this.pyramidMetrics = new PyramidMetrics(geometry);
  }

  static getInstance(): Warehouse {
    if (Warehouse.instance === null) {
      Warehouse.instance = new Warehouse();
    }
    return Warehouse.instance;
  }

  /** Test helper — clears the singleton between suites. */
  static resetInstance(): void {
    Warehouse.instance = null;
  }

  update(shape: Shape): void {
    this.parametersById.set(shape.getId(), this.compute(shape));
  }

  remove(shapeId: string): void {
    this.parametersById.delete(shapeId);
  }

  getParameters(shapeId: string): ShapeParameters | undefined {
    return this.parametersById.get(shapeId);
  }

  has(shapeId: string): boolean {
    return this.parametersById.has(shapeId);
  }

  size(): number {
    return this.parametersById.size;
  }

  private compute(shape: Shape): ShapeParameters {
    if (shape instanceof Triangle) {
      return new ShapeParameters(
        this.triangleMetrics.calculateArea(shape),
        this.triangleMetrics.calculatePerimeter(shape),
        null,
        null,
      );
    }
    if (shape instanceof Pyramid) {
      return new ShapeParameters(
        null,
        null,
        this.pyramidMetrics.calculateVolume(shape),
        this.pyramidMetrics.calculateSurfaceArea(shape),
      );
    }
    return new ShapeParameters(null, null, null, null);
  }
}
