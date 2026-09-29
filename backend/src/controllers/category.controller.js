import {
    createCategoryService,
    deleteCategoryService,
    listCategoriesService,
    updateCategoryService,
} from '../services/category.service.js';

export async function getCategories(req, res, next) {
    try {
        const categories = await listCategoriesService();
        return res.status(200).json(categories);
    } catch (error) {
        return next(error);
    }
}

export async function createCategory(req, res, next) {
    try {
        const category = await createCategoryService(req.body);
        return res.status(201).json({
            message: 'Categoria criada com sucesso',
            category,
        });
    } catch (error) {
        return next(error);
    }
}

export async function updateCategory(req, res, next) {
    try {
        const category = await updateCategoryService(req.params.id, req.body);
        return res.status(200).json({
            message: 'Categoria atualizada com sucesso',
            category,
        });
    } catch (error) {
        return next(error);
    }
}

export async function deleteCategory(req, res, next) {
    try {
        const result = await deleteCategoryService(req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        return next(error);
    }
}
