
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Debit from '../../model/Debit';




const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);


const createDebits = async (req, res) => {

    try {
       
        const { name, description, type, value, refId} = req.body;

        let company = await Company.findOne({ _id: req.payload.id });

        let appraisal = await Debit.findOne({ companyId:company._id,  name: name });

        console.log({appraisal})

        if (!company.companyName) {
            res.status(400).json({
                status: 400,
                error: 'No company has been created for this account'
            })
            return;
        }


        if (appraisal) {
            res.status(400).json({
                status: 400,
                error: 'This debit name already exist'
            })
            return;
        }

       let group = new Debit({
            name: name,
            companyId: req.payload.id,
            companyName: company.companyName,
            type,
            value,
            refId,
            description,
        })

        await group.save().then((adm) => {
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
export default createDebits;



