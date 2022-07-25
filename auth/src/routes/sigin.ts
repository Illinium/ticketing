import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import Jwt from 'jsonwebtoken';

import { BadRequsetError, validateRequest } from '@atrex/common';
import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

router.post(
    '/api/users/signin',
    [
        body('email').isEmail().withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a password!'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            throw new BadRequsetError('Invalid credentials');
        }
        const passwordsMatch = await Password.compare(
            existingUser.password,
            password
        );
        if (!passwordsMatch) {
            throw new BadRequsetError('Invalid credentials');
        }
        // Generate JWT
        const userJwt = Jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email,
            },
            process.env.JWT_KEY!
        );
        // Store Jwt in session object here
        req.session = { jwt: userJwt };

        res.status(200).send(existingUser);
    }
);

export { router as signinRouter };
