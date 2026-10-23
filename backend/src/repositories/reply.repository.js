import prisma from '../config/database.js';

export function findReplies({ threadId, userId, skip, take }) {
    return prisma.reply.findMany({
        where: { threadId },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
        include: {
            user: { select: { id: true, name: true, photo: true } },
            replyVotes: { where: { userId }, select: { userId: true } },
            _count: { select: { replyVotes: true } },
        },
    });
}

export function countReplies(threadId) {
    return prisma.reply.count({ where: { threadId } });
}

export function createReply(data) {
    return prisma.reply.create({
        data,
        include: {
            user: { select: { id: true, name: true, photo: true } },
            _count: { select: { replyVotes: true } },
        },
    });
}

export function findReplyOwner(id) {
    return prisma.reply.findUnique({ where: { id }, select: { id: true, userId: true, threadId: true } });
}

export function findReplyId(id) {
    return prisma.reply.findUnique({ where: { id }, select: { id: true } });
}

export function deleteReply(id) {
    return prisma.reply.delete({ where: { id } });
}
