import { BookingException } from '../exceptions/BookingException';
import { BookingStatus } from './BookingStatus';
import type { BookingState } from './BookingState';

export class CheckedOutState implements BookingState {
  getStatus(): BookingStatus {
    return BookingStatus.CheckedOut;
  }

  confirm(): void {
    throw new BookingException('Cannot confirm: booking already checked out');
  }

  cancel(): void {
    throw new BookingException('Cannot cancel: booking already checked out');
  }

  checkIn(): void {
    throw new BookingException('Cannot check in: booking already checked out');
  }

  checkOut(): void {
    throw new BookingException('Guest already checked out');
  }
}
