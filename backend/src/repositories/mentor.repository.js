import prisma from '../config/database.js';

export function findAllMentors(technology) {
    return prisma.user.findMany({
        where: {
            role: 'MENTOR',
            ...(technology && {
                mentorTechnologies: {
                has: technology
                }
            })    
        },
        select: {
            id: true,
            name: true,
            role: true,
            photo: true,
            socialNetwork: true,
            knowledgeLevel: true,
            availability: true,
            mentorTechnologies: true,
            calendlyUrl: true
        }
    });
}

export function updateMentorProfile(mentorId, mentorProfileData) {
    return prisma.user.update({
        where: {
            id: mentorId
        },
        data: mentorProfileData,
        select: {
            id: true,
            name: true,
            role: true,
            mentorTechnologies: true,
            calendlyUrl: true,
            availability: true,
            knowledgeLevel: true,
            photo: true,
            socialNetwork: true,
            updatedAt: true
        }     
    });
}