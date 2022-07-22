import { Publisher, OrderCancelledEvent, Subjects } from '@atrex/common';

export class OrderCancelledPublicher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}
