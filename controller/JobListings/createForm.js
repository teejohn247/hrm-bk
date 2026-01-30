
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import JobPostForms from '../../model/JobPostForms';
import JobPost from '../../model/JobPost';

import Employee from '../../model/Employees';
import Department from '../../model/Department';




const sgMail = require('@sendgrid/mail')
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_KEY);



const createForm = async (req, res) => {

    try {
       
        const { formName, formFields, jobPostId } = req.body;


        let company = await Company.findOne({ _id: req.payload.id });
        console.log({company})

        const job = await JobPost.findOne({_id: jobPostId})
        console.log({job})

        if (!company) {

            res.status(400).json({
                status: 400,
                error: 'This company does not exist'
            })
            return;
        }

        if (!job) {

            res.status(400).json({
                status: 400,
                error: 'This job listing does not exist'
            })
            return;
        }

       
       let jobPost = new JobPostForms({
            formName, 
            formFields, 
            jobPostId 
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
export default createForm;