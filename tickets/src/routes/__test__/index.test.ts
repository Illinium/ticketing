import request from "supertest";
import { app } from "../../app";
import {authHelper} from "../../test/auth-helper";

const createTicket = () => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', authHelper())
        .send({
            title: 'fhjfklh',
            price: 30
        });
}

it('can fetch a list of tickets',async () => {
    await createTicket();
    await createTicket();
    await createTicket();

    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);

    expect(response.body.length).toEqual(3)
})