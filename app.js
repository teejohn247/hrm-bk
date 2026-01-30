import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db'
import userRouter from './routes/adminRoute';
import Debug from 'debug';
import cors from 'cors';
import http from 'http';
import bodyParser from 'body-parser';
import multer from 'multer';
import DeviceDetector from 'node-device-detector';
import middlewareDetect from './middleware/middlewareDetect'
import { cloudinaryConfig } from './config/cloudinary';
import { sendEmail } from './config/email';
import { emailTemp } from './emailTemplate';
import daysUsed from './cron/daysUsed';
import createSubdomainForAmplifyApp from './config/sub-domain';
import cron from 'node-cron';
import { updateSubscriptionStatuses } from './utils/subscriptionStatusManager';

const upload = multer()
const app = express();
dotenv.config();

app.use(express.json());
// app.use(upload.single());÷

app.use(bodyParser.json({
  limit: '50mb'
}));

app.use(bodyParser.urlencoded({
  limit: '50mb',
  parameterLimit: 100000,
  extended: true 
}))

const server = http.createServer(app);
const { Server } = require("socket.io");



app.use(express.static('public'));



// init deviceDetector
const deviceDetector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
});


const hasBotResult = (result) => {
  return result && result.name;
}


// attach middleware
app.use(middlewareDetect);

app.use(express.static('public')); 
app.use('/images', express.static('images'));

// app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options('*', cors());
 
const allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', "*");
  next();
};
app.use(allowCrossDomain);


const port = process.env.PORT || 8800;
const debug = Debug('http');


connectDb()

let hostname = '0.0.0.0'

// cron.schedule("* * * * *", async function () {
//   console.log("---------------------");
//  const ans = await daysUsed()
//  console.log(ans)
//  console.log("running a task every 60 seconds");

//  return ans;
  

// });

app.get('/test', async (req, res) => {

  let data = `<div>
            <p style="padding: 32px 0; text-align: left !important; font-weight: 700; font-size: 20px;font-family: 'DM Sans';">
            Hi 
            </p> 
    
            <p style="font-size: 16px; text-align: left !important; font-weight: 300;">
    
            You have been invited to join <a href="https://www.acehr.app/set-password">greenpeg ERP Platform</a> as an employee 
    
            <br><br>
            </p>
            
            <div>`
    
           let resp = emailTemp(data, 'Employee Invitation')


           const receivers = [
            {
              email: 'teejohn247@gmail.com'
            }
          ]
    
            await sendEmail(req, res, 'teejohn247@gmail.com', receivers, 'Employee Invitation', resp);
  res.json({
    message: 'Welcome to greenpeg ERP Api'
  });
});

// Endpoint to create subdomain
app.post('/create-subdomain', async (req, res) => {
  try {
    const result = await createSubdomainForAmplifyApp(req.body.subDomainName);
    res.status(200).json({ message: 'Subdomain created successfully', result });
  } catch (error) {
    res.status(500).json({ message: 'Error creating subdomain', error });
  }
});

app.use('/api/v1', userRouter);

server.listen(port, () => console.log(`Server has started. ${port}`))
export default app;

// Run every day at midnight
cron.schedule('0 0 * * *', () => {
    updateSubscriptionStatuses();
});