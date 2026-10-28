import { Triangle } from '../src/entities/Triangle';
import { Point } from '../src/entities/Point';
import { CalculationException } from '../src/exceptions/CalculationException';
import { createTestContext } from './helpers';

describe('Triangle', () => {
  const ctx = createTestContext();

  test('creates a 3-4-5 right triangle and computes area with perimeter', () => {
    const triangle = ctx.triangleFactory.createFromLine('right-345 0.0 0.0 3.0 0.0 0.0 4.0');
    expect(triangle).not.toBeNull();
    expect(triangle).toBeInstanceOf(Triangle);
    expect(triangle?.getId()).toBe('right-345');
    expect(triangle?.getPoints()).toHaveLength(3);
    expect(ctx.triangleService.isTriangle(triangle as Triangle)).toBe(true);
    expect(ctx.triangleService.calculateArea(triangle as Triangle)).toBeCloseTo(6, 6);
    expect(ctx.triangleService.calculatePerimeter(triangle as Triangle)).toBeCloseTo(12, 6);
    expect(ctx.triangleService.isRight(triangle as Triangle)).toBeTruthy();
    expect(ctx.triangleService.isAcute(triangle as Triangle)).toBeFalsy();
    expect(ctx.triangleService.isObtuse(triangle as Triangle)).toBeFalsy();
  });

  test('detects equilateral and isosceles properties', () => {
    const triangle = ctx.triangleFactory.createFromLine(
      'equilateral 0.0 0.0 2.0 0.0 1.0 1.73205080757',
    ) as Triangle;
    expect(ctx.triangleService.isEquilateral(triangle)).toBe(true);
    expect(ctx.triangleService.isIsosceles(triangle)).toBe(true);
    expect(ctx.triangleService.isRight(triangle)).toBe(false);
    expect(ctx.triangleService.isAcute(triangle)).toBe(true);
    expect(ctx.triangleService.calculateArea(triangle)).toBeCloseTo(Math.sqrt(3), 5);
    expect(ctx.triangleService.calculatePerimeter(triangle)).toBeCloseTo(6, 5);
  });

  test('classifies an obtuse scalene triangle', () => {
    const triangle = ctx.triangleFactory.createFromLine('obtuse 0.0 0.0 3.0 0.0 4.0 1.0') as Triangle;
    expect(ctx.triangleService.isObtuse(triangle)).toBe(true);
    expect(ctx.triangleService.isRight(triangle)).toBe(false);
    expect(ctx.triangleService.isAcute(triangle)).toBe(false);
    expect(ctx.triangleService.isEquilateral(triangle)).toBe(false);
    expect(ctx.triangleService.isIsosceles(triangle)).toBe(false);
    expect(ctx.triangleService.calculateArea(triangle)).toBeGreaterThan(0);
    expect(ctx.triangleService.calculatePerimeter(triangle)).toBeGreaterThan(8);
  });

  test('classifies an isosceles acute triangle that is not equilateral', () => {
    const triangle = ctx.triangleFactory.createFromLine('isosceles 0.0 0.0 4.0 0.0 2.0 3.0') as Triangle;
    expect(ctx.triangleService.isIsosceles(triangle)).toBe(true);
    expect(ctx.triangleService.isEquilateral(triangle)).toBe(false);
    expect(ctx.triangleService.isAcute(triangle)).toBe(true);
    expect(ctx.triangleService.isRight(triangle)).toBe(false);
    expect(ctx.triangleService.calculateArea(triangle)).toBeCloseTo(6, 6);
  });

  test('skips invalid source lines instead of creating objects', () => {
    expect(ctx.triangleFactory.createFromLine('bad 1.0 2a.0 3.0 4.0 5.0 6.0')).toBeNull();
    expect(ctx.triangleFactory.createFromLine('short 1.0 2.0')).toBeNull();
    expect(ctx.triangleFactory.createFromLine('collinear 0.0 0.0 1.0 0.0 2.0 0.0')).toBeNull();
    expect(ctx.triangleFactory.createFromLine('extra 0.0 0.0 1.0 0.0 0.0 1.0 9.0')).toBeNull();
    expect(ctx.triangleDataValidator.hasValidTokenCount(['id', '1', '2'])).toBe(false);
    expect(ctx.triangleDataValidator.formsTriangle(0, 0, 1, 0, 2, 0)).toBe(false);
  });

  test('rejects a degenerate triangle when computing area', () => {
    const degenerate = new Triangle(
      'degen',
      new Point('a', 0, 0, 0),
      new Point('b', 1, 0, 0),
      new Point('c', 2, 0, 0),
    );
    expect(ctx.triangleService.isTriangle(degenerate)).toBe(false);
    expect(() => ctx.triangleService.calculateArea(degenerate)).toThrow(CalculationException);
    expect(() => ctx.triangleService.calculatePerimeter(degenerate)).not.toThrow();
  });
});
