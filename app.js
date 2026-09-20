import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db';
import userRouter from './routes/adminRoute';
import cors from 'cors';
import http from 'http';
import bodyParser from 'body-parser';
import multer from 'multer';
import DeviceDetector from 'node-device-detector';
import middlewareDetect from './middleware/middlewareDetect';
import { sendEmail } from './config/email';
import { emailTemp } from './emailTemplate';
import createSubdomainForAmplifyApp from './config/sub-domain';
import cron from 'node-cron';
import { updateSubscriptionStatuses } from './utils/subscriptionStatusManager';
import { swaggerSpec, swaggerUi } from './config/swagger.js';
import copilotRouter from './routes/copilot';

console.log('[boot] app.js imports finished');

export function mountApp(app, server) {
  dotenv.config();

  const upload = multer();

  app.use(express.json());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true,
  }));

  app.use(express.static('public'));
  app.use(middlewareDetect);
  app.use('/images', express.static('images'));
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.options('*', cors());

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
  });

  app.use('/api/copilot', copilotRouter);

  app.get('/test', async (req, res) => {
    const data = `<div>
            <p style="padding: 32px 0; text-align: left !important; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
            Hi 
            </p> 
    
            <p style="font-size: 16px; text-align: left !important; font-weight: 300;">
    
            You have been invited to join <a href="https://makers-hrm-1086159474664.europe-west1.run.app/set-password">Makers ERP Platform</a> as an employee 
    
            <br><br>
            </p>
            
            <div>`;

    const resp = emailTemp(data, 'Employee Invitation');
    const receivers = [{ email: 'teejohn247@gmail.com' }];

    await sendEmail(req, res, 'teejohn247@gmail.com', receivers, 'Employee Invitation', resp);
    res.json({ message: 'Welcome to greenpeg ERP Api' });
  });

  app.post('/create-subdomain', async (req, res) => {
    try {
      const result = await createSubdomainForAmplifyApp(req.body.subDomainName);
      res.status(200).json({ message: 'Subdomain created successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error creating subdomain', error });
    }
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ACEALL ERP API Documentation',
  }));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.use('/api/v1', userRouter);

  console.log('[boot] Express routes registered');
  connectDb();
}

cron.schedule('0 0 * * *', () => {
  updateSubscriptionStatuses();
});

/** @deprecated tests only — use bootstrap + mountApp in production */
export default express();
