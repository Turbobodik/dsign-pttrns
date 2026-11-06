export interface PaymentRecord {
  bookingId: string;
  amount: number;
  type: 'charge' | 'refund';
}

export class PaymentService {
  private readonly records: PaymentRecord[] = [];

  charge(bookingId: string, amount: number): void {
    this.records.push({ bookingId, amount, type: 'charge' });
  }

  refund(bookingId: string, amount: number): void {
    this.records.push({ bookingId, amount, type: 'refund' });
  }

  getRecords(): readonly PaymentRecord[] {
    return this.records;
  }

  wasCharged(bookingId: string): boolean {
    return this.records.some((r) => r.bookingId === bookingId && r.type === 'charge');
  }
}
