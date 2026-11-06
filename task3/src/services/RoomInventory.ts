import type { Room } from '../entities/Room';
import { BookingException } from '../exceptions/BookingException';

export class RoomInventory {
  private readonly rooms = new Map<string, Room>();

  addRoom(room: Room): void {
    this.rooms.set(room.getNumber(), room);
  }

  getRoom(number: string): Room {
    const room = this.rooms.get(number);
    if (!room) {
      throw new BookingException(`Room ${number} not found`);
    }
    return room;
  }

  findAvailable(number: string): Room {
    const room = this.getRoom(number);
    if (!room.isAvailable()) {
      throw new BookingException(`Room ${number} is not available`);
    }
    return room;
  }

  listAvailable(): Room[] {
    return [...this.rooms.values()].filter((room) => room.isAvailable());
  }
}
