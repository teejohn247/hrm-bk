export const emailTemp = (data, subject) => {

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Notification</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap');
                .lato-regular {
                font-family: "Lato", sans-serif;
                font-weight: 400;
                font-style: normal;
                }
            </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: Lato, sans-serif; background-color: #E6F3FF;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 680px; background-color: #FFFFFF;">
                            <tr>
                                <td style="background: rgba(66, 133, 244, 1); padding: 20px 0;">
                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                            <td width="50%" style="text-align: left; padding-left: 30px;">
                                                <img src="https://aceall.io/wp-content/uploads/2024/09/aceHR.png" alt="Logo" width="96" style="display: block;">
                                            </td>
                                            <td width="50%" style="text-align: right; padding-right: 30px;">
                                                <img src="https://silo-inc.com/wp-content/uploads/2024/05/bell.png" alt="Bell Icon" width="64" style="display: block; margin-left: auto;">
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 30px;">
                                    <h1 style="font-size: 24px; font-weight: 700; font-family: Lato, sans-serif; margin-top: 0; margin-bottom: 30px;">${subject}</h1>
                                    <div style="margin-bottom: 20px; color: #404040;">
                                        ${data}
                                    </div>

                                    <div style="padding: 20px 0;">
                                        <p style="margin: 10px 0;">Thank you,</p>
                                        <p style="margin: 0; color: #808080;">Makers ERP Team</p>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #f4f4f4; padding: 20px;">
                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                            <td width="60%" valign="top">
                                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                    <tr>
                                                        <td style="padding-bottom: 10px;">
                                                            <img src="https://aceall.io/wp-content/uploads/2024/09/circle-1.png" alt="Location" width="25" style="vertical-align: middle;">
                                                            <span style="font-size: 14px; color: #808080; padding-left: 10px;">64c Toyin Street, Ikeja, 100271, Lagos, Nigeria.</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding-bottom: 10px;">
                                                            <img src="https://aceall.io/wp-content/uploads/2024/09/mail.png" alt="Email" width="25" style="vertical-align: middle;">
                                                            <a href="mailto:info@acehr.com" style="font-size: 14px; color: #808080; text-decoration: none; padding-left: 10px;">info@acehr.com</a>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <img src="https://aceall.io/wp-content/uploads/2024/09/phone-call-1.png" alt="Phone" width="25" style="vertical-align: middle;">
                                                            <a href="tel:+2347018219200" style="font-size: 14px; color: #808080; text-decoration: none; padding-left: 10px;">+234 (0) 701 017 1427</a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                            <td width="40%" valign="bottom" style="text-align: right;">
                                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                    <tr>
                                                        <td align="right" style="padding-bottom: 20px;">
                                                            <a href="#" style="text-decoration: none; padding-left: 10px;"><img src="https://aceall.io/wp-content/uploads/2024/09/instagram-1.png" alt="Instagram" width="25"></a>
                                                            <a href="#" style="text-decoration: none; padding-left: 10px;"><img src="https://aceall.io/wp-content/uploads/2024/09/linkedin.png" alt="LinkedIn" width="25"></a>
                                                            <a href="#" style="text-decoration: none; padding-left: 10px;"><img src="https://aceall.io/wp-content/uploads/2024/09/twitter.png" alt="Twitter" width="25"></a>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td align="right" style="font-size: 12px; color: #808080;">
                                                            Powered by <a href="https://aceall.io/" style="font-weight: 700; color: #808080; text-decoration: none;">Aceall</a> 
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>


`
}
module.exports = {
   emailTemp
}
