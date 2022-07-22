import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEvent } from '@atrex/common';
import { OrderStatus } from '../../../models/order';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'test ticket',
        price: 500,
        id: new mongoose.Types.ObjectId().toHexString(),
    });

    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'dkhdkjh',
        expiresAt: new Date(),
        ticket,
    });

    await order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id,
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, msg, data, order, ticket };
};

it('updates the order status to cannceled', async () => {
    const { listener, msg, data, order } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit the OrderCancelled event', async () => {
    const { listener, msg, data, order } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );
    console.log(eventData, '<- eventData, Order.id ->', order.id);

    expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
    const { listener, msg, data } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
