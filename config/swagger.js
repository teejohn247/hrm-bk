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
      '/signUp': {
        post: {
          summary: 'Step 1: Sign up and request email verification OTP',
          tags: ['Onboarding & Auth'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['accountType', 'companyName', 'email'],
                  properties: {
                    accountType: { type: 'string', example: 'Company' },
                    companyName: { type: 'string', example: 'Test Company' },
                    email: { type: 'string', example: 'test@example.com' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'OTP sent to email successfully' },
            400: { description: 'Validation error or email already exists' }
          }
        }
      },
      '/verify-otp': {
        post: {
          summary: 'Step 2: Verify 6-digit email OTP',
          tags: ['Onboarding & Auth'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'otp'],
                  properties: {
                    email: { type: 'string', example: 'test@example.com' },
                    otp: { type: 'string', example: '123456' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'OTP verified, returns verification token' },
            400: { description: 'Invalid or expired OTP' }
          }
        }
      },
      '/resend-otp': {
        post: {
          summary: 'Step 2: Resend 6-digit email OTP',
          tags: ['Onboarding & Auth'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    email: { type: 'string', example: 'test@example.com' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'New OTP sent to email' }
          }
        }
      },
      '/setPassword': {
        post: {
          summary: 'Step 3: Set account password after OTP verification',
          tags: ['Onboarding & Auth'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'test@example.com' },
                    password: { type: 'string', example: 'Secret123!' },
                    confirmPassword: { type: 'string', example: 'Secret123!' },
                    token: { type: 'string', description: 'Verification token from /verify-otp' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Password set, returns JWT auth token' },
            400: { description: 'Validation error' }
          }
        }
      },
      '/onboarding/industries': {
        get: {
          summary: 'Step 4: Fetch industry dropdown options',
          tags: ['Onboarding & Auth'],
          responses: {
            200: { description: 'List of industries' }
          }
        }
      },
      '/onboarding/company-sizes': {
        get: {
          summary: 'Step 4: Fetch company size dropdown options',
          tags: ['Onboarding & Auth'],
          responses: {
            200: { description: 'List of company size ranges' }
          }
        }
      },
      '/onboarding/workspace': {
        post: {
          summary: 'Step 4: Save workspace details (companyName, industry, size)',
          tags: ['Onboarding & Auth'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['industry', 'companySize'],
                  properties: {
                    companyName: { type: 'string', example: 'Test Company' },
                    industry: { type: 'string', example: 'Technology & Software' },
                    companySize: { type: 'string', example: '11-50' },
                    companyAddress: { type: 'string', example: '123 Business Way' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Workspace details saved' }
          }
        }
      },
      '/onboarding/modules': {
        get: {
          summary: 'Step 5: Get available ERP modules for selection',
          tags: ['Onboarding & Auth'],
          responses: {
            200: { description: 'List of selectable modules' }
          }
        },
        post: {
          summary: 'Step 5: Select modules and complete onboarding',
          tags: ['Onboarding & Auth'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['modules'],
                  properties: {
                    modules: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['hr', 'accounting', 'supplyChain']
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Modules activated and onboarding finalized' }
          }
        }
      },
      '/onboarding/status': {
        get: {
          summary: 'Get company onboarding status and current step',
          tags: ['Onboarding & Auth'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Current onboarding progress' }
          }
        }
      },
      '/onboarding/invite-employees': {
        post: {
          summary: 'Step 6: Invite employees by sending email invites with set-password links',
          tags: ['Onboarding & Auth'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['emails'],
                  properties: {
                    emails: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['alice@company.com', 'bob@company.com']
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Invitations processed and dispatched' },
            400: { description: 'Validation error' }
          }
        }
      },
      '/onboarding/skip-invite': {
        post: {
          summary: 'Skip employee invitation step and mark onboarding completed',
          tags: ['Onboarding & Auth'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Invitation step skipped, onboarding completed' }
          }
        }
      },
      '/company/account-info': {
        get: {
          summary: 'Settings: Fetch company account information (Image 2)',
          tags: ['Settings & Company Profile'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Company account info retrieved successfully' },
            404: { description: 'Company not found' }
          }
        },
        patch: {
          summary: 'Settings: Update company account information (Image 2)',
          tags: ['Settings & Company Profile'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    companyName: { type: 'string', example: 'Globex Corp' },
                    companyAddress: { type: 'string', example: '123 Main Street' },
                    country: { type: 'string', example: 'Nigeria' },
                    state: { type: 'string', example: 'Lagos' },
                    city: { type: 'string', example: 'Ikeja' },
                    language: { type: 'string', example: 'English' },
                    currency: { type: 'string', example: 'USD' },
                    companyLogo: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Account information updated successfully' }
          }
        }
      },
      '/company/account-info/logo': {
        patch: {
          summary: 'Settings: Upload company logo (Image 2)',
          tags: ['Settings & Company Profile'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    companyLogo: { type: 'string', format: 'binary' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Logo uploaded and updated successfully' }
          }
        }
      },
      '/company/roles-permissions': {
        get: {
          summary: 'Settings: Get active modules, roles, and granular permissions matrix (Image 3)',
          tags: ['Settings & Permissions'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Roles and permissions matrix retrieved successfully' }
          }
        },
        patch: {
          summary: 'Settings: Update modules toggle state and role permissions (Image 3)',
          tags: ['Settings & Permissions'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    moduleUpdates: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          moduleId: { type: 'string' },
                          name: { type: 'string' },
                          active: { type: 'boolean' }
                        }
                      }
                    },
                    roleUpdates: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          roleId: { type: 'string' },
                          roleName: { type: 'string' },
                          permissions: { type: 'array', items: { type: 'string' } }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Roles and permissions updated successfully' }
          }
        }
      },
      '/company/roles': {
        post: {
          summary: 'Settings: Create a new custom role (Image 3 "+ Add New Role")',
          tags: ['Settings & Permissions'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['roleName'],
                  properties: {
                    roleName: { type: 'string', example: 'Finance Analyst' },
                    description: { type: 'string', example: 'Handles accounting and invoices' },
                    permissions: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['View Invoices', 'Approve Expenses']
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'New role created successfully' }
          }
        }
      },
      '/company/billing-subscriptions': {
        get: {
          summary: 'Settings: Fetch billing, subscriptions, payment method card, and billing history (Image 4)',
          tags: ['Settings & Billing'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Subscription and billing details retrieved' }
          }
        }
      },
      '/subscriptions/cancel': {
        post: {
          summary: 'Settings: Cancel company subscription (Image 4)',
          tags: ['Settings & Billing'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reason: { type: 'string', example: 'Switching to another provider' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Subscription cancelled successfully' }
          }
        }
      },
      '/company/payment-method': {
        patch: {
          summary: 'Settings: Update company credit card / payment method (Image 4 "Manage Card")',
          tags: ['Settings & Billing'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    cardBrand: { type: 'string', example: 'Mastercard' },
                    cardLastFour: { type: 'string', example: '4567' },
                    cardholderName: { type: 'string', example: 'Jane Doe' },
                    expirationDate: { type: 'string', example: '11/27' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Payment method updated successfully' }
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
