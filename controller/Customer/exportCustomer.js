import fs from 'fs';
import * as xlsx from 'xlsx';
import Customer from '../../model/Customer';
import Company from '../../model/Company';

const exportCustomersToExcel = async (req, res) => {
    try {
        const customers = await Customer.find();
        if (!customers.length) {
            return res.status(404).json({
                status: 404,
                error: 'No customers found',
            });
        }

        // Format data for Excel
        const data = customers.map(customer => ({
            firstName: customer.firstName,
            lastName: customer.lastName,
            companyName: customer.companyName,
            industry: customer.industry,
            email: customer.email,
            phone: customer.phone,
            shippingAddress: customer.shippingAddress,
        }));

        // // Create a new workbook and worksheet
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Customers');


        // Write to a buffer
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Save the file locally
        fs.writeFileSync(xlsxFilePath, buffer);

        const fileUrl = await exportFile(xlsxFilePath);

        return res.status(200).json({
            status: 200,
            message: 'Customers exported and uploaded to Google Cloud successfully',
            fileUrl: fileUrl,
        });
    } catch (error) {
        console.error('Error exporting customers to Excel:', error.message);
        return res.status(500).json({
            status: 500,
            error: 'Internal Server Error',
        });
    }
};

export default exportCustomersToExcel;
