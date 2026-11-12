import prisma from '../config/database.js';

export function findGroups({ technology, level, availability, status = 'ACTIVE' }) {
    const where = {
        status,
    };

    if (technology) {
        where.technology = {
            contains: technology,
            mode: 'insensitive',
        };
    }

    if (level) {
        where.level = level;
    }

    if (availability) {
        where.availability = {
            contains: availability,
            mode: 'insensitive',
        };
    }

    return prisma.group.findMany({
        where,
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
            members: {
                where: {
                    status: 'APPROVED',
                },
                select: {
                    id: true,
                    status: true,
                    userId: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}

export function findGroupById(groupId) {
    return prisma.group.findUnique({
        where: {
            id: groupId,
        },
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
}

export function findGroupMemberByUserAndGroup(userId, groupId) {
    return prisma.groupMember.findUnique({
        where: {
            userId_groupId: {
                userId,
                groupId,
            },
        },
    });
}

export function findGroupMemberById(memberId) {
    return prisma.groupMember.findUnique({
        where: {
            id: memberId,
        },
    });
}

export function createGroup(data) {
    return prisma.group.create({
        data,
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
            members: {
                where: {
                    status: 'APPROVED',
                },
                select: {
                    id: true,
                    status: true,
                    userId: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
}

export function updateGroup(groupId, data) {
    return prisma.group.update({
        where: {
            id: groupId,
        },
        data,
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
            members: {
                where: {
                    status: 'APPROVED',
                },
                select: {
                    id: true,
                    status: true,
                    userId: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
}

export function deleteGroup(groupId) {
    return prisma.group.delete({
        where: {
            id: groupId,
        },
    });
}

export function createGroupMembership(data) {
    return prisma.groupMember.create({
        data,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            group: {
                select: {
                    id: true,
                    name: true,
                    technology: true,
                    level: true,
                    availability: true,
                },
            },
        },
    });
}

export function updateGroupMembership(memberId, data) {
    return prisma.groupMember.update({
        where: {
            id: memberId,
        },
        data,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            group: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
}

export function deleteGroupMembership(memberId) {
    return prisma.groupMember.delete({
        where: {
            id: memberId,
        },
    });
}

export function countApprovedMembers(groupId) {
    return prisma.groupMember.count({
        where: {
            groupId,
            status: 'APPROVED',
        },
    });
}

export function findUserById(userId) {
    return prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            role: true,
            name: true,
        },
    });
}
