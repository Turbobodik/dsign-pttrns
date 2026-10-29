import { Point } from '../entities/Point';
import { Pyramid } from '../entities/Pyramid';
import { Triangle } from '../entities/Triangle';

/** Readable 3D layout of a triangle for logs. */
export function describeTrianglePoints(triangle: Triangle): {
  A: string;
  B: string;
  C: string;
  all: string;
} {
  const A = triangle.getFirstPoint().describe();
  const B = triangle.getSecondPoint().describe();
  const C = triangle.getThirdPoint().describe();
  return {
    A,
    B,
    C,
    all: `${A} → ${B} → ${C}`,
  };
}

/** Readable 3D layout of a pyramid for logs. */
export function describePyramidPoints(pyramid: Pyramid): {
  base: string[];
  apex: string;
  all: string;
} {
  const base = pyramid.getBasePoints().map((point: Point) => point.describe());
  const apex = pyramid.getApex().describe();
  return {
    base,
    apex,
    all: `base[${base.join(' | ')}] apex=${apex}`,
  };
}
