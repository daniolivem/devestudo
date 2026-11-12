import prisma from '../config/database.js';

export function findAllUsers() {
    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
        },
    });
}

export function updateUserProfile(userId, profileData) {
        return prisma.user.update({
            where: {
                id: userId              
            },
            data: profileData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                photo: true,
                socialNetwork: true,
                knowledgeLevel: true,
                interests: true,
                availability: true,
                updatedAt: true
            }
        });      
}

export function findUserById(userId) {
    return prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            photo: true,
            socialNetwork: true,
            knowledgeLevel: true,
            interests: true,
            availability: true,
            createdAt: true,
            updatedAt: true
        }
    });
}

export function findUserPasswordById(userId) {
    return prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            password: true
        }
    });
}

export function createUserByAdmin(data) {
    return prisma.user.create({
        data,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isBlocked: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export function updateUserByAdmin(userId, data) {
    return prisma.user.update({
        where: {
            id: userId,
        },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isBlocked: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export function deleteUserByAdmin(userId) {
    return prisma.user.delete({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
}

export function updatePassword(userId, passwordHash) {
    return prisma.user.update({
        where: {
            id: userId
        },
        data: {
            password: passwordHash
        },
        select: {
            id: true
        }
    });
}