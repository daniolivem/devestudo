import {
    createGroupService,
    joinGroupService,
    listGroupsService,
    updateGroupMembershipService,
} from '../services/group.service.js';

export async function getGroups(req, res, next) {
    try {
        const { technology, level } = req.query;
        const groups = await listGroupsService({ technology, level });

        return res.status(200).json(groups);
    } catch (error) {
        return next(error);
    }
}

export async function createGroup(req, res, next) {
    try {
        const group = await createGroupService(req.user.id, req.body);

        return res.status(201).json({
            message: 'Grupo criado com sucesso',
            group,
        });
    } catch (error) {
        return next(error);
    }
}

export async function joinGroup(req, res, next) {
    try {
        const membership = await joinGroupService(req.user.id, req.body.groupId);

        return res.status(201).json({
            message: 'Solicitação de participação enviada com sucesso',
            membership,
            group: membership.group,
        });
    } catch (error) {
        return next(error);
    }
}

export async function approveGroupMember(req, res, next) {
    try {
        const { groupId, memberId, status } = req.body;
        const updatedMember = await updateGroupMembershipService(
            req.user.id,
            groupId,
            memberId,
            status
        );

        return res.status(200).json({
            message: 'Status do membro atualizado com sucesso',
            membership: updatedMember,
        });
    } catch (error) {
        return next(error);
    }
}
