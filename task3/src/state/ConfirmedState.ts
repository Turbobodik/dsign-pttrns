import type { Booking } from '../entities/Booking';
import { BookingException } from '../exceptions/BookingException';
import { BookingStatus } from './BookingStatus';
import type { BookingState } from './BookingState';
import { CancelledState } from './CancelledState';
import { CheckedInState } from './CheckedInState';

export class ConfirmedState implements BookingState {
  getStatus(): BookingStatus {
    return BookingStatus.Confirmed;
  }

  confirm(): void {
    throw new BookingException('Booking is already confirmed');
  }

  cancel(booking: Booking): void {
    booking.changeState(new CancelledState());
  }

  checkIn(booking: Booking): void {
    booking.changeState(new CheckedInState());
  }

  checkOut(): void {
    throw new BookingException('Cannot check out: guest has not checked in');
  }
}
