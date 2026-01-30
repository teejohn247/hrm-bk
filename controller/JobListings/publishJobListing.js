
import dotenv from 'dotenv';
import JobPost from '../../model/JobPost';



import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const publishJobListing = async (req, res) => {

    try {

        const { publish } = req.body;


        const role = await JobPost.findOne({_id: req.params.id})


        if (role.length < 1) {
            res.status(400).json({
                status: 400,
                error: "JobPost doesn't exist"
            })
            return;
        }
        console.log({role})
        JobPost.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                status: publish == true ? "active" : publish == false ? "inactive" : role.status
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
export default publishJobListing;