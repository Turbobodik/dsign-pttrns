import { Booking } from '../src/entities/Booking';
import { Guest } from '../src/entities/Guest';
import { Room } from '../src/entities/Room';
import { BookingException } from '../src/exceptions/BookingException';
import { BookingStatus } from '../src/state/BookingStatus';

function createBooking(): Booking {
  return new Booking(
    'B-001',
    new Guest('Alice', 'alice@example.com'),
    new Room('101', 'standard', 80),
    new Date('2026-11-10'),
    new Date('2026-11-12'),
    160,
  );
}

describe('Booking State lifecycle', () => {
  it('starts in New and moves New → Confirmed → CheckedIn → CheckedOut', () => {
    const booking = createBooking();
    expect(booking.getStatus()).toBe(BookingStatus.New);

    booking.confirm();
    expect(booking.getStatus()).toBe(BookingStatus.Confirmed);

    booking.checkIn();
    expect(booking.getStatus()).toBe(BookingStatus.CheckedIn);

    booking.checkOut();
    expect(booking.getStatus()).toBe(BookingStatus.CheckedOut);
  });

  it('allows cancel from New', () => {
    const booking = createBooking();
    booking.cancel();
    expect(booking.getStatus()).toBe(BookingStatus.Cancelled);
  });

  it('allows cancel from Confirmed', () => {
    const booking = createBooking();
    booking.confirm();
    booking.cancel();
    expect(booking.getStatus()).toBe(BookingStatus.Cancelled);
  });

  it('rejects check-in from New', () => {
    const booking = createBooking();
    expect(() => booking.checkIn()).toThrow(BookingException);
  });

  it('rejects cancel after check-in', () => {
    const booking = createBooking();
    booking.confirm();
    booking.checkIn();
    expect(() => booking.cancel()).toThrow(BookingException);
  });

  it('rejects transitions from Cancelled', () => {
    const booking = createBooking();
    booking.cancel();
    expect(() => booking.confirm()).toThrow(BookingException);
    expect(() => booking.checkIn()).toThrow(BookingException);
    expect(() => booking.checkOut()).toThrow(BookingException);
  });

  it('rejects transitions from CheckedOut', () => {
    const booking = createBooking();
    booking.confirm();
    booking.checkIn();
    booking.checkOut();
    expect(() => booking.confirm()).toThrow(BookingException);
    expect(() => booking.cancel()).toThrow(BookingException);
    expect(() => booking.checkIn()).toThrow(BookingException);
  });
});
