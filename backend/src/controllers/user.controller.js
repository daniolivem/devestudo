import { 
    getAllUsersService, 
    updateProfileService, 
    getProfileService,
    changePasswordService
} from '../services/user.service.js';

export async function getAllUsers(req, res, next) {
    try {
        const users = await getAllUsersService();

        return res.status(200).json(users);
    } catch (error) {
        return next(error);
    }
}

export async function updateProfile(req, res, next) {
    try {
        const userId = req.user.id;

        const {
            name,
            photo,
            socialNetwork,
            knowledgeLevel,
            interests,
            availability
        } = req.body;

        const profileData = {
            name,
            photo,
            socialNetwork,
            knowledgeLevel,
            interests,
            availability
        };

        const updatedUser = await updateProfileService(userId, profileData);

        return res.status(200).json({
            message: "Perfil atualizado com sucesso",
            user: updatedUser
        });
    } catch (error) {
        return next(error);
    }
}

export async function getProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const user = await getProfileService(userId);

        return res.status(200).json({user});
    } catch (error) {
        return next(error);
    }   
}

export async function changePassword(req, res, next) {
    try {
        const userId = req.user.id;

        const { currentPassword, newPassword } = req.body;

        const result = await changePasswordService(
            userId,
            currentPassword,
            newPassword
        );

        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
}