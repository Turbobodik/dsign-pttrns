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
}
