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
