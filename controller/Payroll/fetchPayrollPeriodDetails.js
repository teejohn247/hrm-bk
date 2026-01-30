import dotenv from 'dotenv';
import Role from '../../model/Debit';
import PayrollPeriod from '../../model/PayrollPeriod';
import PeriodPayData from '../../model/PeriodPayData'
import Employee from '../../model/Employees';
import Company from '../../model/Company';



const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const fetchPayrollPeriodDetails = async (req, res) => {

    try {
        const { 
            page, 
            limit, 
            search, 
            firstName, 
            lastName, 
            department, 
            designation, 
            status, 
            minNetEarnings, 
            maxNetEarnings 
        } = req.query;

        // Determine if pagination is requested
        const isPaginated = page !== undefined && limit !== undefined;

        // Get the payroll period first
        const payrollPeriods = await PayrollPeriod.find({_id: req.params.id})
            .sort({endDate: 1})
            .exec();

        // If no payroll periods found, return early
        if (!payrollPeriods || payrollPeriods.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Payroll period not found'
            });
        }

        const comp = await Company.findOne({_id: req.payload.id});
        const employee = await Employee.findOne({_id: req.payload.id});

        const all = [];

        if (comp) {
            // For company administrators - can see all employees
            const promises = payrollPeriods.map(async (payrollPeriod) => {
                // Build filter for PayrollPeriodData
                let filterQuery = { payrollPeriodId: payrollPeriod._id };
                
                // Handle search parameter
                if (search) {
                    filterQuery.$or = [
                        { firstName: { $regex: search, $options: 'i' } },
                        { lastName: { $regex: search, $options: 'i' } },
                        { fullName: { $regex: search, $options: 'i' } }
                    ];
                } else {
                    // Individual filters if no search term provided
                    if (firstName) filterQuery.firstName = { $regex: firstName, $options: 'i' };
                    if (lastName) filterQuery.lastName = { $regex: lastName, $options: 'i' };
                }
                
                // Additional filters
                if (department) filterQuery.department = { $regex: department, $options: 'i' };
                if (designation) filterQuery.designation = { $regex: designation, $options: 'i' };
                if (status) filterQuery.status = { $regex: status, $options: 'i' };
                
                // Handle numeric range filters for earnings
                if (minNetEarnings || maxNetEarnings) {
                    filterQuery.netEarnings = {};
                    if (minNetEarnings) filterQuery.netEarnings.$gte = parseFloat(minNetEarnings);
                    if (maxNetEarnings) filterQuery.netEarnings.$lte = parseFloat(maxNetEarnings);
                }
                
                // Count total records that match the filter
                const totalCount = await PeriodPayData.find(filterQuery).countDocuments();
                
                // Apply pagination only if requested
                let periodData;
                if (isPaginated) {
                    periodData = await PeriodPayData.find(filterQuery)
                        .sort({ lastName: 1 })
                        .limit(limit * 1)
                        .skip((page - 1) * limit)
                        .exec();
                } else {
                    periodData = await PeriodPayData.find(filterQuery)
                        .sort({ lastName: 1 })
                        .exec();
                }
                
                all.push({
                    ...payrollPeriod.toObject(),
                    payrollPeriodData: periodData.map(emp => ({
                        _id: emp._id,
                        companyId: emp.companyId,
                        companyName: emp.companyName,
                        payrollPeriodId: payrollPeriod._id,
                        firstName: emp.firstName,
                        lastName: emp.lastName,
                        fullName: emp.fullName,
                        profilePic: emp.profilePic,
                        role: emp.role,
                        department: emp.department,
                        designation: emp.designation,
                        employeeId: emp.employeeId,
                        netEarnings: emp.netEarnings,
                        deductions: emp.deductions,
                        dynamicFields: emp.dynamicFields,
                        totalEarnings: emp.totalEarnings,
                        payeTax: emp.payeTax,
                        status: emp.status,
                    })),
                    totalRecords: totalCount,
                    ...(isPaginated && {
                        totalPages: Math.ceil(totalCount / limit),
                        currentPage: parseInt(page)
                    })
                });
            });
            
            await Promise.all(promises);
            
            res.status(200).json({
                status: 200,
                success: true,
                data: all,
                filters: {
                    applied: !!(search || firstName || lastName || department || designation || status || minNetEarnings || maxNetEarnings)
                }
            });
        } else if (employee) {
            // For regular employees - can only see their own data
            const promises = payrollPeriods.map(async (payrollPeriod) => {
                // For employees, always filter by their own ID
                let filterQuery = { 
                    payrollPeriodId: payrollPeriod._id, 
                    employeeId: req.payload.id 
                };
                
                // Count total records that match the filter (should be 0 or 1 for an employee)
                const totalCount = await PeriodPayData.find(filterQuery).countDocuments();
                
                const periodData = await PeriodPayData.find(filterQuery);
                
                all.push({
                    ...payrollPeriod.toObject(),
                    payrollPeriodData: periodData.map(emp => ({
                        _id: emp._id,
                        companyId: emp.companyId,
                        companyName: emp.companyName,
                        payrollPeriodId: payrollPeriod._id,
                        firstName: emp.firstName,
                        lastName: emp.lastName,
                        fullName: emp.fullName,
                        profilePic: emp.profilePic,
                        role: emp.role,
                        department: emp.department,
                        designation: emp.designation,
                        employeeId: emp.employeeId,
                        netEarnings: emp.netEarnings,
                        deductions: emp.deductions,
                        dynamicFields: emp.dynamicFields,
                        totalEarnings: emp.totalEarnings,
                        payeTax: emp.payeTax,
                        status: emp.status,
                    })),
                    totalRecords: totalCount
                });
            });
            
            await Promise.all(promises);
            
            res.status(200).json({
                status: 200,
                success: true,
                data: all
            });
        } else {
            res.status(403).json({
                status: 403,
                success: false,
                error: 'Unauthorized access'
            });
        }
    } catch (error) {
        console.error("[fetchPayrollPeriodDetails] Error:", error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An error occurred while fetching payroll period details'
        });
    }
}

export default fetchPayrollPeriodDetails;