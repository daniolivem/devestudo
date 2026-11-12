import { 
    findAllUsers, 
    findUserById, 
    updateUserProfile, 
    findUserPasswordById,
    updatePassword,
    createUserByAdmin,
    updateUserByAdmin,
    deleteUserByAdmin
 } from "../repositories/user.repository.js";

import { findUserByEmail } from "../repositories/auth.repository.js";

import { 
    KNOWLEDGE_LEVELS,
     AVAILABILITIES, 
     TECHNOLOGIES
} from "../constants/profile.constants.js";

import bcrypt from 'bcrypt';

const VALID_ROLES = ['STUDENT', 'MENTOR', 'ADMIN'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });

function validatePassword(password) {
    if (typeof password !== 'string' || password.length < 8) {
        throw fail('A senha deve ter no mínimo 8 caracteres', 400);
    }

    if (!/\d/.test(password)) {
        throw fail('A senha deve conter pelo menos um número', 400);
    }

    if (/\s/.test(password)) {
        throw fail('A senha não deve conter espaços', 400);
    }
}


export function getAllUsersService() {
    return findAllUsers();
}

export function updateProfileService(userId, profileData) {

    if (Object.values(profileData).every(value => value === undefined)
    ) {
        const error = new Error('Nenhum campo válido para atualização foi informado');
        error.statusCode = 400;
        throw error;
    }

    if (profileData.name !== undefined) {
        if (
            typeof profileData.name !== 'string' ||
            profileData.name.trim() === ''
        ) {
            const error = new Error('Nome inválido');
            error.statusCode = 400;
            throw error;
        }

        profileData.name = profileData.name.trim();
    }

    if (profileData.photo !== undefined &&     
        profileData.photo !== null && 
        typeof profileData.photo !== 'string'
    ) {
        const error = new Error('Foto inválida');
        error.statusCode = 400;
        throw error;
    }

    if (
        profileData.photo !== undefined &&
        profileData.photo !== null
    ) {
        try {
            const photoUrl = new URL(profileData.photo);

            if (!['http:', 'https:'].includes(photoUrl.protocol)) {
                throw new Error();
            }
        } catch {
            const error = new Error('Foto deve ser uma URL válida');
            error.statusCode = 400;
            throw error;
        }
    }

    if (profileData.socialNetwork !== undefined &&
        profileData.socialNetwork !== null &&
        typeof profileData.socialNetwork !== 'string'
    ) {
        const error = new Error('Rede social inválida');
        error.statusCode = 400;
        throw error;
    }

    if (
        profileData.socialNetwork !== undefined &&
        profileData.socialNetwork !== null
    ) {
        try {
            const socialUrl = new URL(profileData.socialNetwork);

            if (!['http:', 'https:'].includes(socialUrl.protocol)) {
                throw new Error();
            }
        } catch {
            const error = new Error('Rede social deve ser uma URL válida');
            error.statusCode = 400;
            throw error;
        }
    }

    if (
        profileData.knowledgeLevel !== undefined &&
        !KNOWLEDGE_LEVELS.includes(profileData.knowledgeLevel)
    ) {
        const error = new Error('Nível de conhecimento inválido');
        error.statusCode = 400;
        throw error;
    }

    if (
        profileData.availability !== undefined && 
        !AVAILABILITIES.includes(profileData.availability)
     ) {
        const error = new Error('Disponibilidade inválida');
        error.statusCode = 400;
        throw error;
    }

    if (
        profileData.interests !== undefined &&
        !Array.isArray(profileData.interests)
    ) {
        const error = new Error('Interesses devem ser enviados como uma lista');
        error.statusCode = 400;
        throw error;
    }

    if (
        Array.isArray(profileData.interests) &&
        new Set(profileData.interests).size !== profileData.interests.length
    ) {
        const error = new Error('Interesses não podem ser duplicados');
        error.statusCode = 400;
        throw error;
    }

    const invalidInterest = Array.isArray(profileData.interests)
        ? profileData.interests.find(
            interest => !TECHNOLOGIES.includes(interest)
        )
        : undefined;
    
    if (invalidInterest !== undefined) {
        const error = new Error(`Interesse inválido: ${invalidInterest}`);
        error.statusCode = 400;
        throw error;
    } 

    return updateUserProfile(userId, profileData);
}

export async function getProfileService(userId) {
    const user = await findUserById(userId);

    if (!user) {
        const error = new Error('Usuário não encontrado');
        error.statusCode = 404;
        throw error;
    }

    return user;
}

export async function changePasswordService(userId, currentPassword, newPassword) {

   if (!currentPassword || !newPassword) {
        const error = new Error('Senha atual e nova senha são obrigatórias');
        error.statusCode = 400;
        throw error;
    }

    if (
        typeof currentPassword !== 'string' ||
        typeof newPassword !== 'string'
    ) {
        const error = new Error('As senhas devem ser informadas como texto');
        error.statusCode = 400;
        throw error;
    }

    const user = await findUserPasswordById(userId);

    if (!user) {
        const error = new Error('Usuário não encontrado');
        error.statusCode = 404;
        throw error;
    }

    const passwordMatches = await bcrypt.compare(
        currentPassword, user.password
    );

    if (!passwordMatches) {
        const error = new Error('Senha atual incorreta');
        error.statusCode = 401;
        throw error;
    }

    if (currentPassword === newPassword) {
        const error = new Error('A nova senha não pode ser igual à senha atual');
        error.statusCode = 400;
        throw error;
    }

    if (newPassword.length < 8) {
        const error = new Error('A nova senha deve ter no mínimo 8 caracteres');
        error.statusCode = 400;
        throw error;
    }

    const hasNumber = /\d/.test(newPassword);

    if (!hasNumber) {
        const error = new Error('A nova senha deve conter pelo menos um número');
        error.statusCode = 400;
        throw error;
    }

    const hasSpace = /\s/.test(newPassword);

    if (hasSpace) {
        const error = new Error('A nova senha não pode conter espaços');
        error.statusCode = 400;
        throw error;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await updatePassword(userId, passwordHash);
    return {
        message: 'Senha alterada com sucesso'
    };
}

export async function createUserByAdminService(payload = {}) {
    const { name, email, password, role = 'STUDENT' } = payload;

    if (!name || typeof name !== 'string' || !name.trim()) {
        throw fail('Nome é obrigatório', 400);
    }

    if (!email || typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
        throw fail('E-mail inválido', 400);
    }

    if (!VALID_ROLES.includes(role)) {
        throw fail('Tipo de usuário inválido', 400);
    }

    validatePassword(password);

    const existing = await findUserByEmail(email.trim());

    if (existing) {
        throw fail('E-mail já cadastrado', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    return createUserByAdmin({
        name: name.trim(),
        email: email.trim(),
        password: passwordHash,
        role,
    });
}

export async function updateUserByAdminService(actorId, userId, payload = {}) {
    const user = await findUserById(userId);

    if (!user) {
        throw fail('Usuário não encontrado', 404);
    }

    const data = {};
    const { name, email, role, isBlocked } = payload;

    if (name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) {
            throw fail('Nome inválido', 400);
        }
        data.name = name.trim();
    }

    if (email !== undefined) {
        if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
            throw fail('E-mail inválido', 400);
        }

        const existing = await findUserByEmail(email.trim());

        if (existing && existing.id !== userId) {
            throw fail('E-mail já cadastrado', 409);
        }

        data.email = email.trim();
    }

    if (role !== undefined) {
        if (!VALID_ROLES.includes(role)) {
            throw fail('Tipo de usuário inválido', 400);
        }

        if (actorId === userId && role !== 'ADMIN') {
            throw fail('Você não pode remover o seu próprio acesso de administrador', 400);
        }

        data.role = role;
    }

    if (isBlocked !== undefined) {
        if (typeof isBlocked !== 'boolean') {
            throw fail('O status de bloqueio deve ser booleano', 400);
        }

        if (actorId === userId && isBlocked) {
            throw fail('Você não pode bloquear a própria conta', 400);
        }

        data.isBlocked = isBlocked;
    }

    if (Object.keys(data).length === 0) {
        throw fail('Nenhum campo válido para atualização foi informado', 400);
    }

    return updateUserByAdmin(userId, data);
}

export async function deleteUserByAdminService(actorId, userId) {
    if (actorId === userId) {
        throw fail('Você não pode excluir a própria conta', 400);
    }

    const user = await findUserById(userId);

    if (!user) {
        throw fail('Usuário não encontrado', 404);
    }

    await deleteUserByAdmin(userId);

    return { message: 'Usuário removido com sucesso' };
}