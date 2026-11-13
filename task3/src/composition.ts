import { Room } from './entities/Room';
import { HotelBookingFacade } from './facade/HotelBookingFacade';
import { BookingRepository } from './services/BookingRepository';
import { NotificationService } from './services/NotificationService';
import { PaymentService } from './services/PaymentService';
import { RoomInventory } from './services/RoomInventory';

export interface HotelSystem {
  facade: HotelBookingFacade;
  payments: PaymentService;
  notifications: NotificationService;
}

export function createHotelSystem(): HotelSystem {
  const inventory = new RoomInventory();
  inventory.addRoom(new Room('101', 'standard', 80));
  inventory.addRoom(new Room('202', 'deluxe', 120));
  inventory.addRoom(new Room('303', 'suite', 200));

  const payments = new PaymentService();
  const notifications = new NotificationService();
  const repository = new BookingRepository();
  const facade = new HotelBookingFacade(inventory, payments, notifications, repository);

  return { facade, payments, notifications };
}
