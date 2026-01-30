
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


const createVisit = async (req, res) => {

    try {
 
        const { employeeId, guestName, checkIn,expectedCheckInTime, expectedCheckOutTime, checkOut, purpose, phoneNumber, email, visitDate} = req.body;


        // let company = await Company.findOne({ _id: req.payload.id });

        let emp = await Employee.findOne({ _id: employeeId });

        if (!emp) {
            res.status(400).json({
                status: 400,
                error: 'Employee does not exist'
            })
            return;
        }

       let group = new Visitor({
            guestName:guestName,
            companyId: emp.companyId,
            companyName: emp.companyName,
            employeeId,
            employeeName: emp.fullName,
            checkIn,
            phoneNumber,
            expectedCheckInTime,
            expectedCheckOutTime,
            email,
            checkOut,
            purpose,
            visitDate,
            status: "Expected"
        })

        await group.save().then((adm) => {
            console.log(adm)
            res.status(200).json({
                status: 200,
                success: true,
                data: adm
            })
        }).catch((err) => {
                console.error(err)
                res.status(400).json({
                    status: 400,
                    success: false,
                    error: err
                })
            })
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default createVisit;



