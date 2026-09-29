import prisma from '../config/database.js';

export function findGroups({ technology, level, status = 'ACTIVE' }) {
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
