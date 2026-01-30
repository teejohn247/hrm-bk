
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';
import AppraisalGroup from '../../model/Kpi';




const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const updateKPI = async (req, res) => {

    try {
       
            const { name, description, weight, threshold, target, max, type } = req.body;


        let company = await Company.findOne({ _id: req.payload.id });

        let appraisal = await AppraisalGroup.findOne({ companyId:company._id,  kpiName: name });

        console.log({appraisal})

        if (!company.companyName) {
            res.status(400).json({
                status: 400,
                error: 'No company has been created for this account'
            })
            return;
        }


        if (appraisal && String(appraisal._id) !== req.params.id) {
            res.status(400).json({
                status: 400,
                error: 'This kpi name already exist'
            })
            return;
        }


        AppraisalGroup.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                kpiName: name && name,
                companyId: req.payload.id,
                companyName: company.companyName,
                description: description && description,
                weight: weight && weight,
                threshold: threshold && threshold,
                target: target && target,
                max: max && max,
                type: type && type,
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
export default updateKPI;