import type { Booking } from '../entities/Booking';
import { BookingException } from '../exceptions/BookingException';
import { BookingStatus } from './BookingStatus';
import type { BookingState } from './BookingState';
import { CheckedOutState } from './CheckedOutState';

export class CheckedInState implements BookingState {
  getStatus(): BookingStatus {
    return BookingStatus.CheckedIn;
  }

  confirm(): void {
    throw new BookingException('Cannot confirm: guest already checked in');
  }

  cancel(): void {
    throw new BookingException('Cannot cancel: guest already checked in');
  }

  checkIn(): void {
    throw new BookingException('Guest is already checked in');
  }

  checkOut(booking: Booking): void {
    booking.changeState(new CheckedOutState());
  }
}
