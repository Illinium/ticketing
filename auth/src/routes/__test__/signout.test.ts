import request from 'supertest';
import { app } from '../../app';

it('clears a cookie after signing out', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
        })
        .expect(201);

    const responce = await request(app)
        .post('/api/users/signout')
        .send()
        .expect(200);

    // console.log(responce.get('Set-Cookie')[0]);

    expect(responce.get('Set-Cookie')[0]).toEqual(
        'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
    );
});
