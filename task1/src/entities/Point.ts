/** Immutable 3D point; planar figures use z = 0. */
export class Point {
  constructor(
    private readonly id: string,
    private readonly x: number,
    private readonly y: number,
    private readonly z: number = 0,
  ) {}

  getId(): string {
    return this.id;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getZ(): number {
    return this.z;
  }

  /** Human-readable position, e.g. `A(1, 2, 0)`. */
  describe(): string {
    return `${this.id}(${this.x}, ${this.y}, ${this.z})`;
  }
}
