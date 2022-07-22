import request from "supertest";
import { app } from "../../app";

it('returns 201 on successful signup', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: "test@newtest.com",
            password: "testpassword"
        }).expect(201);
});

it('return 400, invalid email', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: "test",
            password: "testpassword"
        }).expect(400);
});

it('return 400, invalid password', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: "test@newtest.com",
            password: "shj"
        }).expect(400);
});

it('return 400, missing email or password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'asher'
        }).expect(400);
    
    await request(app)
        .post('/api/users/signup')
        .send({
            password: 'a'
        }).expect(400);
});

it('check email duplicating', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@newtest.com",
            password: "testpassword"
        }).expect(201);
    
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@newtest.com",
            password: "testpassword"
        }).expect(400);
});

it('sets a cookie after successful signup', async () => {
    const responce = await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@newtest.com",
            password: "shjgkhlh;"
        }).expect(201);

    expect(responce.get('Set-Cookie')).toBeDefined();
});