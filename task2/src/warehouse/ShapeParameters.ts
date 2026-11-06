/** Cached geometric measures for a shape stored in the Warehouse. */
export class ShapeParameters {
  constructor(
    private readonly area: number | null,
    private readonly perimeter: number | null,
    private readonly volume: number | null,
    private readonly surfaceArea: number | null,
  ) {}

  getArea(): number | null {
    return this.area;
  }

  getPerimeter(): number | null {
    return this.perimeter;
  }

  getVolume(): number | null {
    return this.volume;
  }

  getSurfaceArea(): number | null {
    return this.surfaceArea;
  }
}
