
import dotenv from 'dotenv';
import AuditTrail from '../../model/AuditTrail';
import utils from '../../config/utils';
import { emailTemp } from '../../emailTemplate';

import Holiday from '../../model/Meetings';
import Employee from '../../model/Employees';

const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const updateMeeting = async (req, res) => {

    try {
   
        const { meetingDate, location, meetingStartTime, meetingEndTime, invitedGuests } = req.body;


        const check = await Holiday.findOne({ _id: req.params.id });

        console.log(req.body)


        if (!check) {
            res.status(400).json({
                status: 400,
                error: "Meeting doesn't exist"
            })
            return;
        }
    
        let groups = [];
    
        for (const groupId of invitedGuests) {
            console.log({ groupId });
    
            try {
                const group = await Employee.findOne({ email: groupId });

                console.log({group})
                
                groups.push({
                    employeeId: groupId,
                    employeeName: group.fullName,
                    profilePics: group.profilePic
                });
                console.log({ group });
            } catch (err) {
                console.error(err);
            }
        }

        Holiday.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                meetingDate: meetingDate && meetingDate,
                meetingStartTime: meetingStartTime && meetingStartTime,
                meetingEndTime: meetingEndTime && meetingEndTime,
                location : location && location,
                invitedGuests: groups
            }
       },
            function (
                err,
                result
            ) {
                if (err) {
                    res.status(401).json({
                        status: 401,
                        success: false,
                        error: err

                    })

                } else {
                    console.log({result})
                    res.status(200).json({
                        status: 200,
                        success: true,
                        data: "Update Successful"
                    })

                }
            })



    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default updateMeeting;



