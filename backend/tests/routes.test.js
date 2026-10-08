import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import 'dotenv/config';

import app from '../src/app.js';
import { generateToken } from '../src/utils/jwt.js';

const protectedRoutes = [
    ['GET', '/api/users'],
    ['GET', '/api/profile'],
    ['PUT', '/api/profile'],
    ['PUT', '/api/profile/password'],
    ['GET', '/api/mentors'],
    ['PUT', '/api/mentors/profile'],
    ['GET', '/api/groups'],
    ['POST', '/api/groups'],
    ['POST', '/api/groups/participar'],
    ['PATCH', '/api/groups/aprovar'],
    ['GET', '/api/mentorships'],
    ['POST', '/api/mentorships'],
    ['PATCH', '/api/mentorships/00000000-0000-0000-0000-000000000000/status'],
    ['POST', '/api/mentorships/00000000-0000-0000-0000-000000000000/avaliar'],
    ['GET', '/api/categories'],
    ['POST', '/api/categories'],
    ['PUT', '/api/categories/00000000-0000-0000-0000-000000000000'],
    ['DELETE', '/api/categories/00000000-0000-0000-0000-000000000000'],
];

test('health route is available', async () => {
    const response = await request(app).get('/api');

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { message: 'API working' });
});

test('register rejects missing required fields', async () => {
    const response = await request(app)
        .post('/api/auth/register')
        .send({});

    assert.equal(response.status, 400);
});

test('login rejects malformed JSON', async () => {
    const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{');

    assert.equal(response.status, 400);
});

for (const [method, path] of protectedRoutes) {
    test(`${method} ${path} requires authentication`, async () => {
        const response = await request(app)[method.toLowerCase()](path);

        assert.equal(response.status, 401);
    });
}

const tokenFor = (role) => generateToken({
    id: '00000000-0000-0000-0000-000000000001',
    role,
});

const roleDeniedRoutes = [
    ['GET', '/api/users', 'STUDENT'],
    ['PUT', '/api/mentors/profile', 'STUDENT'],
    ['POST', '/api/groups', 'STUDENT'],
    ['PUT', '/api/categories/00000000-0000-0000-0000-000000000000', 'STUDENT'],
    ['POST', '/api/mentorships', 'ADMIN'],
];

for (const [method, path, role] of roleDeniedRoutes) {
    test(`${method} ${path} rejects authenticated ${role}`, async () => {
        const response = await request(app)
            [method.toLowerCase()](path)
            .set('Authorization', `Bearer ${tokenFor(role)}`);

        assert.equal(response.status, 403);
    });
}
