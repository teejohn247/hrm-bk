import fs from 'fs';
import Customer from '../../model/Customer';
import Company from '../../model/Company';

const csv = require('csvtojson');




const importCustomersFromCSV = async (req, res) => {
    try {
        console.log(req.file)
        const filePath = req.file.path; // Assuming the file is uploaded and path is available in req.file
        const company = req.payload;

        const companyResult = await Company.findOne({ id: company.companyId });
        if (!companyResult) {
            return res.status(404).json({
                status: 404,
                error: 'Company not found',
            });
        }

        const externalRole = companyResult.systemRoles.find(role => role.roleName === 'External');
        if (!externalRole) {
            return res.status(400).json({
                status: 400,
                error: 'Role "External" not found',
            });
        }

        const jsonArray = await csv().fromFile(filePath);
        const processedResults = [];

        for (const row of jsonArray) {
            const {
                firstName,
                lastName,
                companyName,
                industry,
                email,
                phone,
                shippingAddress,
            } = row;

            // Check if customer exists
            const customerExist = await Customer.findOne({ email });
            if (customerExist) {
                processedResults.push({
                    email,
                    status: 'Skipped',
                    message: 'Customer already exists',
                });
                continue;
            }

            // Create new customer
            const newCustomer = new Customer({
                firstName,
                lastName,
                companyName,
                industry,
                email,
                phone,
                shippingAddress,
                company: company.companyId,
                systemRoles: externalRole,
                user: company.id,
            });

            try {
                const result = await newCustomer.save();
                processedResults.push({
                    email,
                    status: 'Created',
                    data: result,
                });
            } catch (error) {
                processedResults.push({
                    email,
                    status: 'Failed',
                    message: error.message,
                });
            }
        }

        return res.status(201).json({
            status: 201,
            message: 'CSV processed successfully',
            results: processedResults,
        });
    } catch (error) {
        console.error('Error importing customers from CSV:', error.message);
        return res.status(500).json({
            status: 500,
            error: 'Internal Server Error',
        });
    }
};

export default importCustomersFromCSV;
