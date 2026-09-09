import prisma from '../config/database.js';

export async function findAllUsers() {
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

export async function updateUserProfile(userId, profileData) {
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

export async function findUserById(userId) {
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

export async function findUserPasswordById(userId) {
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

export async function updatePassword(userId, passwordHash) {
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