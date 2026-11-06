export type RoomType = 'standard' | 'deluxe' | 'suite';

export class Room {
  private available = true;

  constructor(
    private readonly number: string,
    private readonly type: RoomType,
    private readonly pricePerNight: number,
  ) {}

  getNumber(): string {
    return this.number;
  }

  getType(): RoomType {
    return this.type;
  }

  getPricePerNight(): number {
    return this.pricePerNight;
  }

  isAvailable(): boolean {
    return this.available;
  }

  reserve(): void {
    this.available = false;
  }

  release(): void {
    this.available = true;
  }
}
