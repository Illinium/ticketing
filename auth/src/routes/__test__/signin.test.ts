import request from "supertest";
import { app } from "../../app";

it("return 400, invalid credentials when email doesn't exist", async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: "test@test.com",
            password: "password"
        }).expect(400);
});

it("fails when an incorrect password is supplied", async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "password"
        }).expect(201);

    await request(app)
        .post('/api/users/signin')
        .send({
            email: "test@test.com",
            password: "passwordsss"
        }).expect(400);
});

it("responds with a cookie when provide a valid credentials", async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: "test@test.com",
            password: "password"
        }).expect(201);

    const responce = await request(app)
        .post('/api/users/signin')
        .send({
            email: "test@test.com",
            password: "password"
        }).expect(200);

        expect(responce.get('Set-Cookie')).toBeDefined();
});