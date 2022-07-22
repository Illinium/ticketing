import express, { Request, Response } from 'express';
import {body} from 'express-validator';
import Jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { BadRequsetError, validateRequest } from '@atrex/common';

const router = express.Router();

router.post('/api/users/signup', [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({min: 6, max: 20}).withMessage('Password must be between 6 and 20 characters!')
],
validateRequest,
 async (req: Request, res: Response) => {
    const {email, password} = req.body;
    const existingUser = await User.findOne({email});
    if (existingUser) {
        throw new BadRequsetError('Email in use!')
    }

    const user = User.build({email, password});
    await user.save();

    // Generate JWT
    const userJwt = Jwt.sign({
        id: user.id,
        email: user.email
    }, process.env.JWT_KEY!);
    // Store Jwt in session object
    req.session = {jwt: userJwt};

    res.status(201).send(user);
});

export {router as signupRouter};