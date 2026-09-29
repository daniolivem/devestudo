import {
    createMentorshipRequest,
    findExistingMentorship,
    findMentorshipById,
    findMentorshipsForUser,
    updateMentorshipStatus,
} from '../repositories/mentorship.repository.js';
import { findUserById } from '../repositories/group.repository.js';
import { validateMentorshipRating } from './feature-checks.service.js';

export async function listMentorshipsService(userId) {
    const user = await findUserById(userId);

    if (!user) {
        const error = new Error('Usuário não encontrado');
        error.statusCode = 404;
        throw error;
    }

    return findMentorshipsForUser(userId);
}

export async function createMentorshipRequestService(studentId, mentorId) {
    if (!studentId || !mentorId) {
        const error = new Error('Aluno e mentor são obrigatórios');
        error.statusCode = 400;
        throw error;
    }

    const student = await findUserById(studentId);
    const mentor = await findUserById(mentorId);

    if (!student) {
        const error = new Error('Estudante não encontrado');
        error.statusCode = 404;
        throw error;
    }

    if (!mentor) {
        const error = new Error('Mentor não encontrado');
        error.statusCode = 404;
        throw error;
    }

    if (student.role !== 'STUDENT') {
        const error = new Error('Apenas estudantes podem solicitar mentoria');
        error.statusCode = 403;
        throw error;
    }

    if (mentor.role !== 'MENTOR') {
        const error = new Error('O usuário informado não é um mentor');
        error.statusCode = 400;
        throw error;
    }

    const existing = await findExistingMentorship(mentorId, studentId);

    if (existing) {
        const error = new Error('Já existe uma solicitação de mentoria para esse mentor');
        error.statusCode = 409;
        throw error;
    }

    return createMentorshipRequest({
        mentorId,
        studentId,
        status: 'REQUESTED',
    });
}

export async function updateMentorshipStatusService(userId, mentorshipId, status) {
    const mentorship = await findMentorshipById(mentorshipId);

    if (!mentorship) {
        const error = new Error('Solicitação de mentoria não encontrada');
        error.statusCode = 404;
        throw error;
    }

    if (mentorship.mentorId !== userId && mentorship.studentId !== userId) {
        const error = new Error('Apenas usuários envolvidos na mentoria podem alterar o status');
        error.statusCode = 403;
        throw error;
    }

    if (!['APPROVED', 'CANCELLED', 'COMPLETED'].includes(status)) {
        const error = new Error('Status inválido para a mentoria');
        error.statusCode = 400;
        throw error;
    }

    return updateMentorshipStatus(mentorshipId, { status });
}

export async function evaluateMentorshipService(userId, mentorshipId, payload) {
    const mentorship = await findMentorshipById(mentorshipId);

    if (!mentorship) {
        const error = new Error('Solicitação de mentoria não encontrada');
        error.statusCode = 404;
        throw error;
    }

    if (mentorship.mentorId !== userId && mentorship.studentId !== userId) {
        const error = new Error('Apenas usuários envolvidos podem avaliar esta mentoria');
        error.statusCode = 403;
        throw error;
    }

    if (!['APPROVED', 'COMPLETED'].includes(mentorship.status)) {
        const error = new Error('A mentoria só pode ser avaliada após aprovação');
        error.statusCode = 400;
        throw error;
    }

    const { rating, comment } = payload;
    validateMentorshipRating({ rating, comment });

    return updateMentorshipStatus(mentorshipId, {
        rating,
        comment: comment ? comment.trim() : null,
        status: 'COMPLETED',
    });
}
