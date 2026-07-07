import { findAllUsers } from "../repositories/user.repository.js";

export async function getAllUsersService() {
    return await findAllUsers();
}