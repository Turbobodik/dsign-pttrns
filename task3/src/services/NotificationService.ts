export interface Notification {
  email: string;
  subject: string;
  body: string;
}

export class NotificationService {
  private readonly sent: Notification[] = [];

  notify(email: string, subject: string, body: string): void {
    this.sent.push({ email, subject, body });
  }

  getSent(): readonly Notification[] {
    return this.sent;
  }
}
