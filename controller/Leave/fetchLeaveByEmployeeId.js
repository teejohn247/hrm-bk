
import dotenv from 'dotenv';
import Role from '../../model/Leaves';
import Employee from '../../model/Employees';
import LeaveRecords from '../../model/LeaveRecords';




import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const fetchLeaveByEmployeeId  = async (req, res) => {

    try {

        const { page, limit, employeeId } = req.query;

        console.log({employeeId})




        const role = await LeaveRecords.find({userId: employeeId})
        .sort({_id: -1})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

        console.log(role.length)

        // if(role.length < 1){

        // // const emp= await Employee.findOne({_id: req.payload.id})

        // // if(emp){
        // //     const empp = await Role.find({companyId: emp.companyId})
        // //     .limit(limit * 1)
        // //     .skip((page - 1) * limit)
        // //     .exec();
    
        // //     const counts = await Role.find({companyId: emp.companyId}).countDocuments()
    
        // //     console.log(role)
    
        // //     res.status(200).json({
        // //         status: 200,
        // //         success: true,
        // //         data: empp,
        // //         totalPages: Math.ceil(counts / limit),
        // //         currentPage: page
        // //     })
    
        // //     return;
        // // }else{
        // //     res.status(400).json({
        // //         status: 400,
        // //         success: false,
        // //         data: "Leave doesnot exist",
        // //     })
    
        // //     return;
        // // }
        

        // }

        const count = await LeaveRecords.find({userId: employeeId}).countDocuments()

        console.log(role)

        res.status(200).json({
            status: 200,
            success: true,
            data: role,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        })

        return;
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default fetchLeaveByEmployeeId;



