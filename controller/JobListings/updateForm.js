
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



const updateForm = async (req, res) => {

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

       
        JobPostForms.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                formName: formName && formName, 
                formFields: formFields && formFields, 
                jobPostId: jobPostId && jobPostId
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
export default updateForm;