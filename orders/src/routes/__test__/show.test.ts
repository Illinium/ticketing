import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { authHelper } from '../../test/auth-helper';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';

it('fetches the order', async () => {
    // Create a ticket
    const ticket = Ticket.build({
        title: 'new Ticket',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();

    const user = authHelper();

    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    // make a request to fetch the order

    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another users order', async () => {
    // Create a ticket
    const ticket = Ticket.build({
        title: 'new Ticket',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();

    const user = authHelper();

    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    // make a request to fetch the order

    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', authHelper())
        .send()
        .expect(401);
});
