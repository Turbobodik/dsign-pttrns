import type { Booking } from '../entities/Booking';
import type { BookingStatus } from './BookingStatus';

export interface BookingState {
  getStatus(): BookingStatus;
  confirm(booking: Booking): void;
  cancel(booking: Booking): void;
  checkIn(booking: Booking): void;
  checkOut(booking: Booking): void;
}
