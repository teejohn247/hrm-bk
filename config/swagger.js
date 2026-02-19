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
    security: [{ bearerAuth: [] }],
    paths: {
      '/signIn': {
        post: {
          summary: 'User login (Company or Employee)',
          tags: ['Authentication'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'company@example.com' },
                    password: { type: 'string', example: 'password123' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Login successful' },
            400: { description: 'Invalid credentials' }
          }
        }
      },
      '/fetchModules': {
        get: {
          summary: 'Fetch all modules',
          tags: ['AceERP'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List of modules' } }
        }
      },
      '/subscriptionPlans': {
        get: {
          summary: 'Fetch subscription plans',
          tags: ['AceERP'],
          responses: { 200: { description: 'List of plans' } }
        }
      },
      '/uploadDocument': {
        post: {
          summary: 'Upload employee document',
          tags: ['Documents'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary' },
                    documentType: { type: 'string' },
                    documentName: { type: 'string' },
                    employeeId: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Document uploaded' } }
        }
      }
    }
  },
  apis: [
    './routes/adminRoute.js',
    './routes/leave.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };
