import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { authHelper } from '../../test/auth-helper';
import { Ticket } from '../../models/ticket';

const buildTicket = async (title: string, price: number) => {
    const ticket = Ticket.build({
        title,
        price,
        id: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();
    return ticket;
};

it('fetches orders for the particular user', async () => {
    // Create three tickets
    const ticketOne = await buildTicket('Ticket one', 20);
    const ticketTwo = await buildTicket('Ticket two', 30);
    const ticketThree = await buildTicket('Ticket three', 50);

    const userOne = authHelper();
    const userTwo = authHelper();
    // Create one order as User #1
    await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticketOne.id })
        .expect(201);
    // Create two orders as User #2
    const { body: responseOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketTwo.id })
        .expect(201);

    const { body: responseTwo } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketThree.id })
        .expect(201);
    // Make request to get orders for User #2

    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .expect(200);
    // Make sure we only got the orders for User #2
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(responseOne.id);
    expect(response.body[1].id).toEqual(responseTwo.id);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
