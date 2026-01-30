
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';
import AppraisalGroup from '../../model/Rating';
import createGroup from './CreateGroup';




const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const updateRating = async (req, res) => {

    try {
       
        const { name, description, value } = req.body;


        let company = await Company.findOne({ _id: req.payload.id });

        let appraisal = await  AppraisalGroup.findOne({ companyId:company._id,  ratingName: name });

        console.log({appraisal})

        if (!company.companyName) {
            res.status(400).json({
                status: 400,
                error: 'No company has been created for this account'
            })
            return;
        }
        // if (appraisal && String(appraisal._id) !== req.params.id) {
        //     res.status(400).json({
        //         status: 400,
        //         error: 'This rating name already exist'
        //     })
        //     return;
        // }
 
     
        AppraisalGroup.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                ratingName: name && name,
                value: value && value,
                companyId: req.payload.id,
                companyName: company.companyName,
                description: description && description,
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
export default updateRating;