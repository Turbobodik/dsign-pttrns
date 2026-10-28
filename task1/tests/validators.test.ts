import { CalculationException } from '../src/exceptions/CalculationException';
import { STRICT_NUMBER_PATTERN } from '../src/constants/regex';
import { createTestContext } from './helpers';

describe('Validators and constants', () => {
  const ctx = createTestContext();

  test('strict number pattern accepts decimals and rejects mixed letters', () => {
    expect(STRICT_NUMBER_PATTERN.test('1.0')).toBe(true);
    expect(STRICT_NUMBER_PATTERN.test('-3.5')).toBe(true);
    expect(STRICT_NUMBER_PATTERN.test('.5')).toBe(true);
    expect(STRICT_NUMBER_PATTERN.test('2a.0')).toBe(false);
    expect(STRICT_NUMBER_PATTERN.test('1.0.0')).toBe(false);
    expect(ctx.numberValidator.isNumberToken('4')).toBeTruthy();
    expect(ctx.numberValidator.parseNumber('3.25')).toBeCloseTo(3.25);
  });

  test('calculation validator accepts positive values and throws a custom exception otherwise', () => {
    expect(ctx.calculationValidator.validatePositive(4, 'area')).toBe(4);
    expect(ctx.calculationValidator.validateNonNegative(0, 'volume')).toBe(0);
    expect(() => ctx.calculationValidator.validatePositive(0, 'area')).toThrow(CalculationException);
    expect(() => ctx.calculationValidator.validatePositive(-1, 'area')).toThrow(CalculationException);
    expect(() => ctx.calculationValidator.validateRatio(Number.NaN, 'ratio')).toThrow(CalculationException);
  });

  test('geometry helpers compare distances and uniqueness', () => {
    expect(ctx.geometry.areAlmostEqual(1, 1 + 1e-10)).toBe(true);
    expect(ctx.geometry.isNearlyZero(0)).toBe(true);
    expect(ctx.geometry.sign(-4)).toBe(-1);
    expect(ctx.geometry.sign(0)).toBe(0);
    expect(ctx.geometry.uniqueSorted([2, 2.0000000001, 1, 1])).toHaveLength(2);
    expect(ctx.geometry.uniqueSorted([2, 2.0000000001, 1, 1])[0]).toBeCloseTo(1);
  });
});
