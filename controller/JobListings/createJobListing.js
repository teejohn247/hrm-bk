
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import JobPost from '../../model/JobPost';
import Employee from '../../model/Employees';
import Department from '../../model/Department';




const sgMail = require('@sendgrid/mail')
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_KEY);



const createJobListing = async (req, res) => {

    try {
       
        const { jobTitle, description, openingDate, closingDate, jobType, departmentId, hiringManagerID } = req.body;


        let company = await Company.findOne({ _id: req.payload.id });
        console.log({company})

        const department = await Department.findOne({_id: departmentId})
        console.log({department})

        const employee = await Employee.findOne({_id: hiringManagerID ? hiringManagerID : department.managerID})

        console.log({employee})

        if (!company) {

            res.status(400).json({
                status: 400,
                error: 'This company does not exist'
            })
            return;
        }

        if (!department) {

            res.status(400).json({
                status: 400,
                error: 'This department does not exist'
            })
            return;
        }

        if (!employee) {

            res.status(400).json({
                status: 400,
                error: 'This employee does not exist'
            })
            return;
        }

       
       let jobPost = new JobPost({
            jobTitle, 
            description, 
            openingDate, 
            closingDate, 
            jobType, 
            departmentId,
            departmentName: department.departmentName,
            companyId: req.payload.id,
            companyName: company.companyName,
            hiringManagerID,
            hiringManager: employee.fullName
        })
        
        await jobPost.save().then((adm) => {
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
export default createJobListing;