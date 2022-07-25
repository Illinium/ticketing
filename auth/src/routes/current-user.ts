import express from 'express';
import { currentUser } from '@atrex/common';
import { requireAuth } from '@atrex/common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, requireAuth, (req, res) => {
    res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
