import request from "supertest";
import { app } from "../app";

export const authHelper = async () => {
        const response = await request(app)
            .post('/api/users/signup')
            .send({
                email: "test@test.com",
                password: "password"
            }).expect(201);
        return response.get('Set-Cookie');
}