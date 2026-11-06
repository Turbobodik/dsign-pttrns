import type { Booking } from '../entities/Booking';
import { BookingException } from '../exceptions/BookingException';
import { BookingStatus } from './BookingStatus';
import type { BookingState } from './BookingState';
import { CancelledState } from './CancelledState';
import { ConfirmedState } from './ConfirmedState';

export class NewState implements BookingState {
  getStatus(): BookingStatus {
    return BookingStatus.New;
  }

  confirm(booking: Booking): void {
    booking.changeState(new ConfirmedState());
  }

  cancel(booking: Booking): void {
    booking.changeState(new CancelledState());
  }

  checkIn(): void {
    throw new BookingException('Cannot check in: booking is not confirmed');
  }

  checkOut(): void {
    throw new BookingException('Cannot check out: booking is not checked in');
  }
}
