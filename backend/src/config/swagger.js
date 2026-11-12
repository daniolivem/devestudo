import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.3',
    info: {
        title: 'DevEstudo API',
        version: '1.0.0',
        description: 'Documentacao da API do DevEstudo',
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Servidor local',
        },
    ],
    components: {
        schemas: {
            ForumAuthor: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    role: { type: 'string', enum: ['STUDENT', 'MENTOR', 'ADMIN'] },
                    photo: { type: 'string', nullable: true },
                },
            },
            ForumReply: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    threadId: { type: 'string', format: 'uuid' },
                    userId: { type: 'string', format: 'uuid' },
                    author: { $ref: '#/components/schemas/ForumAuthor' },
                    content: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    votes: { type: 'integer' },
                    hasVoted: { type: 'boolean', description: 'Se o usuário autenticado votou nesta resposta.' },
                },
            },
            ForumThread: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    title: { type: 'string' },
                    content: { type: 'string' },
                    userId: { type: 'string', format: 'uuid' },
                    author: { $ref: '#/components/schemas/ForumAuthor' },
                    tags: { type: 'array', items: { type: 'string' } },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    lastInteractionAt: { type: 'string', format: 'date-time' },
                    repliesCount: { type: 'integer' },
                    votes: { type: 'integer' },
                    hasVoted: { type: 'boolean', description: 'Se o usuário autenticado votou neste tópico.' },
                },
            },
            ForumThreadDetail: {
                allOf: [
                    { $ref: '#/components/schemas/ForumThread' },
                    { type: 'object', properties: { replies: { type: 'array', items: { $ref: '#/components/schemas/ForumReply' } } } },
                ],
            },
            ForumThreadInput: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                    title: { type: 'string', maxLength: 100 },
                    content: { type: 'string', maxLength: 2000 },
                    tags: { type: 'array', maxItems: 3, items: { type: 'string', maxLength: 100 } },
                },
            },
            ForumThreadPatch: {
                type: 'object',
                minProperties: 1,
                properties: {
                    title: { type: 'string', maxLength: 100 },
                    content: { type: 'string', maxLength: 2000 },
                    tags: { type: 'array', maxItems: 3, items: { type: 'string', maxLength: 100 } },
                },
            },
            ForumReplyInput: {
                type: 'object',
                required: ['content'],
                properties: { content: { type: 'string' } },
            },
            ForumThreadPage: {
                type: 'object',
                properties: {
                    items: { type: 'array', items: { $ref: '#/components/schemas/ForumThread' } },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    totalPages: { type: 'integer' },
                },
            },
            ForumReplyPage: {
                type: 'object',
                properties: {
                    items: { type: 'array', items: { $ref: '#/components/schemas/ForumReply' } },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    totalPages: { type: 'integer' },
                },
            },
            ProfileUpdate: {
                type: 'object',
                properties: {
                    name: { type: 'string', example: 'Maria da Silva' },
                    photo: { type: 'string', format: 'uri' },
                    socialNetwork: { type: 'string', format: 'uri' },
                    knowledgeLevel: {
                        type: 'string',
                        enum: ['Iniciante', 'Intermediário', 'Avançado'],
                    },
                    interests: { type: 'array', items: { type: 'string' } },
                    availability: { type: 'string' },
                },
            },
            ChangePassword: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                    currentPassword: { type: 'string', format: 'password' },
                    newPassword: { type: 'string', format: 'password', minLength: 8 },
                },
            },
            MentorProfile: {
                type: 'object',
                properties: {
                    mentorTechnologies: { type: 'array', items: { type: 'string' }, maxItems: 3 },
                    calendlyUrl: { type: 'string', format: 'uri' },
                },
            },
            Group: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', example: 'Grupo de JavaScript' },
                    description: { type: 'string' },
                    technology: { type: 'string', example: 'JavaScript' },
                    level: { type: 'string', enum: ['Iniciante', 'Intermediário', 'Avançado'] },
                    materialsUrl: { type: 'string', format: 'uri' },
                },
            },
            GroupParticipation: {
                type: 'object',
                required: ['groupId'],
                properties: { groupId: { type: 'string' } },
            },
            GroupMemberApproval: {
                type: 'object',
                required: ['groupId', 'memberId', 'status'],
                properties: {
                    groupId: { type: 'string' },
                    memberId: { type: 'string' },
                    status: { type: 'string', enum: ['APPROVED', 'REJECTED'] },
                },
            },
            MentorshipRequest: {
                type: 'object',
                required: ['mentorId'],
                properties: { mentorId: { type: 'string' } },
            },
            MentorshipStatus: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: { type: 'string', enum: ['APPROVED', 'CANCELLED', 'COMPLETED'] },
                },
            },
            MentorshipRating: {
                type: 'object',
                required: ['rating'],
                properties: {
                    rating: { type: 'integer', minimum: 1, maximum: 5 },
                    comment: { type: 'string', maxLength: 50 },
                },
            },
            Category: {
                type: 'object',
                required: ['name'],
                properties: { name: { type: 'string', example: 'Backend' } },
            },
        },
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
};

export const swaggerSpec = swaggerJSDoc({
    definition: swaggerDefinition,
    apis: ['./src/routes/*.js'],
});
