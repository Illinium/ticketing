import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { authHelper } from '../../test/auth-helper';
import { Order } from '../../models/order';
import { OrderStatus } from '@atrex/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

// jest.mock('../../stripe');

it('returns a 404 if purchasing the order that does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', authHelper())
        .send({
            token: 'flkjhe',
            orderId: new mongoose.Types.ObjectId().toHexString(),
        })
        .expect(404);
});

it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', authHelper())
        .send({
            token: 'flkjhe',
            orderId: order.id,
        })
        .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled,
        userId,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', authHelper(userId))
        .send({
            token: 'flkjhe',
            orderId: order.id,
        })
        .expect(400);
});

it('returns 204 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price,
        status: OrderStatus.Created,
        userId,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', authHelper(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id,
        })
        .expect(201);

    // console.log((stripe.charges.create as jest.Mock).mock.calls);

    // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    // expect(chargeOptions.source).toEqual('tok_visa');
    // expect(chargeOptions.amount).toEqual(2000);
    // expect(chargeOptions.currency).toEqual('usd');

    const stripeCharges = await stripe.charges.list({ limit: 50 });
    const stripeCharge = stripeCharges.data.find((charge) => {
        return charge.amount === price * 100;
    });

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd');

    const payment = Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id,
    });

    expect(payment).not.toBeNull();
});
