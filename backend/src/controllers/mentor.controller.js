import { getMentorsService, updateMentorProfileService } from '../services/mentor.service.js';

export async function getMentors(req, res, next) {
    try {
        const { technology } = req.query;
        const mentors = await getMentorsService(technology);

        return res.status(200).json(mentors);
    } catch (error) {
        return next(error);
    }
}

export async function updateMentorProfile(req, res, next) {
    try {
        const mentorId = req.user.id;

        const {
            mentorTechnologies,
            calendlyUrl
        } = req.body;

        const mentorProfileData = {
            mentorTechnologies,
            calendlyUrl
        };

        const mentorProfile = await updateMentorProfileService(
            mentorId, 
            mentorProfileData
        );
        
        return res.status(200).json(mentorProfile);
    } catch (error) {
        return next(error);
    }
}