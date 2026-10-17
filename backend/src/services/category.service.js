import {
    createCategory,
    deleteCategory,
    findAllCategories,
    findCategoryById,
    findThreadCategoryByCategory,
    updateCategory,
} from '../repositories/category.repository.js';
import { validateCategoryName } from './feature-checks.service.js';

export function listCategoriesService() {
    return findAllCategories();
}

export async function createCategoryService(payload) {
    const name = validateCategoryName(payload);

    try {
        return await createCategory({ name });
    } catch (error) {
        if (error.code === 'P2002') {
            const customError = new Error('Categoria já cadastrada');
            customError.statusCode = 409;
            throw customError;
        }

        throw error;
    }
}

export async function updateCategoryService(categoryId, payload) {
    const category = await findCategoryById(categoryId);

    if (!category) {
        const error = new Error('Categoria não encontrada');
        error.statusCode = 404;
        throw error;
    }

    const name = validateCategoryName(payload);

    try {
        return await updateCategory(categoryId, { name });
    } catch (error) {
        if (error.code === 'P2002') {
            const customError = new Error('Categoria já cadastrada');
            customError.statusCode = 409;
            throw customError;
        }

        throw error;
    }
}

export async function deleteCategoryService(categoryId) {
    const category = await findCategoryById(categoryId);

    if (!category) {
        const error = new Error('Categoria não encontrada');
        error.statusCode = 404;
        throw error;
    }

    const linkedThread = await findThreadCategoryByCategory(categoryId);

    if (linkedThread) {
        const error = new Error('Categoria vinculada a uma thread e não pode ser removida');
        error.statusCode = 409;
        throw error;
    }

    await deleteCategory(categoryId);

    return { message: 'Categoria removida com sucesso' };
}
