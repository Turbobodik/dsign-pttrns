import { Booking } from '../entities/Booking';
import { Guest } from '../entities/Guest';
import type { Room } from '../entities/Room';
import { BookingException } from '../exceptions/BookingException';
import type { BookingRepository } from '../services/BookingRepository';
import type { NotificationService } from '../services/NotificationService';
import type { PaymentService } from '../services/PaymentService';
import type { RoomInventory } from '../services/RoomInventory';
import { BookingStatus } from '../state/BookingStatus';

export interface BookRoomRequest {
  guestName: string;
  guestEmail: string;
  roomNumber: string;
  checkInDate: Date;
  checkOutDate: Date;
}

export interface BookingSummary {
  id: string;
  guestName: string;
  roomNumber: string;
  status: BookingStatus;
  totalPrice: number;
  checkInDate: Date;
  checkOutDate: Date;
}

/**
 * Facade: единая точка входа для клиента.
 * Скрывает inventory, payment, notifications, repository и переходы State.
 */
export class HotelBookingFacade {
  constructor(
    private readonly inventory: RoomInventory,
    private readonly payments: PaymentService,
    private readonly notifications: NotificationService,
    private readonly repository: BookingRepository,
  ) {}

  bookRoom(request: BookRoomRequest): BookingSummary {
    this.assertValidDates(request.checkInDate, request.checkOutDate);

    const room = this.inventory.findAvailable(request.roomNumber);
    const nights = this.countNights(request.checkInDate, request.checkOutDate);
    const totalPrice = nights * room.getPricePerNight();
    const guest = new Guest(request.guestName, request.guestEmail);
    const id = this.repository.nextBookingId();

    room.reserve();
    const booking = new Booking(
      id,
      guest,
      room,
      request.checkInDate,
      request.checkOutDate,
      totalPrice,
    );
    this.repository.add(booking);

    this.notifications.notify(
      guest.getEmail(),
      'Booking created',
      `Booking ${id} for room ${room.getNumber()} is pending confirmation.`,
    );

    return this.toSummary(booking);
  }

  confirmBooking(bookingId: string): BookingSummary {
    const booking = this.repository.get(bookingId);
    booking.confirm();
    this.payments.charge(booking.getId(), booking.getTotalPrice());
    this.notifications.notify(
      booking.getGuest().getEmail(),
      'Booking confirmed',
      `Booking ${bookingId} is confirmed. Amount charged: ${booking.getTotalPrice()}.`,
    );
    return this.toSummary(booking);
  }

  cancelBooking(bookingId: string): BookingSummary {
    const booking = this.repository.get(bookingId);
    const previousStatus = booking.getStatus();
    booking.cancel();
    booking.getRoom().release();

    if (previousStatus === BookingStatus.Confirmed && this.payments.wasCharged(bookingId)) {
      this.payments.refund(bookingId, booking.getTotalPrice());
    }

    this.notifications.notify(
      booking.getGuest().getEmail(),
      'Booking cancelled',
      `Booking ${bookingId} has been cancelled.`,
    );
    return this.toSummary(booking);
  }

  checkIn(bookingId: string): BookingSummary {
    const booking = this.repository.get(bookingId);
    booking.checkIn();
    this.notifications.notify(
      booking.getGuest().getEmail(),
      'Checked in',
      `Welcome! Booking ${bookingId}, room ${booking.getRoom().getNumber()}.`,
    );
    return this.toSummary(booking);
  }

  checkOut(bookingId: string): BookingSummary {
    const booking = this.repository.get(bookingId);
    booking.checkOut();
    booking.getRoom().release();
    this.notifications.notify(
      booking.getGuest().getEmail(),
      'Checked out',
      `Thank you for staying. Booking ${bookingId} is closed.`,
    );
    return this.toSummary(booking);
  }

  getBooking(bookingId: string): BookingSummary {
    return this.toSummary(this.repository.get(bookingId));
  }

  listAvailableRooms(): Room[] {
    return this.inventory.listAvailable();
  }

  private assertValidDates(checkIn: Date, checkOut: Date): void {
    if (checkOut.getTime() <= checkIn.getTime()) {
      throw new BookingException('Check-out date must be after check-in date');
    }
  }

  private countNights(checkIn: Date, checkOut: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay);
  }

  private toSummary(booking: Booking): BookingSummary {
    return {
      id: booking.getId(),
      guestName: booking.getGuest().getName(),
      roomNumber: booking.getRoom().getNumber(),
      status: booking.getStatus(),
      totalPrice: booking.getTotalPrice(),
      checkInDate: booking.getCheckInDate(),
      checkOutDate: booking.getCheckOutDate(),
    };
  }
}
