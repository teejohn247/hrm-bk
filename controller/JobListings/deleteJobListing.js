
import dotenv from 'dotenv';
import JobPost from '../../model/JobPost';



const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const deleteJobListing = async (req, res) => {

    try {

        const jobListing = await JobPost.find({_id: req.params.id})

        console.log({jobListing})
        if(jobListing.length < 1){
            res.status(404).json({
                status:404,
                success: false,
                error:'No jobListing Found'
            })
            return
        }else{
            JobPost.remove({ _id: req.params.id },
                function (
                    err,
                    result
                ) {
    
                    console.log(result)
    
                    if (err) {
                        res.status(401).json({
                            status: 401,
                            success: false,
                            error: err
                        })
                    }
                    else {
                        res.status(200).json({
                            status: 200,
                            success: true,
                            data: "Deleted JobListing successfully!"
                        })
                    }
    
                })
        }

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default deleteJobListing;



