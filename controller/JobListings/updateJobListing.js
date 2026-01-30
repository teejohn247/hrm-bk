
import dotenv from 'dotenv';
import JobPost from '../../model/JobPost';

const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const updateJobListing = async (req, res) => {

    try {
   
        const { jobTitle, description, openingDate, closingDate, jobType, departmentId } = req.body;


        const check = await JobPost.findOne({ _id: req.params.id });

        console.log(req.body)


        if (!check) {
            res.status(400).json({
                status: 400,
                error: "JobPost doesn't exist"
            })
            return;
        }
        JobPost.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                jobTitle: jobTitle && jobTitle,
                description: description && description,
                openingDate: openingDate && openingDate,
                closingDate : closingDate && closingDate,
                jobType: jobType && jobType,
                departmentId: departmentId && departmentId
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
export default updateJobListing;