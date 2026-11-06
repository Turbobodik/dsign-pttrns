import { createHotelSystem } from '../src/composition';
import { BookingException } from '../src/exceptions/BookingException';
import { BookingStatus } from '../src/state/BookingStatus';

describe('HotelBookingFacade', () => {
  it('books a room and leaves it in New status', () => {
    const { facade } = createHotelSystem();
    const summary = facade.bookRoom({
      guestName: 'Alice',
      guestEmail: 'alice@example.com',
      roomNumber: '101',
      checkInDate: new Date('2026-11-10'),
      checkOutDate: new Date('2026-11-13'),
    });

    expect(summary.id).toBe('B-001');
    expect(summary.status).toBe(BookingStatus.New);
    expect(summary.totalPrice).toBe(240);
    expect(facade.listAvailableRooms().map((r) => r.getNumber())).not.toContain('101');
  });

  it('confirms booking, charges payment and notifies guest', () => {
    const { facade, payments, notifications } = createHotelSystem();
    const created = facade.bookRoom({
      guestName: 'Alice',
      guestEmail: 'alice@example.com',
      roomNumber: '101',
      checkInDate: new Date('2026-11-10'),
      checkOutDate: new Date('2026-11-12'),
    });

    const confirmed = facade.confirmBooking(created.id);

    expect(confirmed.status).toBe(BookingStatus.Confirmed);
    expect(payments.getRecords()).toEqual([
      { bookingId: 'B-001', amount: 160, type: 'charge' },
    ]);
    expect(notifications.getSent().some((n) => n.subject === 'Booking confirmed')).toBe(true);
  });

  it('cancels a confirmed booking with refund and frees the room', () => {
    const { facade, payments } = createHotelSystem();
    const created = facade.bookRoom({
      guestName: 'Bob',
      guestEmail: 'bob@example.com',
      roomNumber: '202',
      checkInDate: new Date('2026-12-01'),
      checkOutDate: new Date('2026-12-03'),
    });
    facade.confirmBooking(created.id);

    const cancelled = facade.cancelBooking(created.id);

    expect(cancelled.status).toBe(BookingStatus.Cancelled);
    expect(payments.getRecords()).toContainEqual({
      bookingId: 'B-001',
      amount: 240,
      type: 'refund',
    });
    expect(facade.listAvailableRooms().map((r) => r.getNumber())).toContain('202');
  });

  it('cancels a new booking without refund', () => {
    const { facade, payments } = createHotelSystem();
    const created = facade.bookRoom({
      guestName: 'Bob',
      guestEmail: 'bob@example.com',
      roomNumber: '202',
      checkInDate: new Date('2026-12-01'),
      checkOutDate: new Date('2026-12-02'),
    });

    facade.cancelBooking(created.id);

    expect(payments.getRecords()).toHaveLength(0);
    expect(facade.listAvailableRooms().map((r) => r.getNumber())).toContain('202');
  });

  it('supports check-in and check-out through facade', () => {
    const { facade } = createHotelSystem();
    const created = facade.bookRoom({
      guestName: 'Alice',
      guestEmail: 'alice@example.com',
      roomNumber: '303',
      checkInDate: new Date('2026-11-10'),
      checkOutDate: new Date('2026-11-11'),
    });
    facade.confirmBooking(created.id);

    expect(facade.checkIn(created.id).status).toBe(BookingStatus.CheckedIn);
    expect(facade.checkOut(created.id).status).toBe(BookingStatus.CheckedOut);
    expect(facade.listAvailableRooms().map((r) => r.getNumber())).toContain('303');
  });

  it('rejects booking unavailable room or invalid dates', () => {
    const { facade } = createHotelSystem();
    facade.bookRoom({
      guestName: 'Alice',
      guestEmail: 'alice@example.com',
      roomNumber: '101',
      checkInDate: new Date('2026-11-10'),
      checkOutDate: new Date('2026-11-11'),
    });

    expect(() => facade.bookRoom({
      guestName: 'Bob',
      guestEmail: 'bob@example.com',
      roomNumber: '101',
      checkInDate: new Date('2026-11-12'),
      checkOutDate: new Date('2026-11-13'),
    })).toThrow(BookingException);

    expect(() => facade.bookRoom({
      guestName: 'Carol',
      guestEmail: 'carol@example.com',
      roomNumber: '202',
      checkInDate: new Date('2026-11-12'),
      checkOutDate: new Date('2026-11-12'),
    })).toThrow(BookingException);
  });

  it('propagates illegal state transitions from State', () => {
    const { facade } = createHotelSystem();
    const created = facade.bookRoom({
      guestName: 'Alice',
      guestEmail: 'alice@example.com',
      roomNumber: '101',
      checkInDate: new Date('2026-11-10'),
      checkOutDate: new Date('2026-11-11'),
    });

    expect(() => facade.checkIn(created.id)).toThrow(BookingException);
  });
});
