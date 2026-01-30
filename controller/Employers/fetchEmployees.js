import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import EmployeeTable from '../../model/EmployeeTable';
import mongoose from 'mongoose';

import Roles from '../../model/Roles';


import utils from '../../config/utils';

import { emailTemp } from '../../emailTemplate';
import Company from '../../model/Company';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);

/**
 * Helper function to safely convert string to ObjectId
 * @param {string} id - The ID to convert to ObjectId
 * @returns {mongoose.Types.ObjectId|null} - The ObjectId or null if invalid
 */
const safeObjectId = (id) => {
    try {
        return id ? new mongoose.Types.ObjectId(id) : null;
    } catch (error) {
        console.error(`Invalid ObjectId: ${id}`, error.message);
        return null;
    }
};


const fetchEmployees = async (req, res) => {

    try {

        // Extract query parameters
        let { page, limit, firstName, lastName, managerName, companyName, 
            department, designation, employeeCode, gender, email, employmentStartDate, search } = req.query;
            
        // Handle "undefined" string values by converting them to actual undefined
        // This makes parameters like page=undefined behave the same as if the parameter was omitted
        const processParam = (param) => param === 'undefined' || param === '' ? undefined : param;
        
        page = processParam(page);
        limit = processParam(limit);
        search = processParam(search);
        firstName = processParam(firstName);
        lastName = processParam(lastName);
        managerName = processParam(managerName);
        companyName = processParam(companyName);
        department = processParam(department);
        designation = processParam(designation);
        employeeCode = processParam(employeeCode);
        gender = processParam(gender);
        email = processParam(email);
        employmentStartDate = processParam(employmentStartDate);

        // Parse pagination parameters to numbers
        page = page ? parseInt(page) : 1;
        limit = limit ? parseInt(limit) : 10;

        // Build filter object
        let filterQuery = {};
        
        // Handle the combined search parameter
        if (search) {
            filterQuery.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { employeeCode: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } }
            ];
        } else {
            // If no search parameter, use individual filters
            if (firstName) filterQuery.firstName = { $regex: firstName, $options: 'i' };
            if (lastName) filterQuery.lastName = { $regex: lastName, $options: 'i' };
        }

        if (managerName) filterQuery.managerName = { $regex: managerName, $options: 'i' };
        if (companyName) filterQuery.companyName = { $regex: companyName, $options: 'i' };
        if (department) filterQuery.department = { $regex: department, $options: 'i' };
        if (designation) filterQuery.designation = { $regex: designation, $options: 'i' };
        if (employeeCode) filterQuery.employeeCode = { $regex: employeeCode, $options: 'i' };
        if (gender) filterQuery.gender = { $regex: gender, $options: 'i' };
        if (email) filterQuery.email = { $regex: email, $options: 'i' };
        if (employmentStartDate) filterQuery.employmentStartDate = employmentStartDate;

        const company = await Company.findOne({_id: req.payload.id});
        const employee = await Employee.findOne({_id: req.payload.id});

        console.log({filterQuery});
        console.log({company});
   
        const employeeTable = await EmployeeTable.find();
        
        // Check if pagination is requested
        // When page, limit, and search are all undefined, this will be false,
        // causing the API to return all employees without pagination
        const isPaginated = page !== undefined && limit !== undefined;
        console.log(`[fetchEmployees] isPaginated: ${isPaginated}, page: ${page}, limit: ${limit}, search: ${search}`);

        if(employee) {
            // Safely convert companyId to ObjectId
            const companyObjectId = safeObjectId(employee.companyId);
            if (!companyObjectId) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: `Invalid company ID format: ${employee.companyId}`
                });
            }
            
            filterQuery.companyId = companyObjectId;
            
            let employeeData;
            let count;

            if (isPaginated) {
                // Apply pagination if page and limit are provided
                employeeData = await Employee.find(filterQuery)
                    .sort({_id: -1})
                    .limit(limit * 1)
                    .skip((page - 1) * limit)
                    .exec();
                count = await Employee.find(filterQuery).countDocuments();
            } else {
                // Return all results if page and limit are not provided
                // This handles the case when page, limit, and search are all undefined
                employeeData = await Employee.find(filterQuery)
                    .sort({_id: -1})
                    .exec();
                count = employeeData.length;
            }

            console.log({employeeData}, {companyId: employee.companyId});

            if(!employeeData || employeeData.length === 0) {
                // Return 200 with empty data array instead of 404 error
                res.status(200).json({
                    status: 200,
                    success: true,
                    employeeTable,
                    data: [],
                    totalRecords: 0,
                    message: 'No employees found matching the criteria',
                    filters: {
                        search,
                        firstName,
                        lastName,
                        managerName,
                        companyName,
                        department, 
                        designation,
                        employeeCode,
                        gender,
                        email,
                        employmentStartDate
                    }
                });
                return;
            } else {
                const response = {
                    status: 200,    
                    success: true,
                    employeeTable,
                    data: employeeData,
                    totalRecords: count,
                    filters: {
                        search,
                        firstName,
                        lastName,
                        managerName,
                        companyName,
                        department, 
                        designation,
                        employeeCode,
                        gender,
                        email,
                        employmentStartDate
                    }
                };

                // Add pagination info only if pagination was requested
                if (isPaginated) {
                    response.totalPages = Math.ceil(count / limit);
                    response.currentPage = parseInt(page);
                }

                res.status(200).json(response);
                return;
            }
        } else if(company) {
            console.log(req.payload.id);
            // Safely convert companyId to ObjectId
            const companyObjectId = safeObjectId(req.payload.id);
            if (!companyObjectId) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: `Invalid company ID format: ${req.payload.id}`
                });
            }
            
            filterQuery.companyId = companyObjectId;
            
            let employeeData;
            let count;

            if (isPaginated) {
                // Apply pagination if page and limit are provided
                employeeData = await Employee.find(filterQuery)
                    .sort({_id: -1})
                    .limit(limit * 1)
                    .skip((page - 1) * limit)
                    .exec();
                count = await Employee.find(filterQuery).countDocuments();
            } else {
                // Return all results if page and limit are not provided
                // This handles the case when page, limit, and search are all undefined
                employeeData = await Employee.find(filterQuery)
                    .sort({_id: -1})
                    .exec();
                count = employeeData.length;
            }

            console.log({employeeData});
            console.log({count});

            if(!employeeData || employeeData.length === 0) {
                // Return 200 with empty data array instead of 404 error
                res.status(200).json({
                    status: 200,
                    success: true,
                    employeeTable,
                    data: [],
                    totalRecords: 0,
                    message: 'No employees found matching the criteria',
                    filters: {
                        search,
                        firstName,
                        lastName,
                        managerName,
                        companyName,
                        department, 
                        designation,
                        employeeCode,
                        gender,
                        email,
                        employmentStartDate
                    }
                });
                return;
            } else {
                const response = {
                    status: 200,    
                    success: true,
                    employeeTable,
                    data: employeeData,
                    totalRecords: count,
                    filters: {
                        search,
                        firstName,
                        lastName,
                        managerName,
                        companyName,
                        department, 
                        designation,
                        employeeCode,
                        gender,
                        email,
                        employmentStartDate
                    }
                };

                // Add pagination info only if pagination was requested
                if (isPaginated) {
                    response.totalPages = Math.ceil(count / limit);
                    response.currentPage = parseInt(page);
                }

                res.status(200).json(response);
                return;
            }
        } else {
            // If neither employee nor company found for the provided ID
            res.status(404).json({
                status: 404,
                success: false,
                error: 'No valid employee or company found for the authenticated user'
            });
            return;
        }
    } catch (error) {
        console.error("[fetchEmployees] Error:", error);
        
        // Check if it's a specific ObjectId error
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid ID format'
            });
        }
        
        // Generic error response
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || "An unknown error occurred"
        });
    }
};

export default fetchEmployees;



