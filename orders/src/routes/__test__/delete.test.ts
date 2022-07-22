import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { authHelper } from '../../test/auth-helper';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('marks an order as cancelled', async () => {
    // Create a ticket with Ticket Model
    const ticket = Ticket.build({
        title: 'Concert',
        price: 800,
        id: new mongoose.Types.ObjectId().toHexString(),
    });

    await ticket.save();

    const user = authHelper();

    // Make a request to create an order
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    // make a request to cancelled the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    // expectation to make sure the thing is cancelled
    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits a order cancelled event', async () => {
    // Create a ticket with Ticket Model
    const ticket = Ticket.build({
        title: 'Concert',
        price: 800,
        id: new mongoose.Types.ObjectId().toHexString(),
    });

    await ticket.save();

    const user = authHelper();

    // Make a request to create an order
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    // make a request to cancelled the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
