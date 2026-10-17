import {
    createMentorshipRequestService,
    evaluateMentorshipService,
    listMentorshipsService,
    updateMentorshipStatusService,
} from '../services/mentorship.service.js';

export async function getMentorships(req, res, next) {
    try {
        const mentorships = await listMentorshipsService(req.user.id);
        return res.status(200).json(mentorships);
    } catch (error) {
        return next(error);
    }
}

export async function createMentorshipRequest(req, res, next) {
    try {
        const mentorship = await createMentorshipRequestService(req.user.id, req.body.mentorId);

        return res.status(201).json({
            message: 'Solicitação de mentoria criada com sucesso',
            mentorship,
        });
    } catch (error) {
        return next(error);
    }
}

export async function updateMentorshipStatus(req, res, next) {
    try {
        const mentorship = await updateMentorshipStatusService(
            req.user.id,
            req.params.id,
            req.body.status
        );

        return res.status(200).json({
            message: 'Status da mentoria atualizado com sucesso',
            mentorship,
        });
    } catch (error) {
        return next(error);
    }
}

export async function evaluateMentorship(req, res, next) {
    try {
        const mentorship = await evaluateMentorshipService(
            req.user.id,
            req.params.id,
            req.body
        );

        return res.status(200).json({
            message: 'Mentoria avaliada com sucesso',
            mentorship,
        });
    } catch (error) {
        return next(error);
    }
}
