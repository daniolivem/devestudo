import prisma from '../config/database.js';

export function findMentorshipById(mentorshipId) {
    return prisma.mentorship.findUnique({
        where: {
            id: mentorshipId,
        },
        include: {
            mentor: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
            student: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
        },
    });
}

export function findMentorshipsForUser(userId) {
    return prisma.mentorship.findMany({
        where: {
            OR: [
                { mentorId: userId },
                { studentId: userId },
            ],
        },
        include: {
            mentor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}

export function createMentorshipRequest(data) {
    return prisma.mentorship.create({
        data,
        include: {
            mentor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
}

export function findExistingMentorship(mentorId, studentId) {
    return prisma.mentorship.findFirst({
        where: {
            mentorId,
            studentId,
        },
    });
}

export function updateMentorshipStatus(mentorshipId, data) {
    return prisma.mentorship.update({
        where: {
            id: mentorshipId,
        },
        data,
        include: {
            mentor: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
            student: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
        },
    });
}
