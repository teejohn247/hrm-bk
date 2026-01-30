
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';
import FinalRating from '../../model/FinalRating';
import Period from '../../model/AppraisalPeriod'
import AppraisalGroup from '../../model/FinalRating';




const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const updateFinal = async (req, res) => {

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
     
        FinalRating.findOneAndUpdate({ _id: req.params.id}, { 
            $set: { 
                companyId: company._id ,
                companyName: company.companyName,
                appraisalPeriodId: appraisalPeriodId && appraisalPeriodId,
                appraisalPeriodName: appraisalPeriod.appraisalPeriodName && appraisalPeriod.appraisalPeriodName,
                appraisalPeriodStartDate: appraisalPeriod.StartDate && appraisalPeriod.StartDate,
                appraisalPeriodEndDate: appraisalPeriod.EndDate && appraisalPeriod.EndDate,
                appraisalPeriodActiveDate:  appraisalPeriod.activeDate && appraisalPeriod.activeDate,
                appraisalPeriodInactiveDate:  appraisalPeriod.inactiveDate && appraisalPeriod.inactiveDate,
                groupRating: groups && groups
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
export default updateFinal;