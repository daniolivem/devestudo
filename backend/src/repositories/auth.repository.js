import prisma from "../config/database.js";

export async function findUserByEmail(email) {
    return prisma.user.findUnique({
        where: {
            email,
        },
    });
}

export async function createUser(data) {
    return prisma.user.create({
        data,

        select: {
            id: true,
            name: true,
            email: true,
            role: true,       
        },
    });
}