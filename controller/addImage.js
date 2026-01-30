
import dotenv from 'dotenv';
import Employee from '../model/Employees';
// import Roles from '../../model/Roles';


// import utils from '../../config/utils';

// import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const addImage = async (req, res) => {

    try {
   
        const check = await Employee.findOne({ _id: req.payload.id })

        if (!check) {
            res.status(400).json({
                status: 400,
                error: "Employee doesn't exist"
            })
            return;
        }
        // await check.updateOne({

        //     "personalInformation.gender": req.body.image
        
        // });
    

        Employee.findOneAndUpdate({ _id: req.payload.id}, { 
            $set: { 
               "profilePic": req.body.image,
            }
       },
       { upsert: true, new: true },

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
export default addImage;



