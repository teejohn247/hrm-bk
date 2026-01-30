import dotenv from 'dotenv';
// import { simpleParser } from 'mailparser';
// import Imap from 'imap';
import Email from '../../model/Email';
import Customer from '../../model/Employees';
import HTTP_STATUS from 'http-status-codes';

dotenv.config();

const fetchEmails = async (req, res) => {
    try {

        res.status(HTTP_STATUS.OK).json({
            status: HTTP_STATUS.OK,
            success: true,
            message: req.body
        });

        
        // const imap = new Imap({
        //     user: process.env.EMAIL_USER,
        //     password: process.env.EMAIL_PASSWORD,
        //     host: process.env.EMAIL_HOST,
        //     port: process.env.EMAIL_PORT,
        //     tls: true,
        //     tlsOptions: {
        //         rejectUnauthorized: false  // This disables SSL certificate validation
        //       }
        // });

        // imap.once('ready', () => {
        //     imap.openBox('INBOX', false, (err, box) => {
        //         if (err) throw err;

        //         const fetchOptions = {
        //             bodies: ['HEADER', 'TEXT'],
        //             markSeen: false
        //         };

        //         imap.search(['UNSEEN'], (err, results) => {
        //             if (err) throw err;

        //             const fetch = imap.fetch(results, fetchOptions);

        //             fetch.on('message', (msg) => {
        //                 msg.on('body', (stream, info) => {
        //                     simpleParser(stream, async (err, parsed) => {
        //                         if (err) throw err;

        //                         const { from, subject, text, html, date } = parsed;

        //                         // Check if the recipient email is registered in our CRM
        //                         const customer = await Customer.findOne({ email: 'teejohn247@gmail.com'});

        //                         if (customer) {
        //                             // Save the email in our database
        //                             const newEmail = new Email({
        //                                 userId: customer._id,
        //                                 // from: from,
        //                                 subject,
        //                                 body: text || html,
        //                                 receivedDate: Date.now()
        //                             });

        //                             await newEmail.save();
        //                         }
        //                     });
        //                 });
        //             });

        //             fetch.once('error', (err) => {
        //                 console.error('Fetch error:', err);
        //             });

        //             fetch.once('end', () => {
        //                 console.log('Fetching completed');
        //                 imap.end();
        //             });
        //         });
        //     });
        // });

        // imap.once('error', (err) => {
        //     console.error('IMAP connection error:', err);
        // });

        // imap.once('end', () => {
        //     console.log('IMAP connection ended');
        // });

        // imap.connect();

        // res.status(HTTP_STATUS.OK).json({
        //     status: HTTP_STATUS.OK,
        //     success: true,
        //     message: 'Email fetching process initiated'
        // });

    } catch (error) {
        console.error('Error in fetchEmails:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            success: false,
            error: 'An error occurred while fetching emails'
        });
    }
};

export default fetchEmails;
