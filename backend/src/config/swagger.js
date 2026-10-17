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
