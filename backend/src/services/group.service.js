import {
    countApprovedMembers,
    createGroup,
    createGroupMembership,
    findGroupById,
    findGroupMemberByUserAndGroup,
    findGroups,
    findUserById,
    updateGroupMembership,
} from '../repositories/group.repository.js';
import {
    validateGroupMembershipInput,
} from './feature-checks.service.js';

const VALID_GROUP_LEVELS = ['Iniciante', 'Intermediário', 'Avançado'];

export function listGroupsService({ technology, level }) {
    const sanitizedTechnology = typeof technology === 'string' ? technology.trim() : technology;
    const sanitizedLevel = typeof level === 'string' ? level.trim() : level;

    if (sanitizedTechnology !== undefined && sanitizedTechnology === '') {
        const error = new Error('Tecnologia não informada');
        error.statusCode = 400;
        throw error;
    }

    if (sanitizedLevel !== undefined && sanitizedLevel === '') {
        const error = new Error('Nível não informado');
        error.statusCode = 400;
        throw error;
    }

    if (sanitizedLevel !== undefined && !VALID_GROUP_LEVELS.includes(sanitizedLevel)) {
        const error = new Error(`Nível inválido: ${sanitizedLevel}`);
        error.statusCode = 400;
        throw error;
    }

    return findGroups({
        technology: sanitizedTechnology,
        level: sanitizedLevel,
    });
}

export async function createGroupService(userId, payload) {
    const user = await findUserById(userId);

    if (!user) {
        const error = new Error('Usuário não encontrado');
        error.statusCode = 404;
        throw error;
    }

    if (!['MENTOR', 'ADMIN'].includes(user.role)) {
        const error = new Error('Apenas mentores e administradores podem criar grupos');
        error.statusCode = 403;
        throw error;
    }

    const { name, description, technology, level, materialsUrl } = payload;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        const error = new Error('O nome do grupo é obrigatório');
        error.statusCode = 400;
        throw error;
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
        const error = new Error('A descrição deve ser texto');
        error.statusCode = 400;
        throw error;
    }

    if (technology !== undefined && technology !== null && typeof technology !== 'string') {
        const error = new Error('A tecnologia deve ser texto');
        error.statusCode = 400;
        throw error;
    }

    if (level !== undefined && level !== null && !VALID_GROUP_LEVELS.includes(level)) {
        const error = new Error(`Nível inválido: ${level}`);
        error.statusCode = 400;
        throw error;
    }

    if (materialsUrl !== undefined && materialsUrl !== null && materialsUrl !== '') {
        try {
            const url = new URL(materialsUrl);
            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error();
            }
        } catch {
            const error = new Error('O link de materiais deve ser uma URL válida');
            error.statusCode = 400;
            throw error;
        }
    }

    return createGroup({
        name: name.trim(),
        description: description ? description.trim() : null,
        technology: technology ? technology.trim() : null,
        level: level || null,
        materialsUrl: materialsUrl || null,
        creatorId: userId,
    });
}

export async function joinGroupService(userId, groupId) {
    const group = await findGroupById(groupId);

    if (!group) {
        const error = new Error('Grupo não encontrado');
        error.statusCode = 404;
        throw error;
    }

    if (group.status === 'CLOSED') {
        const error = new Error('Este grupo está encerrado');
        error.statusCode = 400;
        throw error;
    }

    if (group.creatorId === userId) {
        const error = new Error('O mentor criador não pode participar como membro');
        error.statusCode = 400;
        throw error;
    }

    const existingMemberships = group.members || [];
    validateGroupMembershipInput({
        userId,
        groupId,
        existingMemberships,
    });

    return createGroupMembership({
        userId,
        groupId,
        status: 'PENDING',
    });
}

export async function updateGroupMembershipService(mentorId, groupId, memberId, status) {
    if (!memberId || !status) {
        const error = new Error('Membro e status são obrigatórios');
        error.statusCode = 400;
        throw error;
    }

    const group = await findGroupById(groupId);

    if (!group) {
        const error = new Error('Grupo não encontrado');
        error.statusCode = 404;
        throw error;
    }

    if (group.creatorId !== mentorId) {
        const error = new Error('Apenas o mentor do grupo pode aprovar membros');
        error.statusCode = 403;
        throw error;
    }

    const membership = group.members.find(item => item.id === memberId);

    if (!membership) {
        const error = new Error('Membro não encontrado no grupo');
        error.statusCode = 404;
        throw error;
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        const error = new Error('Status inválido. Use APPROVED ou REJECTED');
        error.statusCode = 400;
        throw error;
    }

    if (status === 'APPROVED') {
        const approvedMembers = await countApprovedMembers(groupId);

        if (approvedMembers >= 10) {
            const error = new Error('O grupo já atingiu o limite de 10 membros aprovados');
            error.statusCode = 400;
            throw error;
        }
    }

    return updateGroupMembership(memberId, { status });
}

export async function getGroupMemberByUserAndGroupService(userId, groupId) {
    const membership = await findGroupMemberByUserAndGroup(userId, groupId);

    if (!membership) {
        const error = new Error('Participação não encontrada');
        error.statusCode = 404;
        throw error;
    }

    return membership;
}
