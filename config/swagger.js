import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ACEALL ERP API',
      version: '1.0.0',
      description: 'API documentation for ACEALL ERP Backend',
      contact: {
        name: 'API Support',
        email: 'info@acehr.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8800}/api/v1`,
        description: 'Development server'
      },
      {
        url: 'https://api.acehr.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /signIn endpoint'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controller/**/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };
