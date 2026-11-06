import type { Booking } from '../entities/Booking';
import { BookingException } from '../exceptions/BookingException';

export class BookingRepository {
  private readonly bookings = new Map<string, Booking>();
  private nextId = 1;

  nextBookingId(): string {
    const id = `B-${String(this.nextId).padStart(3, '0')}`;
    this.nextId += 1;
    return id;
  }

  add(booking: Booking): void {
    this.bookings.set(booking.getId(), booking);
  }

  get(id: string): Booking {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new BookingException(`Booking ${id} not found`);
    }
    return booking;
  }

  find(id: string): Booking | undefined {
    return this.bookings.get(id);
  }

  all(): Booking[] {
    return [...this.bookings.values()];
  }

  size(): number {
    return this.bookings.size;
  }
}
