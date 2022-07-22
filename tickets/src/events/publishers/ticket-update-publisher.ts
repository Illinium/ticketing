import { Publisher, Subjects, TicketUpdatedEvent } from '@atrex/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
