import * as threads from '../repositories/thread.repository.js';
import * as replies from '../repositories/reply.repository.js';
import * as votes from '../repositories/vote.repository.js';

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });
const pageParams = (query) => ({
    page: Math.max(1, Number.parseInt(query.page, 10) || 1),
    limit: Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 10)),
});
const orderByFor = (query) => {
    const sort = String(query.sort || query.orderBy || 'recent').toLowerCase();
    if (sort === 'oldest') return [{ createdAt: 'asc' }];
    if (sort === 'votes') return [{ votes: { _count: 'desc' } }, { createdAt: 'desc' }];
    if (sort === 'replies') return [{ replies: { _count: 'desc' } }, { createdAt: 'desc' }];
    return [{ updatedAt: 'desc' }, { createdAt: 'desc' }];
};

function formatReply(reply) {
    return {
        id: reply.id,
        content: reply.content,
        userId: reply.userId,
        threadId: reply.threadId,
        author: reply.user?.name,
        user: reply.user,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        time: reply.createdAt,
        votes: reply._count?.replyVotes || 0,
        hasVoted: Boolean(reply.replyVotes?.length),
    };
}

function formatThread(thread, userId) {
    const latestReply = thread.replies?.at(-1)?.createdAt;
    return {
        id: thread.id,
        title: thread.title,
        content: thread.content,
        resolved: thread.resolved,
        userId: thread.userId,
        user: thread.user,
        author: thread.user?.name,
        tags: thread.threadCategories?.map(({ category }) => category.name) || [],
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        lastInteractionAt: latestReply || thread.updatedAt,
        replies: thread._count?.replies || 0,
        repliesCount: thread._count?.replies || 0,
        votes: thread._count?.votes || 0,
        hasVoted: Boolean(thread.votes?.length),
        createdByCurrentMentor: thread.user?.role === 'MENTOR' && thread.user.id === userId,
    };
}

function normalizeTags(tags = []) {
    if (!Array.isArray(tags)) throw fail('As tecnologias devem ser enviadas em uma lista', 400);
    const names = [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))];
    if (names.length > 3) throw fail('Informe no máximo 3 tecnologias', 400);
    if (names.some((name) => name.length > 100)) throw fail('Cada tecnologia deve ter no máximo 100 caracteres', 400);
    return names.map((name) => ({
        category: {
            connectOrCreate: { where: { name }, create: { name } },
        },
    }));
}

function validateThreadInput(data, { partial = false } = {}) {
    const result = {};
    if (!partial || data.title !== undefined) {
        if (typeof data.title !== 'string' || !data.title.trim()) throw fail('Título é obrigatório', 400);
        if (data.title.trim().length > 100) throw fail('Título deve ter no máximo 100 caracteres', 400);
        result.title = data.title.trim();
    }
    if (!partial || data.content !== undefined) {
        if (typeof data.content !== 'string' || !data.content.trim()) throw fail('Conteúdo é obrigatório', 400);
        result.content = data.content.trim();
    }
    if (!partial || data.tags !== undefined) result.threadCategories = { ...(partial ? { deleteMany: {} } : {}), create: normalizeTags(data.tags) };
    return result;
}

export async function listThreads(query, userId) {
    const { page, limit } = pageParams(query);
    const where = {};
    const search = String(query.search || query.q || '').trim();
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (query.tag) {
        where.threadCategories = { some: { category: { name: { equals: String(query.tag).trim(), mode: 'insensitive' } } } };
    }
    const [rows, total] = await Promise.all([
        threads.findThreads({ where, orderBy: orderByFor(query), skip: (page - 1) * limit, take: limit, userId }),
        threads.countThreads(where),
    ]);
    return { items: rows.map((thread) => formatThread(thread, userId)), total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getThread(id, userId) {
    const thread = await threads.findThreadById(id, userId);
    if (!thread) throw fail('Tópico não encontrado', 404);
    return { ...formatThread(thread, userId), replies: thread.replies.map(formatReply) };
}

export async function listReplies(threadId, query, userId) {
    if (!await threads.findThreadId(threadId)) throw fail('Tópico não encontrado', 404);
    const { page, limit } = pageParams(query);
    const [rows, total] = await Promise.all([
        replies.findReplies({ threadId, userId, skip: (page - 1) * limit, take: limit }),
        replies.countReplies(threadId),
    ]);
    return { items: rows.map(formatReply), total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createThread(data, userId) {
    const thread = await threads.createThread({ ...validateThreadInput(data), userId });
    return formatThread(thread, userId);
}

async function assertOwnerOrAdmin(id, user, repository) {
    const record = await repository(id);
    if (!record) throw fail('Conteúdo não encontrado', 404);
    if (record.userId !== user.id && user.role !== 'ADMIN') throw fail('Acesso negado', 403);
    return record;
}

export async function updateThread(id, data, user) {
    await assertOwnerOrAdmin(id, user, threads.findThreadOwner);
    const updated = await threads.updateThread(id, validateThreadInput(data, { partial: true }));
    return formatThread(updated, user.id);
}

export async function deleteThread(id, user) {
    await assertOwnerOrAdmin(id, user, threads.findThreadOwner);
    await threads.deleteThread(id);
    return { message: 'Tópico removido com sucesso' };
}

export async function createReply(threadId, data, userId) {
    if (typeof data.content !== 'string' || !data.content.trim()) throw fail('O conteúdo da resposta é obrigatório', 400);
    if (!await threads.findThreadId(threadId)) throw fail('Tópico não encontrado', 404);
    const reply = await replies.createReply({ threadId, userId, content: data.content.trim() });
    await threads.touchThread(threadId);
    return formatReply(reply);
}

export async function deleteReply(id, user) {
    const reply = await assertOwnerOrAdmin(id, user, replies.findReplyOwner);
    await replies.deleteReply(id);
    await threads.touchThread(reply.threadId);
    return { message: 'Resposta removida com sucesso' };
}

export async function vote(type, id, userId) {
    if (type === 'thread') {
        if (!await threads.findThreadId(id)) throw fail('Tópico não encontrado', 404);
        await votes.addThreadVote(id, userId);
    } else {
        if (!await replies.findReplyId(id)) throw fail('Resposta não encontrada', 404);
        await votes.addReplyVote(id, userId);
    }
    return { message: 'Voto registrado com sucesso' };
}

export async function unvote(type, id, userId) {
    if (type === 'thread') {
        if (!await threads.findThreadId(id)) throw fail('Tópico não encontrado', 404);
        await votes.removeThreadVote(id, userId);
    } else {
        if (!await replies.findReplyId(id)) throw fail('Resposta não encontrada', 404);
        await votes.removeReplyVote(id, userId);
    }
    return { message: 'Voto removido com sucesso' };
}
