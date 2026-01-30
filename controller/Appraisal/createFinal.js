
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';
import FinalRating from '../../model/FinalRating';
import Period from '../../model/AppraisalPeriod'
import AppraisalGroup from '../../model/AppraisalGroup';






const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);

const createFinal = async (req, res) => {

    try {
       
        const { appraisalPeriodId, groupIds } = req.body;

        if (!groupIds) {
            res.status(400).json({
                status: 400,
                error: 'GroupId is required'
            })
            return;
        }

        if (!appraisalPeriodId) {
            res.status(400).json({
                status: 400,
                error: 'AppraisalPeriodId is required'
            })
            return;
        }


        let company = await Company.findOne({ _id: req.payload.id });
        let appraisalPeriod = await Period.findOne({ companyId:company._id, _id: appraisalPeriodId });

        let groups = [];
        console.log(groupIds)

        for (const groupId of groupIds) {
            console.log({ groupId });
    
            try {
                const group = await AppraisalGroup.findOne({ _id: groupId });

                console.log({group})
    
                groups.push({
                    groupId: groupId,
                    groupName: group.groupName,
                    groupDescription: group.description,
                    groupKpis: group.groupKpis
                });
    
                console.log({ group });
            } catch (err) {
                console.error(err);
            }
        }
      
       let group = new FinalRating({
            companyId: company._id,
            companyName: company.companyName,
            appraisalPeriodId: appraisalPeriodId,
            appraisalPeriodName: appraisalPeriod.appraisalPeriodName,
            appraisalPeriodStartDate: appraisalPeriod.StartDate,
            appraisalPeriodEndDate: appraisalPeriod.EndDate,
            appraisalPeriodActiveDate:  appraisalPeriod.activeDate,
            appraisalPeriodInactiveDate:  appraisalPeriod.inactiveDate,
            groupRating: groups
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
export default createFinal;



