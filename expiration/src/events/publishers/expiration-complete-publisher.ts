import { Subjects, Publisher, ExpirationCompleteEvent } from '@atrex/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
