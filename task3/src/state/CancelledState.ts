import { BookingException } from '../exceptions/BookingException';
import { BookingStatus } from './BookingStatus';
import type { BookingState } from './BookingState';

export class CancelledState implements BookingState {
  getStatus(): BookingStatus {
    return BookingStatus.Cancelled;
  }

  confirm(): void {
    throw new BookingException('Cannot confirm: booking is cancelled');
  }

  cancel(): void {
    throw new BookingException('Booking is already cancelled');
  }

  checkIn(): void {
    throw new BookingException('Cannot check in: booking is cancelled');
  }

  checkOut(): void {
    throw new BookingException('Cannot check out: booking is cancelled');
  }
}
