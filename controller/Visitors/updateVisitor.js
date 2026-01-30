
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';
import AppraisalGroup from '../../model/Rating';
import Visitor from '../../model/Visitor';
import Employee from '../../model/Employees';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);


const updateVisitor = async (req, res) => {

    try {
 
        const { employeeId, guestName, expectedCheckInTime,
            expectedCheckOutTime, checkIn, checkOut, purpose,  phoneNumber, email, visitDate} = req.body;


        let emp = await Visitor.findOne({ _id: req.params.id});

        // console.log({appraisal})

        if (!emp) {
            res.status(400).json({
                status: 400,
                error: 'Visitor does not exist'
            })
            return;
        }

        Visitor.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                guestName:guestName && guestName,
                employeeId,
                employeeName: emp.employeeId,
                checkIn,
                checkOut,
                expectedCheckInTime,
                expectedCheckOutTime,
                purpose,
                phoneNumber, 
                email,
                visitDate,
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
export default updateVisitor;



