import {
    countApprovedMembers,
    createGroup,
    createGroupMembership,
    deleteGroup,
    deleteGroupMembership,
    findGroupById,
    findGroupMemberById,
    findGroupMemberByUserAndGroup,
    findGroups,
    findUserById,
    updateGroup,
    updateGroupMembership,
} from '../repositories/group.repository.js';
import {
    validateGroupMembershipInput,
} from './feature-checks.service.js';

export const VALID_GROUP_LEVELS = ['Iniciante', 'Intermediário', 'Avançado'];
export const VALID_GROUP_STATUSES = ['ACTIVE', 'CLOSED'];

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });

function assertGroupManager(group, userId, role) {
    if (role === 'ADMIN') return;
    if (group.creatorId !== userId) {
        throw fail('Apenas o mentor do grupo pode gerenciar esta ação', 403);
    }
}

function normalizeOptionalText(value, field, maxLength) {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    if (typeof value !== 'string') throw fail(`${field} deve ser texto`, 400);

    const trimmed = value.trim();
    if (!trimmed) return null;
    if (maxLength && trimmed.length > maxLength) {
        throw fail(`${field} deve ter no máximo ${maxLength} caracteres`, 400);
    }

    return trimmed;
}

function validateMaterialsUrl(value) {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    if (typeof value !== 'string') throw fail('O link de materiais deve ser texto', 400);

    const trimmed = value.trim();
    if (trimmed.length > 255) {
        throw fail('O link de materiais deve ter no máximo 255 caracteres', 400);
    }

    try {
        const url = new URL(trimmed);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
        throw fail('O link de materiais deve ser uma URL válida', 400);
    }

    return trimmed;
}

export function validateGroupInput(payload = {}, { partial = false } = {}) {
    const data = {};
    const { name, description, technology, level, availability, materialsUrl, status } = payload;

    if (!partial || name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) {
            throw fail('O nome do grupo é obrigatório', 400);
        }
        data.name = name.trim();
    }

    const normalizedDescription = normalizeOptionalText(description, 'A descrição');
    if (normalizedDescription !== undefined) data.description = normalizedDescription;

    const normalizedTechnology = normalizeOptionalText(technology, 'A tecnologia', 50);
    if (normalizedTechnology !== undefined) data.technology = normalizedTechnology;

    const normalizedAvailability = normalizeOptionalText(availability, 'A disponibilidade', 100);
    if (normalizedAvailability !== undefined) data.availability = normalizedAvailability;

    const normalizedMaterialsUrl = validateMaterialsUrl(materialsUrl);
    if (normalizedMaterialsUrl !== undefined) data.materialsUrl = normalizedMaterialsUrl;

    if (level !== undefined) {
        if (level !== null && level !== '' && !VALID_GROUP_LEVELS.includes(level)) {
            throw fail(`Nível inválido: ${level}`, 400);
        }
        data.level = level || null;
    }

    if (status !== undefined) {
        if (!VALID_GROUP_STATUSES.includes(status)) {
            throw fail('Status do grupo inválido. Use ACTIVE ou CLOSED', 400);
        }
        data.status = status;
    }

    if (partial && Object.keys(data).length === 0) {
        throw fail('Nenhum campo válido para atualização foi informado', 400);
    }

    return data;
}

export function listGroupsService({ technology, level, availability } = {}) {
    const sanitizedTechnology = typeof technology === 'string' ? technology.trim() : technology;
    const sanitizedLevel = typeof level === 'string' ? level.trim() : level;
    const sanitizedAvailability = typeof availability === 'string' ? availability.trim() : availability;

    if (sanitizedTechnology !== undefined && sanitizedTechnology === '') {
        throw fail('Tecnologia não informada', 400);
    }

    if (sanitizedLevel !== undefined && sanitizedLevel === '') {
        throw fail('Nível não informado', 400);
    }

    if (sanitizedAvailability !== undefined && sanitizedAvailability === '') {
        throw fail('Disponibilidade não informada', 400);
    }

    if (sanitizedLevel !== undefined && !VALID_GROUP_LEVELS.includes(sanitizedLevel)) {
        throw fail(`Nível inválido: ${sanitizedLevel}`, 400);
    }

    return findGroups({
        technology: sanitizedTechnology,
        level: sanitizedLevel,
        availability: sanitizedAvailability,
    });
}

export async function createGroupService(userId, payload) {
    const user = await findUserById(userId);

    if (!user) {
        throw fail('Usuário não encontrado', 404);
    }

    if (!['MENTOR', 'ADMIN'].includes(user.role)) {
        throw fail('Apenas mentores e administradores podem criar grupos', 403);
    }

    return createGroup({
        ...validateGroupInput(payload),
        creatorId: userId,
    });
}

export async function updateGroupService(userId, role, groupId, payload) {
    const group = await findGroupById(groupId);

    if (!group) {
        throw fail('Grupo não encontrado', 404);
    }

    assertGroupManager(group, userId, role);

    return updateGroup(groupId, validateGroupInput(payload, { partial: true }));
}

export async function deleteGroupService(userId, role, groupId) {
    const group = await findGroupById(groupId);

    if (!group) {
        throw fail('Grupo não encontrado', 404);
    }

    assertGroupManager(group, userId, role);

    await deleteGroup(groupId);

    return { message: 'Grupo removido com sucesso' };
}

export async function joinGroupService(userId, groupId) {
    if (typeof groupId !== 'string' || !groupId.trim()) {
        throw fail('Grupo é obrigatório', 400);
    }

    const group = await findGroupById(groupId);

    if (!group) {
        throw fail('Grupo não encontrado', 404);
    }

    if (group.status === 'CLOSED') {
        throw fail('Este grupo está encerrado', 400);
    }

    if (group.creatorId === userId) {
        throw fail('O mentor criador não pode participar como membro', 400);
    }

    const existingMembership = group.members.find((member) => member.userId === userId);

    if (existingMembership && existingMembership.status !== 'REJECTED') {
        throw fail('Você já está cadastrado neste grupo', 409);
    }

    validateGroupMembershipInput({
        userId,
        groupId,
        existingMemberships: existingMembership ? [] : group.members,
    });

    if (existingMembership) {
        return updateGroupMembership(existingMembership.id, { status: 'PENDING' });
    }

    return createGroupMembership({
        userId,
        groupId,
        status: 'PENDING',
    });
}

export async function leaveGroupService(userId, groupId) {
    if (typeof groupId !== 'string' || !groupId.trim()) {
        throw fail('Grupo é obrigatório', 400);
    }

    const membership = await findGroupMemberByUserAndGroup(userId, groupId);

    if (!membership) {
        throw fail('Participação não encontrada', 404);
    }

    await deleteGroupMembership(membership.id);

    return { message: 'Você saiu do grupo com sucesso' };
}

export async function updateGroupMembershipService(actorId, role, groupId, memberId, status) {
    if (!memberId || !status) {
        throw fail('Membro e status são obrigatórios', 400);
    }

    const group = await findGroupById(groupId);

    if (!group) {
        throw fail('Grupo não encontrado', 404);
    }

    assertGroupManager(group, actorId, role);

    const membership = group.members.find((item) => item.id === memberId);

    if (!membership) {
        throw fail('Membro não encontrado no grupo', 404);
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        throw fail('Status inválido. Use APPROVED ou REJECTED', 400);
    }

    if (status === 'APPROVED') {
        const approvedMembers = await countApprovedMembers(groupId);

        if (approvedMembers >= 10) {
            throw fail('O grupo já atingiu o limite de 10 membros aprovados', 400);
        }
    }

    return updateGroupMembership(memberId, { status });
}

export async function removeGroupMemberService(actorId, role, groupId, memberId) {
    if (!memberId) {
        throw fail('Membro é obrigatório', 400);
    }

    const group = await findGroupById(groupId);

    if (!group) {
        throw fail('Grupo não encontrado', 404);
    }

    assertGroupManager(group, actorId, role);

    const membership = await findGroupMemberById(memberId);

    if (!membership || membership.groupId !== groupId) {
        throw fail('Membro não encontrado no grupo', 404);
    }

    await deleteGroupMembership(memberId);

    return { message: 'Membro removido do grupo com sucesso' };
}

export async function getGroupMemberByUserAndGroupService(userId, groupId) {
    const membership = await findGroupMemberByUserAndGroup(userId, groupId);

    if (!membership) {
        throw fail('Participação não encontrada', 404);
    }

    return membership;
}
