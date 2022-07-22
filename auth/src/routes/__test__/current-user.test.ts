import request from "supertest";
import { app } from "../../app";
import { authHelper } from "../../test/auth-helper";

it("responds with details about current user", async () => {
    const cookie = await authHelper();

    const resp = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', cookie)
        .send().expect(200);

        expect(resp.body.currentUser.email).toEqual("test@test.com");
});

it("you are not autorized", async () => {
    const response = await request(app)
        .get('/api/users/currentuser')
        .send().expect(401);
    // console.log(response.body.errors[0].message);
    expect(response.body.errors[0].message).toEqual("You are not autorized!");
});