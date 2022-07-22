import express, { Request, Response } from 'express';
import { NotAutorizedError, NotFoundError, requireAuth } from '@atrex/common';
import { Order } from '../models/order';

const router = express.Router();

router.get(
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

        res.send(order);
    }
);

export { router as showOrderRouter };
