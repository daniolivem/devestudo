import {
    createGroupService,
    deleteGroupService,
    joinGroupService,
    leaveGroupService,
    listGroupsService,
    removeGroupMemberService,
    updateGroupMembershipService,
    updateGroupService,
} from '../services/group.service.js';

export async function getGroups(req, res, next) {
    try {
        const { technology, level, availability } = req.query;
        const groups = await listGroupsService({ technology, level, availability });

        return res.status(200).json(groups);
    } catch (error) {
        return next(error);
    }
}

export async function createGroup(req, res, next) {
    try {
        const group = await createGroupService(req.user.id, req.body);

        return res.status(201).json({
            success: true,
            message: 'Grupo criado com sucesso',
            group,
        });
    } catch (error) {
        return next(error);
    }
}

export async function updateGroup(req, res, next) {
    try {
        const group = await updateGroupService(
            req.user.id,
            req.user.role,
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: 'Grupo atualizado com sucesso',
            group,
        });
    } catch (error) {
        return next(error);
    }
}

export async function deleteGroup(req, res, next) {
    try {
        const result = await deleteGroupService(
            req.user.id,
            req.user.role,
            req.params.id
        );

        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        return next(error);
    }
}

export async function joinGroup(req, res, next) {
    try {
        const groupId = req.body.groupId || req.body.grupoId;
        const membership = await joinGroupService(req.user.id, groupId);

        return res.status(201).json({
            success: true,
            message: 'Solicitação de participação enviada com sucesso',
            membership,
            group: membership.group,
        });
    } catch (error) {
        return next(error);
    }
}

export async function leaveGroup(req, res, next) {
    try {
        const groupId = req.body.groupId || req.body.grupoId;
        const result = await leaveGroupService(req.user.id, groupId);

        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        return next(error);
    }
}

export async function approveGroupMember(req, res, next) {
    try {
        const { groupId, memberId, status } = req.body;
        const updatedMember = await updateGroupMembershipService(
            req.user.id,
            req.user.role,
            groupId,
            memberId,
            status
        );

        return res.status(200).json({
            success: true,
            message: 'Status do membro atualizado com sucesso',
            membership: updatedMember,
        });
    } catch (error) {
        return next(error);
    }
}

export async function removeGroupMember(req, res, next) {
    try {
        const { groupId, memberId } = req.body;
        const result = await removeGroupMemberService(
            req.user.id,
            req.user.role,
            groupId,
            memberId
        );

        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        return next(error);
    }
}
