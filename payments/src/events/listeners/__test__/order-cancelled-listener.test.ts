import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledEvent, OrderStatus } from '@atrex/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        userId: 'sghdljkh',
        status: OrderStatus.Created,
    });

    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'hpjhpeo',
        },
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg, order };
};

it('updates status of the order', async () => {
    const { listener, data, msg, order } = await setup();

    await listener.onMessage(data, msg);

    const cancelledOrder = await Order.findById(order.id);
    expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
