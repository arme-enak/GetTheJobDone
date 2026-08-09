import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '../config';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Get The Job Done',
            version: '1.0.0',
            description: 'REST API documentation for GetTheJobDone',
            contact: {
                name: 'Arman',
                email: 'armenak.sh@gmail.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${config.port}`,
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
        // security: [
        //     {
        //         bearerAuth: [],
        //     },
        // ],
    },
    apis: [
        './src/modules/**/*.ts',
        './src/docs/schemas/**/*.ts',
    ],
};

export const swaggerSpec = swaggerJsdoc(options);