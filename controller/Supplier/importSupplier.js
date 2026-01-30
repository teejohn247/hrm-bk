import fs from 'fs';
import multer from 'multer';
import Supplier from '../../model/supplier';

const csv = require('csvtojson');

const importSuppliers = async (req, res) => {
    try {
        const company = req.payload;

        // Validate file existence
        if (!req.file || !req.file.path) {
            return res.status(400).json({
                status: 400,
                message: 'CSV file is required'
            });
        }

        const filePath = req.file.path;
        
        const suppliers = [];

        // Read and parse the CSV file
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {

                const chunk = JSON.parse(row.toString());

                const {
                    'Supplier Name': supplierName,
                    'Contact Person Name': contactPersonName,
                    'Email Address': email,
                    'Phone Number': phone,
                    Street,
                    City,
                    State,
                    Zipcode,
                    Country,
                    'ImageURL': imageUrl
                } = chunk;

                const address = {
                    street: Street,
                    city: City,
                    state: State,
                    zipCode: Zipcode,
                    country: Country
                  };

                suppliers.push({
                    supplierName,
                    contactPersonName,
                    email,
                    phone,
                    address,
                    imageUrl,
                    company: company.companyId,
                    user: company.id
                });
            })
            .on('end', async () => {
                // Check for duplicate suppliers in the database
                const existingEmails = await Supplier.find({ 
                    email: { $in: suppliers.map(supplier => supplier.email) },
                    company: company.companyId
                }).select('email');

                const existingEmailsSet = new Set(existingEmails.map(supplier => supplier.email));

                // Filter out duplicates
                const newSuppliers = suppliers.filter(supplier => !existingEmailsSet.has(supplier.email));

                // Save new suppliers to the database
                await Supplier.insertMany(newSuppliers);

                res.status(201).json({
                    status: 201,
                    message: 'Suppliers imported successfully',
                    data: newSuppliers
                });
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
};

export default importSuppliers;