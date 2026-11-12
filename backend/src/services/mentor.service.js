import { findAllMentors, updateMentorProfile } from '../repositories/mentor.repository.js';
import { TECHNOLOGIES } from '../constants/profile.constants.js';


export async function getMentorsService(technology) {

    if (technology !== undefined && typeof technology !== 'string') {
        const error = new Error('Tecnologia inválida');
        error.statusCode = 400;
        throw error;
    }

    if (technology !== undefined && technology.trim() === '') {
        const error = new Error('Tecnologia não informada');
        error.statusCode = 400;
        throw error;
    }

    if (technology !== undefined && 
        !TECHNOLOGIES.includes(technology)
    ) {
        const error = new Error(`Tecnologia inválida: ${technology}`);
        error.statusCode = 400;
        throw error;
    }

    const mentors = await findAllMentors(technology);

    return mentors.map(({ mentorSessions, ...mentor }) => {
        const completedSessions = mentorSessions.filter(
            (session) => session.status === 'COMPLETED'
        );
        const ratings = completedSessions
            .map((session) => session.rating)
            .filter((rating) => Number.isInteger(rating));

        const rating = ratings.length
            ? Number((ratings.reduce((total, value) => total + value, 0) / ratings.length).toFixed(1))
            : null;

        return {
            ...mentor,
            sessions: completedSessions.length,
            evaluations: ratings.length,
            rating,
        };
    });
}

export function updateMentorProfileService(
    mentorId, 
    mentorProfileData
) {
    
    if (Object.values(mentorProfileData).every(
        value => value === undefined
    )) {
        const error = new Error(
            'Nenhum campo válido para atualização foi informado'
        );
        error.statusCode = 400;
        throw error;
    }

    if (mentorProfileData.mentorTechnologies !== undefined &&
        !Array.isArray(mentorProfileData.mentorTechnologies)
     ) {
        const error = new Error(
            'Tecnologias do mentor devem ser enviadas como uma lista'
        );
        error.statusCode = 400;
        throw error;
    }

    if (Array.isArray(mentorProfileData.mentorTechnologies) &&
        mentorProfileData.mentorTechnologies.length > 3
    ) {
        const error = new Error(
            'O mentor só pode informar no máximo 3 tecnologias'
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        Array.isArray(mentorProfileData.mentorTechnologies) &&
        new Set(mentorProfileData.mentorTechnologies).size !==
            mentorProfileData.mentorTechnologies.length
    ) {
        const error = new Error(
            'Tecnologias do mentor não podem ser duplicadas'
        );
        error.statusCode = 400;
        throw error;
    }

    const invalidTechnology = Array.isArray(
        mentorProfileData.mentorTechnologies
    ) 
        ? mentorProfileData.mentorTechnologies.find(
            technology => !TECHNOLOGIES.includes(technology)
        )
        : undefined;
        
    if (invalidTechnology !== undefined) {
        const error = new Error(`Tecnologia inválida: ${invalidTechnology}`);
        error.statusCode = 400;
        throw error;
    } 
    
    if (
        mentorProfileData.calendlyUrl !== undefined &&
        mentorProfileData.calendlyUrl !== null &&
        typeof mentorProfileData.calendlyUrl !== 'string'
    ) {
        const error = new Error(
            'Link de agendamento inválido'
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        mentorProfileData.calendlyUrl !== undefined &&
        mentorProfileData.calendlyUrl !== null
    ) {
        try {
            const schedulingUrl = new URL(
                mentorProfileData.calendlyUrl
            );

            if (!['http:', 'https:'].includes(schedulingUrl.protocol)) {
                throw new Error();
            }
        } catch {
            const error = new Error(
                'Link de agendamento deve ser uma URL válida'
            );
            error.statusCode = 400;
            throw error;
        }
    }

    return updateMentorProfile(mentorId, mentorProfileData);
}