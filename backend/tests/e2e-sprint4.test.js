import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import bcrypt from 'bcrypt';
import 'dotenv/config';

import app from '../src/app.js';
import prisma from '../src/config/database.js';

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const password = 'Senha1234';
const studentEmail = `student.e2e.${suffix}@example.com`;
const mentorEmail = `mentor.e2e.${suffix}@example.com`;
const adminEmail = `admin.e2e.${suffix}@example.com`;
const extraUserEmail = `extra.e2e.${suffix}@example.com`;
const createdEmails = [studentEmail, mentorEmail, adminEmail, extraUserEmail];
const createdCategoryIds = [];

async function registerAndLogin(email, name, role = 'STUDENT') {
    const register = await request(app)
        .post('/api/auth/register')
        .send({ name, email, password, confirmPassword: password, role });

    assert.equal(register.status, 201, JSON.stringify(register.body));

    const login = await request(app)
        .post('/api/auth/login')
        .send({ email, password });

    assert.equal(login.status, 200, JSON.stringify(login.body));
    assert.ok(login.body.token);
    assert.equal(login.body.user.email, email);

    return { token: login.body.token, user: login.body.user };
}

async function createAdminAndLogin() {
    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
        data: {
            name: 'Admin E2E',
            email: adminEmail,
            password: passwordHash,
            role: 'ADMIN',
        },
    });

    const login = await request(app)
        .post('/api/auth/login')
        .send({ email: adminEmail, password });

    assert.equal(login.status, 200, JSON.stringify(login.body));

    return { token: login.body.token, user: { ...login.body.user, id: admin.id } };
}

test('Sprint 4 integration: auth, groups, mentorship, categories and Prisma', { timeout: 180000 }, async () => {
    try {
        // ------------------------------------------------------------
        // Conectividade com o banco e criptografia bcrypt
        // ------------------------------------------------------------
        const [{ ok }] = await prisma.$queryRaw`SELECT 1 AS ok`;
        assert.equal(Number(ok), 1);

        const student = await registerAndLogin(studentEmail, 'Aluno E2E', 'STUDENT');
        const mentor = await registerAndLogin(mentorEmail, 'Mentor E2E', 'MENTOR');

        const studentDb = await prisma.user.findUnique({ where: { email: studentEmail } });
        const mentorDb = await prisma.user.findUnique({ where: { email: mentorEmail } });

        assert.ok(studentDb);
        assert.ok(mentorDb);
        assert.notEqual(studentDb.password, password);
        assert.equal(await bcrypt.compare(password, studentDb.password), true);
        assert.equal(await bcrypt.compare(password, mentorDb.password), true);

        const weakPassword = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Senha Fraca',
                email: `weak.e2e.${suffix}@example.com`,
                password: '123',
                confirmPassword: '123',
                role: 'STUDENT',
            });
        assert.equal(weakPassword.status, 400);

        const duplicate = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Duplicado', email: studentEmail, password, confirmPassword: password, role: 'STUDENT' });
        assert.equal(duplicate.status, 409);

        // ------------------------------------------------------------
        // Autenticação obrigatória e RBAC
        // ------------------------------------------------------------
        const anonymousGroups = await request(app).get('/api/groups');
        assert.equal(anonymousGroups.status, 401);
        assert.equal(anonymousGroups.body.success, false);

        const studentCreatesGroup = await request(app)
            .post('/api/groups')
            .set('Authorization', `Bearer ${student.token}`)
            .send({ name: 'Grupo bloqueado' });
        assert.equal(studentCreatesGroup.status, 403);

        // ------------------------------------------------------------
        // Grupos: GET real, criação, entrada PENDING, aprovação, edição e exclusão
        // ------------------------------------------------------------
        const listBefore = await request(app)
            .get('/api/groups')
            .set('Authorization', `Bearer ${student.token}`);
        assert.equal(listBefore.status, 200);
        assert.ok(Array.isArray(listBefore.body));

        const createGroup = await request(app)
            .post('/api/groups')
            .set('Authorization', `Bearer ${mentor.token}`)
            .send({
                name: `Grupo E2E ${suffix}`,
                description: 'Grupo criado pelo teste de integração',
                technology: 'JavaScript',
                level: 'Iniciante',
                availability: 'Seg-Sex noite',
                materialsUrl: 'https://example.com/materiais',
            });
        assert.equal(createGroup.status, 201, JSON.stringify(createGroup.body));
        assert.equal(createGroup.body.group.name, `Grupo E2E ${suffix}`);
        assert.equal(createGroup.body.group.availability, 'Seg-Sex noite');

        const groupId = createGroup.body.group.id;
        const groupDb = await prisma.group.findUnique({ where: { id: groupId } });
        assert.ok(groupDb);
        assert.equal(groupDb.creatorId, mentor.user.id);
        assert.equal(groupDb.availability, 'Seg-Sex noite');

        const join = await request(app)
            .post('/api/groups/participar')
            .set('Authorization', `Bearer ${student.token}`)
            .send({ groupId });
        assert.equal(join.status, 201, JSON.stringify(join.body));
        assert.equal(join.body.membership.status, 'PENDING');

        const joinAgain = await request(app)
            .post('/api/groups/participar')
            .set('Authorization', `Bearer ${student.token}`)
            .send({ groupId });
        assert.equal(joinAgain.status, 409);

        const membershipPending = await prisma.groupMember.findUnique({
            where: { userId_groupId: { userId: student.user.id, groupId } },
        });
        assert.equal(membershipPending.status, 'PENDING');

        const studentApproves = await request(app)
            .patch('/api/groups/aprovar')
            .set('Authorization', `Bearer ${student.token}`)
            .send({ groupId, memberId: membershipPending.id, status: 'APPROVED' });
        assert.equal(studentApproves.status, 403);

        const approve = await request(app)
            .patch('/api/groups/aprovar')
            .set('Authorization', `Bearer ${mentor.token}`)
            .send({ groupId, memberId: membershipPending.id, status: 'APPROVED' });
        assert.equal(approve.status, 200, JSON.stringify(approve.body));
        assert.equal(approve.body.membership.status, 'APPROVED');

        const membershipApproved = await prisma.groupMember.findUnique({
            where: { userId_groupId: { userId: student.user.id, groupId } },
        });
        assert.equal(membershipApproved.status, 'APPROVED');

        const listWithMember = await request(app)
            .get('/api/groups')
            .set('Authorization', `Bearer ${student.token}`);
        const listedGroup = listWithMember.body.find((group) => group.id === groupId);
        assert.ok(listedGroup);
        assert.equal(listedGroup.members.length, 1);
        assert.equal(listedGroup.members[0].user.id, student.user.id);

        const leave = await request(app)
            .post('/api/groups/leave')
            .set('Authorization', `Bearer ${student.token}`)
            .send({ groupId });
        assert.equal(leave.status, 200, JSON.stringify(leave.body));

        const membershipAfterLeave = await prisma.groupMember.findUnique({
            where: { userId_groupId: { userId: student.user.id, groupId } },
        });
        assert.equal(membershipAfterLeave, null);

        const updateGroup = await request(app)
            .put(`/api/groups/${groupId}`)
            .set('Authorization', `Bearer ${mentor.token}`)
            .send({ name: `Grupo E2E atualizado ${suffix}`, availability: 'Fim de semana' });
        assert.equal(updateGroup.status, 200, JSON.stringify(updateGroup.body));
        assert.equal(updateGroup.body.group.name, `Grupo E2E atualizado ${suffix}`);
        assert.equal(updateGroup.body.group.availability, 'Fim de semana');

        const groupUpdatedDb = await prisma.group.findUnique({ where: { id: groupId } });
        assert.equal(groupUpdatedDb.availability, 'Fim de semana');

        // Reentrada e remoção de membro pelo mentor
        const rejoin = await request(app)
            .post('/api/groups/join')
            .set('Authorization', `Bearer ${student.token}`)
            .send({ groupId });
        assert.equal(rejoin.status, 201);

        const rejoinMembership = await prisma.groupMember.findUnique({
            where: { userId_groupId: { userId: student.user.id, groupId } },
        });

        const removeMember = await request(app)
            .post('/api/groups/remove')
            .set('Authorization', `Bearer ${mentor.token}`)
            .send({ groupId, memberId: rejoinMembership.id });
        assert.equal(removeMember.status, 200, JSON.stringify(removeMember.body));

        const removedMembership = await prisma.groupMember.findUnique({
            where: { userId_groupId: { userId: student.user.id, groupId } },
        });
        assert.equal(removedMembership, null);

        const deleteGroup = await request(app)
            .delete(`/api/groups/${groupId}`)
            .set('Authorization', `Bearer ${mentor.token}`);
        assert.equal(deleteGroup.status, 200, JSON.stringify(deleteGroup.body));

        const deletedGroup = await prisma.group.findUnique({ where: { id: groupId } });
        assert.equal(deletedGroup, null);

        // ------------------------------------------------------------
        // Mentoria: solicitação real, aprovação e avaliação via /mentorias/avaliar
        // ------------------------------------------------------------
        const requestMentorship = await request(app)
            .post('/api/mentorships')
            .set('Authorization', `Bearer ${student.token}`)
            .send({ mentorId: mentor.user.id, message: 'Quero revisar meu projeto.' });
        assert.equal(requestMentorship.status, 201, JSON.stringify(requestMentorship.body));
        assert.equal(requestMentorship.body.mentorship.status, 'REQUESTED');
        assert.equal(requestMentorship.body.mentorship.message, 'Quero revisar meu projeto.');

        const mentorshipId = requestMentorship.body.mentorship.id;

        const duplicateMentorship = await request(app)
            .post('/api/mentorships')
            .set('Authorization', `Bearer ${student.token}`)
            .send({ mentorId: mentor.user.id });
        assert.equal(duplicateMentorship.status, 409);

        const mentorList = await request(app)
            .get('/api/mentorships')
            .set('Authorization', `Bearer ${mentor.token}`);
        assert.equal(mentorList.status, 200);
        assert.ok(mentorList.body.some((item) => item.id === mentorshipId));

        const studentApprovesMentorship = await request(app)
            .patch(`/api/mentorships/${mentorshipId}/status`)
            .set('Authorization', `Bearer ${student.token}`)
            .send({ status: 'APPROVED' });
        assert.equal(studentApprovesMentorship.status, 403);

        const approveMentorship = await request(app)
            .patch(`/api/mentorships/${mentorshipId}/status`)
            .set('Authorization', `Bearer ${mentor.token}`)
            .send({ status: 'APPROVED' });
        assert.equal(approveMentorship.status, 200, JSON.stringify(approveMentorship.body));

        const invalidRating = await request(app)
            .post('/api/mentorias/avaliar')
            .set('Authorization', `Bearer ${student.token}`)
            .send({ mentorshipId, rating: 6, comment: 'Nota inválida' });
        assert.equal(invalidRating.status, 400);

        const evaluate = await request(app)
            .post('/api/mentorias/avaliar')
            .set('Authorization', `Bearer ${student.token}`)
            .send({ mentorshipId, rating: 5, comment: 'Excelente mentoria' });
        assert.equal(evaluate.status, 200, JSON.stringify(evaluate.body));
        assert.equal(evaluate.body.mentorship.status, 'COMPLETED');
        assert.equal(evaluate.body.mentorship.rating, 5);

        const mentorshipDb = await prisma.mentorship.findUnique({ where: { id: mentorshipId } });
        assert.equal(mentorshipDb.status, 'COMPLETED');
        assert.equal(mentorshipDb.rating, 5);
        assert.equal(mentorshipDb.comment, 'Excelente mentoria');

        const mentors = await request(app)
            .get('/api/mentors')
            .set('Authorization', `Bearer ${student.token}`);
        assert.equal(mentors.status, 200);
        const mentorItem = mentors.body.find((item) => item.id === mentor.user.id);
        assert.ok(mentorItem);
        assert.equal(mentorItem.rating, 5);
        assert.equal(mentorItem.sessions, 1);

        // ------------------------------------------------------------
        // Categorias: CRUD com JWT de admin e vínculo com thread
        // ------------------------------------------------------------
        const admin = await createAdminAndLogin();

        const categoryName = `E2E Tech ${suffix}`;
        const createCategory = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ name: categoryName });
        assert.equal(createCategory.status, 201, JSON.stringify(createCategory.body));
        const categoryId = createCategory.body.category.id;
        createdCategoryIds.push(categoryId);

        const duplicateCategory = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ name: categoryName });
        assert.equal(duplicateCategory.status, 409);

        const updateCategory = await request(app)
            .put(`/api/categories/${categoryId}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ name: `${categoryName} atualizada` });
        assert.equal(updateCategory.status, 200, JSON.stringify(updateCategory.body));

        const categoryDb = await prisma.category.findUnique({ where: { id: categoryId } });
        assert.equal(categoryDb.name, `${categoryName} atualizada`);

        const createThread = await request(app)
            .post('/api/threads')
            .set('Authorization', `Bearer ${student.token}`)
            .send({
                title: `Tópico E2E ${suffix}`,
                content: 'Conteúdo do tópico de integração.',
                tags: [`${categoryName} atualizada`],
            });
        assert.equal(createThread.status, 201, JSON.stringify(createThread.body));
        const threadId = createThread.body.id;

        const deleteLinkedCategory = await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set('Authorization', `Bearer ${admin.token}`);
        assert.equal(deleteLinkedCategory.status, 409);

        const deleteThread = await request(app)
            .delete(`/api/threads/${threadId}`)
            .set('Authorization', `Bearer ${student.token}`);
        assert.equal(deleteThread.status, 200);

        const deleteCategory = await request(app)
            .delete(`/api/categories/${categoryId}`)
            .set('Authorization', `Bearer ${admin.token}`);
        assert.equal(deleteCategory.status, 200, JSON.stringify(deleteCategory.body));

        const deletedCategory = await prisma.category.findUnique({ where: { id: categoryId } });
        assert.equal(deletedCategory, null);

        // ------------------------------------------------------------
        // Administração de usuários
        // ------------------------------------------------------------
        const listUsers = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${admin.token}`);
        assert.equal(listUsers.status, 200);
        assert.ok(listUsers.body.some((item) => item.email === studentEmail));

        const blockStudent = await request(app)
            .put(`/api/users/${student.user.id}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ isBlocked: true });
        assert.equal(blockStudent.status, 200, JSON.stringify(blockStudent.body));
        assert.equal(blockStudent.body.user.isBlocked, true);

        const blockedSession = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${student.token}`);
        assert.equal(blockedSession.status, 403);

        const unblockStudent = await request(app)
            .put(`/api/users/${student.user.id}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ isBlocked: false });
        assert.equal(unblockStudent.status, 200);

        const updateStudent = await request(app)
            .put(`/api/users/${student.user.id}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ name: 'Aluno E2E Atualizado' });
        assert.equal(updateStudent.status, 200);
        assert.equal(updateStudent.body.user.name, 'Aluno E2E Atualizado');

        const createUser = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({
                name: 'Usuário Extra E2E',
                email: extraUserEmail,
                password,
                role: 'STUDENT',
            });
        assert.equal(createUser.status, 201, JSON.stringify(createUser.body));

        const deleteUser = await request(app)
            .delete(`/api/users/${createUser.body.user.id}`)
            .set('Authorization', `Bearer ${admin.token}`);
        assert.equal(deleteUser.status, 200);

        const selfDelete = await request(app)
            .delete(`/api/users/${admin.user.id}`)
            .set('Authorization', `Bearer ${admin.token}`);
        assert.equal(selfDelete.status, 400);

        // ------------------------------------------------------------
        // Tratamento de 4xx e rota inexistente
        // ------------------------------------------------------------
        const notFound = await request(app).get('/api/rota-inexistente');
        assert.equal(notFound.status, 404);
        assert.equal(notFound.body.success, false);

        const malformedJson = await request(app)
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send('{');
        assert.equal(malformedJson.status, 400);
        assert.equal(malformedJson.body.success, false);
    } finally {
        await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
        await prisma.thread.deleteMany({ where: { title: { contains: `E2E ${suffix}` } } });
        await prisma.user.deleteMany({ where: { email: { in: createdEmails } } });
        await prisma.$disconnect();
    }
});
