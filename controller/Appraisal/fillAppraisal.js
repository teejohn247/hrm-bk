
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';
import FinalRating from '../../model/FinalRating';
import Period from '../../model/AppraisalPeriod'
import AppraisalGroup from '../../model/AppraisalGroup';
import Employee from '../../model/Employees';




const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);

const fillAppraisal = async (req, res) => {

    try {
       
        const { groupId, groupKpis } = req.body;
        // const { groupId,  } = req.body;


        if (!groupId) {
            res.status(400).json({
                status: 400,
                error: 'GroupId is required'
            })
            return;
        }

        let employee = await Employee.findOne({ _id: req.payload.id });

        let groups = [];

        const group = await AppraisalGroup.findOne({ _id: groupId });

        console.log({group})

        // groups.push({
        //     employeeId: req.payload.id,
        //     employeeName: employee.fullName,
        //     managerId: employee.managerId,
        //     managerName: employee.managerName,
        //     companyId: group.company._id,
        //     companyName:  group.companyName,
        //     appraisalPeriodId:  group.appraisalPeriodId,
        //     appraisalPeriodName:  group.appraisalPeriodName,
        //     appraisalPeriodStartDate: group.appraisalPeriodStartDate,
        //     appraisalPeriodEndDate: group.appraisalPeriodEndDate,
        //     appraisalPeriodActiveDate:  group.appraisalPeriodActiveDate,
        //     appraisalPeriodInactiveDate:  group.appraisalPeriodInactiveDate,
        //     groupId: groupId,
        //     groupName: group.groupName,
        //     groupDescription: group.description,
        //     groupKpis,
        // });
     
        console.log({
            employeeId: req.payload.id,
            employeeName: employee.fullName,
            managerId: employee.managerId,
            managerName: employee.managerName,
            companyId: group.companyId,
            companyName:  group.companyName,
            appraisalPeriodId:  group.appraisalPeriodId,
            appraisalPeriodName:  group.appraisalPeriodName,
            appraisalPeriodStartDate: group.appraisalPeriodStartDate,
            appraisalPeriodEndDate: group.appraisalPeriodEndDate,
            appraisalPeriodActiveDate:  group.appraisalPeriodActiveDate,
            appraisalPeriodInactiveDate:  group.appraisalPeriodInactiveDate,
            groupId: groupId,
            groupName: group.groupName,
            groupDescription: group.description,
            groupRating:[{
                groupId: groupId,
                groupName: group.groupName,
                groupDescription: group.groupDescription,
                groupKpis
            }]
    })

       let finalGroup = new FinalRating({
                employeeId: req.payload.id,
                employeeName: employee.fullName,
                managerId: employee.managerId,
                managerName: employee.managerName,
                companyId: group.companyId,
                companyName:  group.companyName,
                appraisalPeriodId:  group.appraisalPeriodId,
                appraisalPeriodName:  group.appraisalPeriodName,
                appraisalPeriodStartDate: group.appraisalPeriodStartDate,
                appraisalPeriodEndDate: group.appraisalPeriodEndDate,
                appraisalPeriodActiveDate:  group.appraisalPeriodActiveDate,
                appraisalPeriodInactiveDate:  group.appraisalPeriodInactiveDate,
                groupId: groupId,
                groupName: group.groupName,
                groupDescription: group.description,
                groupRating:[{
                    groupId: groupId,
                    groupName: group.groupName,
                    groupDescription: group.groupDescription,
                    groupKpis
                }]
        })

        await finalGroup.save().then((adm) => {
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
export default fillAppraisal;



