import { Geometry } from '../src/geometry/Geometry';
import { PyramidMetrics } from '../src/services/PyramidMetrics';
import { TriangleMetrics } from '../src/services/TriangleMetrics';
import { rightTriangle, unitPyramid } from './helpers';

describe('Shape metrics', () => {
  const geometry = new Geometry();

  it('computes triangle area and perimeter', () => {
    const metrics = new TriangleMetrics(geometry);
    const triangle = rightTriangle();

    expect(metrics.calculateArea(triangle)).toBeCloseTo(6, 8);
    expect(metrics.calculatePerimeter(triangle)).toBeCloseTo(12, 8);
    expect(metrics.calculateArea(triangle)).toBeGreaterThan(0);
  });

  it('computes pyramid volume and surface area', () => {
    const metrics = new PyramidMetrics(geometry);
    const pyramid = unitPyramid();

    expect(metrics.calculateVolume(pyramid)).toBeCloseTo(4, 8);
    expect(metrics.calculateSurfaceArea(pyramid)).toBeGreaterThan(4);
    expect(metrics.calculateVolume(pyramid)).toBeLessThan(10);
  });
});
