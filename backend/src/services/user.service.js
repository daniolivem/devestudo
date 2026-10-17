import { 
    findAllUsers, 
    findUserById, 
    updateUserProfile, 
    findUserPasswordById,
    updatePassword 
 } from "../repositories/user.repository.js";

import { 
    KNOWLEDGE_LEVELS,
     AVAILABILITIES, 
     TECHNOLOGIES
} from "../constants/profile.constants.js";

import bcrypt from 'bcrypt';


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