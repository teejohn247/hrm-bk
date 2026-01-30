import nodemailer, { Transporter } from 'nodemailer';
var SibApiV3Sdk = require('sib-api-v3-sdk');
var defaultClient = SibApiV3Sdk.ApiClient.instance;
// Define an email configuration object
var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SMTP_API;




const emailConfig = {
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false, // only for testing purposes, should be true in production
  },
};

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport(emailConfig);

// Function to send an email
export const sendEmail = async (
  req, res,
  to, receivers,
  subject,
  html
) => {
  try {
    // Send an email
    var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const senders = {
      email: process.env.SMTP_USERNAME,
      name: process.env.SMTP_COMPANY
    }
    
    await apiInstance.sendTransacEmail({
      sender: senders,
      to: receivers,
      from: process.env.EMAIL_FROM, // Sender's email address
      subject, // Email subject
      htmlContent: html, // HTML version of the email (optional)
    }).then((res) => {
      console.log('Email sent successfully.', res);

    })
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
