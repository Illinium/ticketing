import request from 'supertest';
import { app } from '../../app';
import { authHelper } from '../../test/auth-helper';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../__mocks__/nats-wrapper';

it('has a route handler listening to /api/tickets for POST request', async () => {
    const response = await request(app).post('/api/tickets').send({});

    expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
    await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns a status other than 401 if the user is signed in ', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', authHelper())
        .send({});

    expect(response.status).not.toEqual(401);
});

it('returns an error if invalide title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', authHelper())
        .send({
            title: '',
            price: 10,
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', authHelper())
        .send({
            price: 10,
        })
        .expect(400);
});

it('returns an error if invalide price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', authHelper())
        .send({
            title: 'Test title',
            price: -10,
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', authHelper())
        .send({
            title: 'Test title',
        })
        .expect(400);
});

it('creates a ticket with a valide inputs', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = 'dklhj';

    await request(app)
        .post('/api/tickets')
        .set('Cookie', authHelper())
        .send({
            title,
            price: 20,
        })
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(20);
    expect(tickets[0].title).toEqual(title);
});

it('publishes an event', async () => {
    const title = 'dklhj';

    await request(app)
        .post('/api/tickets')
        .set('Cookie', authHelper())
        .send({
            title,
            price: 20,
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled;
});
