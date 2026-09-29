export function validateGroupMembershipInput({ userId, groupId, existingMemberships = [] }) {
    if (!userId || !groupId) {
        const error = new Error('Usuário e grupo são obrigatórios');
        error.statusCode = 400;
        throw error;
    }

    const alreadyJoined = existingMemberships.some(
        membership => membership.userId === userId && membership.groupId === groupId
    );

    if (alreadyJoined) {
        const error = new Error('Você já está cadastrado neste grupo');
        error.statusCode = 409;
        throw error;
    }

    return true;
}

export function validateMentorshipRating({ rating, comment }) {
    if (rating === undefined || rating === null) {
        const error = new Error('A nota da mentoria é obrigatória');
        error.statusCode = 400;
        throw error;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        const error = new Error('A nota deve estar entre 1 a 5');
        error.statusCode = 400;
        throw error;
    }

    if (comment !== undefined && comment !== null && typeof comment !== 'string') {
        const error = new Error('O comentário deve ser texto');
        error.statusCode = 400;
        throw error;
    }

    if (typeof comment === 'string' && comment.trim().length > 50) {
        const error = new Error('O comentário deve ter no máximo 50 caracteres');
        error.statusCode = 400;
        throw error;
    }

    return true;
}

export function validateCategoryName({ name }) {
    if (typeof name !== 'string' || name.trim() === '') {
        const error = new Error('O nome da categoria é obrigatório');
        error.statusCode = 400;
        throw error;
    }

    return name.trim();
}
