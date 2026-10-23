import prisma from '../config/database.js';

export function addThreadVote(threadId, userId) {
    return prisma.threadVote.upsert({
        where: { threadId_userId: { threadId, userId } },
        create: { threadId, userId },
        update: {},
    });
}

export function removeThreadVote(threadId, userId) {
    return prisma.threadVote.deleteMany({ where: { threadId, userId } });
}

export function addReplyVote(replyId, userId) {
    return prisma.replyVote.upsert({
        where: { replyId_userId: { replyId, userId } },
        create: { replyId, userId },
        update: {},
    });
}

export function removeReplyVote(replyId, userId) {
    return prisma.replyVote.deleteMany({ where: { replyId, userId } });
}
