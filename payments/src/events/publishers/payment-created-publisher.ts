import { Subjects, Publisher, PaymentCreatedEvent } from '@atrex/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}
