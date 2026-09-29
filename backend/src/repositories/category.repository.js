import prisma from '../config/database.js';

export function findAllCategories() {
    return prisma.category.findMany({
        orderBy: {
            name: 'asc',
        },
    });
}

export function findCategoryById(categoryId) {
    return prisma.category.findUnique({
        where: {
            id: categoryId,
        },
    });
}

export function createCategory(data) {
    return prisma.category.create({
        data,
    });
}

export function updateCategory(categoryId, data) {
    return prisma.category.update({
        where: {
            id: categoryId,
        },
        data,
    });
}

export function deleteCategory(categoryId) {
    return prisma.category.delete({
        where: {
            id: categoryId,
        },
    });
}

export function findThreadCategoryByCategory(categoryId) {
    return prisma.threadCategory.findFirst({
        where: {
            categoryId,
        },
    });
}
