import * as forum from '../services/thread.service.js';
const run = (fn) => async (req, res, next) => { try { const result = await fn(req); return res.status(result?.status || 200).json(result?.body ?? result); } catch (error) { return next(error); } };
const badRequest = (message) => Object.assign(new Error(message), { statusCode: 400 });
export const listThreads = run((req) => forum.listThreads(req.query, req.user.id));
export const getThread = run((req) => forum.getThread(req.params.id, req.user.id));
export const listReplies = run((req) => forum.listReplies(req.params.id, req.query, req.user.id));
export const createThread = run(async (req) => ({ status: 201, body: await forum.createThread(req.body, req.user.id) }));
export const updateThread = run((req) => forum.updateThread(req.params.id, req.body, req.user));
export const deleteThread = run((req) => forum.deleteThread(req.params.id, req.user));
export const createReply = run(async (req) => ({ status: 201, body: await forum.createReply(req.params.id, req.body, req.user.id) }));
export const deleteReply = run((req) => forum.deleteReply(req.params.id, req.user));
export const voteThread = run((req) => forum.vote('thread', req.params.id, req.user.id));
export const unvoteThread = run((req) => forum.unvote('thread', req.params.id, req.user.id));
export const voteReply = run((req) => forum.vote('reply', req.params.id, req.user.id));
export const unvoteReply = run((req) => forum.unvote('reply', req.params.id, req.user.id));

// Compatibility routes documented in the project README.
export const createReplyFromBody = run(async (req) => {
    const { threadId, content } = req.body || {};

    if (typeof threadId !== 'string' || !threadId.trim()) {
        throw badRequest('threadId é obrigatório');
    }

    return {
        status: 201,
        body: await forum.createReply(threadId, { content }, req.user.id),
    };
});

export const voteFromBody = run((req) => {
    const { threadId, replyId } = req.body || {};

    if (threadId && replyId) {
        throw badRequest('Informe threadId ou replyId, não ambos');
    }

    if (threadId) return forum.vote('thread', threadId, req.user.id);
    if (replyId) return forum.vote('reply', replyId, req.user.id);

    throw badRequest('Informe threadId ou replyId');
});
