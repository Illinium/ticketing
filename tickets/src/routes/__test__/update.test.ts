import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { authHelper } from '../../test/auth-helper';
import { natsWrapper } from '../../__mocks__/nats-wrapper';

it('returns a 404 if provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', authHelper())
        .send({
            title: 'dhnkldhkld',
            price: 40,
        })
        .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'dhnkldhkld',
            price: 40,
        })
        .expect(401);
});

it('returns a 401 if the user does not ticket owner', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', authHelper())
        .send({
            title: 'dhnkldhkld',
            price: 40,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', authHelper())
        .send({
            title: 'dhnkldhkld',
            price: 30,
        })
        .expect(401);
});

it('returns a 400 if the user provide an invalide title or price', async () => {
    const cookie = authHelper();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'dhnkldhkld',
            price: 40,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 50,
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: -50,
        })
        .expect(400);
});

it('updates the ticket with provided valide inputs', async () => {
    const cookie = authHelper();
    const title = 'new title';
    const price = 50;
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'dhnkldhkld',
            price: 40,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title,
            price,
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});

it('publishes an event', async () => {
    const cookie = authHelper();
    const title = 'new title';
    const price = 50;
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'dhnkldhkld',
            price: 40,
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title,
            price,
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled;
});

it('rejects updates if the ticket is reserved', async () => {
    const cookie = authHelper();
    const title = 'new title';
    const price = 50;
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'dhnkldhkld',
            price: 40,
        });

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title,
            price,
        })
        .expect(400);
});
