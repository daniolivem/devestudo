import {
    createMentorshipRequest,
    findExistingMentorship,
    findMentorshipById,
    findMentorshipsForUser,
    updateMentorshipStatus,
} from '../repositories/mentorship.repository.js';
import { findUserById } from '../repositories/group.repository.js';
import { validateMentorshipRating } from './feature-checks.service.js';

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const ACTIVE_MENTORSHIP_STATUSES = ['REQUESTED', 'APPROVED'];

export async function listMentorshipsService(userId) {
    const user = await findUserById(userId);

    if (!user) {
        throw fail('Usuário não encontrado', 404);
    }

    return findMentorshipsForUser(userId);
}

export async function createMentorshipRequestService(studentId, mentorId, message) {
    if (!studentId || !mentorId) {
        throw fail('Aluno e mentor são obrigatórios', 400);
    }

    if (message !== undefined && message !== null && typeof message !== 'string') {
        throw fail('A mensagem da mentoria deve ser texto', 400);
    }

    const normalizedMessage = typeof message === 'string' ? message.trim() : null;

    if (normalizedMessage && normalizedMessage.length > 500) {
        throw fail('A mensagem da mentoria deve ter no máximo 500 caracteres', 400);
    }

    const student = await findUserById(studentId);
    const mentor = await findUserById(mentorId);

    if (!student) {
        throw fail('Estudante não encontrado', 404);
    }

    if (!mentor) {
        throw fail('Mentor não encontrado', 404);
    }

    if (student.role !== 'STUDENT') {
        throw fail('Apenas estudantes podem solicitar mentoria', 403);
    }

    if (mentor.role !== 'MENTOR') {
        throw fail('O usuário informado não é um mentor', 400);
    }

    const existing = await findExistingMentorship(mentorId, studentId);

    if (existing && ACTIVE_MENTORSHIP_STATUSES.includes(existing.status)) {
        throw fail('Já existe uma solicitação de mentoria ativa para esse mentor', 409);
    }

    return createMentorshipRequest({
        mentorId,
        studentId,
        message: normalizedMessage,
        status: 'REQUESTED',
    });
}

export async function updateMentorshipStatusService(userId, mentorshipId, status) {
    const mentorship = await findMentorshipById(mentorshipId);

    if (!mentorship) {
        throw fail('Solicitação de mentoria não encontrada', 404);
    }

    if (mentorship.mentorId !== userId && mentorship.studentId !== userId) {
        throw fail('Apenas usuários envolvidos na mentoria podem alterar o status', 403);
    }

    if (!['APPROVED', 'CANCELLED', 'COMPLETED'].includes(status)) {
        throw fail('Status inválido para a mentoria', 400);
    }

    if (['APPROVED', 'COMPLETED'].includes(status) && mentorship.mentorId !== userId) {
        throw fail('Apenas o mentor pode aprovar ou concluir a mentoria', 403);
    }

    if (mentorship.status === 'COMPLETED' && status !== 'COMPLETED') {
        throw fail('Mentorias concluídas não podem ter o status alterado', 400);
    }

    return updateMentorshipStatus(mentorshipId, { status });
}

export async function evaluateMentorshipService(userId, mentorshipId, payload = {}) {
    const mentorship = await findMentorshipById(mentorshipId);

    if (!mentorship) {
        throw fail('Solicitação de mentoria não encontrada', 404);
    }

    if (mentorship.mentorId !== userId && mentorship.studentId !== userId) {
        throw fail('Apenas usuários envolvidos podem avaliar esta mentoria', 403);
    }

    if (!['APPROVED', 'COMPLETED'].includes(mentorship.status)) {
        throw fail('A mentoria só pode ser avaliada após aprovação', 400);
    }

    const { rating, comment } = payload;
    validateMentorshipRating({ rating, comment });

    return updateMentorshipStatus(mentorshipId, {
        rating,
        comment: comment ? comment.trim() : null,
        status: 'COMPLETED',
    });
}

export async function evaluateMentorshipFromBodyService(userId, payload = {}) {
    const mentorshipId = payload.mentorshipId || payload.mentoriaId || payload.id;

    if (mentorshipId) {
        return evaluateMentorshipService(userId, mentorshipId, payload);
    }

    if (!payload.mentorId) {
        throw fail('Informe o id da mentoria ou o id do mentor', 400);
    }

    const mentorships = await findMentorshipsForUser(userId);
    const evaluable = mentorships.find(
        (mentorship) =>
            mentorship.studentId === userId &&
            mentorship.mentorId === payload.mentorId &&
            ['APPROVED', 'COMPLETED'].includes(mentorship.status)
    );

    if (!evaluable) {
        throw fail('Mentoria elegível para avaliação não encontrada', 404);
    }

    return evaluateMentorshipService(userId, evaluable.id, payload);
}
