import prisma from '../config/database.js';

const threadListInclude = {
    user: { select: { id: true, name: true, role: true, photo: true } },
    threadCategories: { include: { category: true } },
    replies: { take: 1, orderBy: { createdAt: 'desc' }, select: { createdAt: true } },
    _count: { select: { replies: true, votes: true } },
};

export function findThreads({ where, orderBy, skip, take, userId }) {
    return prisma.thread.findMany({
        where,
        orderBy,
        skip,
        take,
        include: { ...threadListInclude, votes: { where: { userId }, select: { userId: true } } },
    });
}

export function countThreads(where) {
    return prisma.thread.count({ where });
}

export function findThreadById(id, userId) {
    return prisma.thread.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, role: true, photo: true } },
            threadCategories: { include: { category: true } },
            votes: { where: { userId }, select: { userId: true } },
            _count: { select: { replies: true, votes: true } },
            replies: {
                orderBy: { createdAt: 'asc' },
                include: {
                    user: { select: { id: true, name: true, photo: true } },
                    replyVotes: { where: { userId }, select: { userId: true } },
                    _count: { select: { replyVotes: true } },
                },
            },
        },
    });
}

export function createThread(data) {
    return prisma.thread.create({
        data,
        include: {
            user: { select: { id: true, name: true, role: true, photo: true } },
            threadCategories: { include: { category: true } },
            _count: { select: { replies: true, votes: true } },
        },
    });
}

export function updateThread(id, data) {
    return prisma.thread.update({
        where: { id },
        data,
        include: {
            user: { select: { id: true, name: true, role: true, photo: true } },
            threadCategories: { include: { category: true } },
            _count: { select: { replies: true, votes: true } },
        },
    });
}

export function deleteThread(id) {
    return prisma.thread.delete({ where: { id } });
}

export function findThreadOwner(id) {
    return prisma.thread.findUnique({ where: { id }, select: { id: true, userId: true } });
}

export function findThreadId(id) {
    return prisma.thread.findUnique({ where: { id }, select: { id: true } });
}

export function touchThread(id) {
    return prisma.thread.update({ where: { id }, data: { updatedAt: new Date() } });
}
