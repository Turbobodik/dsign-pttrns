import type { Guest } from './Guest';
import type { Room } from './Room';
import type { BookingState } from '../state/BookingState';
import type { BookingStatus } from '../state/BookingStatus';
import { NewState } from '../state/NewState';

export class Booking {
  private state: BookingState = new NewState();

  constructor(
    private readonly id: string,
    private readonly guest: Guest,
    private readonly room: Room,
    private readonly checkInDate: Date,
    private readonly checkOutDate: Date,
    private readonly totalPrice: number,
  ) {}

  getId(): string {
    return this.id;
  }

  getGuest(): Guest {
    return this.guest;
  }

  getRoom(): Room {
    return this.room;
  }

  getCheckInDate(): Date {
    return this.checkInDate;
  }

  getCheckOutDate(): Date {
    return this.checkOutDate;
  }

  getTotalPrice(): number {
    return this.totalPrice;
  }

  getStatus(): BookingStatus {
    return this.state.getStatus();
  }

  changeState(state: BookingState): void {
    this.state = state;
  }

  confirm(): void {
    this.state.confirm(this);
  }

  cancel(): void {
    this.state.cancel(this);
  }

  checkIn(): void {
    this.state.checkIn(this);
  }

  checkOut(): void {
    this.state.checkOut(this);
  }
}
