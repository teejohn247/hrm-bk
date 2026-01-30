import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import EmployeeTable from '../../model/EmployeeTable';

import Roles from '../../model/Roles';


import utils from '../../config/utils';

import { emailTemp } from '../../emailTemplate';
import LeaveRecords from '../../model/LeaveRecords';
import Company from '../../model/Company';



const sgMail = require('@sendgrid/mail')

dotenv.config();


sgMail.setApiKey(process.env.SENDGRID_KEY);



const getAdminRecords = async (req, res) => {

    try {

        const { 
            page, 
            limit, 
            firstName,
            lastName,
            fullName,
            leaveTypeName,
            status,
            department,
            startDate,
            endDate,
            approved
        } = req.query;

        const comp = await Employee.findOne({_id: req.payload.id})
        const allComp = await Company.findOne({_id: req.payload.id})

        console.log({comp})
        console.log({allComp})

        // Build filter object
        let filterQuery = {};
        
        if (firstName) filterQuery.firstName = { $regex: firstName, $options: 'i' };
        if (lastName) filterQuery.lastName = { $regex: lastName, $options: 'i' };
        if (leaveTypeName) filterQuery.leaveTypeName = leaveTypeName;
        if (status) filterQuery.status = status;
        if (department) filterQuery.department = department;
        if (approved !== undefined) filterQuery.approved = approved === 'true';
        
        // Date range filter
        if (startDate || endDate) {
            filterQuery.leaveStartDate = {};
            if (startDate) filterQuery.leaveStartDate.$gte = startDate;
            if (endDate) filterQuery.leaveStartDate.$lte = endDate;
        }

        if(comp){
            filterQuery.companyId = comp.companyId;
            filterQuery.leaveApprover = req.payload.id;
        } else if(allComp){
            filterQuery.companyId = req.payload.id;
        }

        const employee = await LeaveRecords.find(filterQuery)
            .sort({_id: -1}) 
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
    
        console.log({employee})
    
        
    
        const count = await LeaveRecords.find(filterQuery).countDocuments();
    
        if(!employee){
            res.status(404).json({
                status:404,
                success: false,
                error:'No employee Found'
            })
            return
        }else{
            res.status(200).json({
                status: 200,
                success: true,
                data: employee,
                totalPages: Math.ceil(count / limit),
                currentPage: page
            })
        }
        return

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default getAdminRecords;



