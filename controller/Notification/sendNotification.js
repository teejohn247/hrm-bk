
import dotenv from 'dotenv';
import Notifications from '../../model/NotificationLog';
import utils from '../../config/utils';

import { emailTemp } from '../../emailTemplate';
import axios from 'axios';
import { x } from 'joi';
let request = require('request');


const sgMail = require('@sendgrid/mail')

dotenv.config();



sgMail.setApiKey(process.env.SENDGRID_KEY);



const sendNotication = async (req, res) => {

    try {

        const { notificationTypeName, schools, message, channel, date } = req.body;



        if (channel == "email") {
            let emails = [];

            schools.map((assign, index) => {
                emails.push(assign.schoolEmail)
            })


            let msgs = message


            if (req.file !== undefined) {

                msgs = msgs + ` Find attachment:` + req.file.location

            }


            let resp = emailTemp(msgs, 'Nigenius SMS Notification')

            const msg = {
                to: emails, // Change to your recipient
                from: 'smsnebula@nigenius.ng',
                send_at: date && date,
                subject: 'Nigenius SMS Notification',
                // text: 'This is a test email',
                html: `${resp},`
            }
            console.log(req.file)

            console.log(notificationTypeName,
                schools,
                message,
                channel,
                req.payload.id)

            let attachment = ''


            if (req.file !== undefined) {

                attachment = req.file.location

            }


            let notifications = new Notifications({
                notificationTypeName,
                schools,
                message,
                attachment,
                channel,
                created_by: req.payload.id
            })





            await notifications.save().then(() => {

                sgMail.sendMultiple(msg)
                res.status(200).json({
                    status: 200,
                    success: true,
                    data: "Notification Sent"
                })
            }).catch((err) => {
                console.error(err)
                res.status(400).json({
                    status: 400,
                    success: false,
                    error: err
                })
            })

        } else if (channel === 'sms') {

            let phone = [];
            schools.map((assign, index) => {
                if (assign.schoolPhoneNumber.startsWith('234')) {
                    phone.push(assign.schoolPhoneNumber)
                } else {
                    phone.push(`234` + assign.schoolPhoneNumber)
                }

            })

            let msg = message


            if (req.file !== undefined) {

                msg = msg + ` Find attachment: ` + req.file.location

            }

            var data = {
                "to": phone,
                "from": "Nigenius",
                "sms": msg,
                "type": "plain",
                "api_key": process.env.TERMI,
                "channel": "generic"
            };
            var options = {
                'method': 'POST',
                'url': process.env.TERMI_URL,
                'headers': {
                    'Content-Type': ['application/json', 'application/json']
                },
                body: JSON.stringify(data)


            };
            request(options, function (error, response) {
                if (error) {
                    throw new Error(error);
                } else {
                    console.log(response.body);

                    let notifications = new Notifications({
                        notificationTypeName,
                        schools,
                        message,
                        attachment: req.file && req.file.location,
                        channel,
                        created_by: req.payload.id
                    })

                    notifications.save().then(() => {

                        res.status(200).json({
                            status: 200,
                            success: true,
                            data: "SMS Sent"
                        })
                    }).catch((err) => {
                        console.error(err)
                        res.status(400).json({
                            status: 400,
                            success: false,
                            error: err
                        })
                    })
                }



            });

        } else if (channel === 'whatsapp') {

            let phone = [];
            schools.map((assign, index) => {
                if (assign.schoolPhoneNumber.startsWith('234')) {
                    phone.push(assign.schoolPhoneNumber)
                } else {
                    phone.push(`234` + assign.schoolPhoneNumber)
                }

            })

            if (phone.length > 1) {
                res.status(400).json({
                    status: 400,
                    success: false,
                    error: "You can only send whatsapp messages to one school at a time"
                })
                return;
            }

            let msg = message


            if (req.file !== undefined) {

                msg = msg + ` Find attachment: ` + req.file.location

            }

            // var data = {
            //     "messaging_product": "whatsapp",
            //     "recipient_type": "individual",
            //     "to": phone[0],
            //     "type": "text",
            //     "text": {
            //         "preview_url": false,
            //         "body": msg
            //     }
            // }
            var config = {
                'method': 'POST',
                'url': process.env.WHATSAPP_URL,
                headers: {
                    'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                },

                data: JSON.stringify({
                    "messaging_product": "whatsapp",
                    "recipient_type": "individual",
                    "to": phone[0],
                    "type": "text",
                    "text": {
                        "preview_url": false,
                        "body": msg
                    }
                })


            };
            console.log(config)
            axios(config).then(function (response) {
                console.log(response)
                res.sendStatus(200);
                return;
              })
              .catch(function (error) {
                console.log(error);
                console.log(error.response.data);
                res.status(500).json({
                    status: 500,
                    success: false,
                    error: error.response.data
                })
                return;
              });
            // console.log(process.env.WHATSAPP_URL)
            // axios.defaults.headers.common['Authorization'] = ACCESS_TOKEN;

            // axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

            // axios.post('https://graph.facebook.com/v16.0/106867212314001/messages', {
            //     "messaging_product": "whatsapp",
            //     "recipient_type": "individual",
            //     "to": phone[0],
            //     "type": "text",
            //     "text": {
            //         "preview_url": false,
            //         "body": msg
            //     }
            // })
            //     .then(function (response) {
            //         console.log(response);
            //     })

            return;
            const response = await axios.post(process.env.WHATSAPP_URL, {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": phone[0],
                "type": "text",
                "text": {
                    "preview_url": false,
                    "body": msg
                }
            }
            ).then((res) => {
                console.log(res)
            });
            // const result = await response.json();

            console.log(response.json())

            res.status(200).json(result);
            return;

            axios.post(process.env.WHATSAPP_URL, headers, body)
                .then(response => {
                    res.status(200).json(response.data);
                })
                .catch((err) => {
                    res.status(500).json({ message: err });
                });

            axios(options, function (error, response) {
                if (error) {
                    res.status(400).json({
                        status: 400,
                        success: false,
                        error: error
                    })

                } else {
                    console.log(response.data.error, phone[0]);

                    let notifications = new Notifications({
                        notificationTypeName,
                        schools,
                        message,
                        attachment: req.file && req.file.location,
                        channel,
                        created_by: req.payload.id
                    })

                    notifications.save().then(() => {

                        res.status(200).json({
                            status: 200,
                            success: true,
                            data: "SMS Sent"
                        })
                    }).catch((err) => {
                        console.error(err)
                        res.status(400).json({
                            status: 400,
                            success: false,
                            error: err
                        })
                    })
                }



            });

        }

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default sendNotication;



