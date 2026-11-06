import { createHotelSystem } from './composition';

function main(): void {
  const { facade, payments, notifications } = createHotelSystem();

  console.log('Available rooms:', facade.listAvailableRooms().map((r) => r.getNumber()));

  const created = facade.bookRoom({
    guestName: 'Alice',
    guestEmail: 'alice@example.com',
    roomNumber: '101',
    checkInDate: new Date('2026-11-10'),
    checkOutDate: new Date('2026-11-13'),
  });
  console.log('Booked (new):', created);

  const confirmed = facade.confirmBooking(created.id);
  console.log('Confirmed:', confirmed);
  console.log('Payments:', payments.getRecords());

  const checkedIn = facade.checkIn(created.id);
  console.log('Checked in:', checkedIn);

  const checkedOut = facade.checkOut(created.id);
  console.log('Checked out:', checkedOut);
  console.log('Available again:', facade.listAvailableRooms().map((r) => r.getNumber()));

  const other = facade.bookRoom({
    guestName: 'Bob',
    guestEmail: 'bob@example.com',
    roomNumber: '202',
    checkInDate: new Date('2026-12-01'),
    checkOutDate: new Date('2026-12-03'),
  });
  facade.confirmBooking(other.id);
  const cancelled = facade.cancelBooking(other.id);
  console.log('Cancelled after confirm:', cancelled);
  console.log('Refunds:', payments.getRecords().filter((p) => p.type === 'refund'));
  console.log('Notifications sent:', notifications.getSent().length);
}

main();
