import express, { Request, Response } from 'express';
import {
    NotFoundError,
    requireAuth,
    NotAutorizedError,
    OrderStatus,
} from '@atrex/common';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCancelledPublicher } from '../events/publishers/order-cancelled-publisher';

const router = express.Router();

router.delete(
    '/api/orders/:orderId',
    requireAuth,
    async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.orderId).populate(
            'ticket'
        );

        if (!order) {
            throw new NotFoundError();
        }

        if (req.currentUser!.id !== order.userId) {
            throw new NotAutorizedError();
        }

        order.status = OrderStatus.Cancelled;
        await order.save();

        // Publishin an event this was cancelled
        new OrderCancelledPublicher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            },
        });

        res.status(204).send(order);
    }
);

export { router as deleteOrderRouter };
