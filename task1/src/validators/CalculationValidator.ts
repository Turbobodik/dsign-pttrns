import { Geometry } from '../geometry/Geometry';
import { CalculationException } from '../exceptions/CalculationException';

export class CalculationValidator {
  constructor(private readonly geometry: Geometry) {}

  validatePositive(value: number, label: string): number {
    if (!Number.isFinite(value) || value <= 0) {
      throw new CalculationException(`${label} must be a positive finite number, got ${value}`);
    }
    return value;
  }

  validateNonNegative(value: number, label: string): number {
    if (!Number.isFinite(value) || value < 0) {
      throw new CalculationException(`${label} must be a non-negative finite number, got ${value}`);
    }
    return value;
  }

  validateRatio(value: number, label: string): number {
    if (!Number.isFinite(value) || this.geometry.isNearlyZero(value) || value < 0) {
      throw new CalculationException(`${label} must be a positive finite number, got ${value}`);
    }
    return value;
  }
}
