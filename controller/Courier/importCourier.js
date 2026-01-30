import fs from 'fs';
import Courier from '../../model/Courier';
import csv from 'csvtojson';

const importFreights = async (req, res) => {
    try {
        const company = req.payload;

        // Validate uploaded file
        if (!req.file || !req.file.path) {
            return res.status(400).json({
                status: 400,
                message: 'CSV file is required'
            });
        }

        const filePath = req.file.path;
        const couriers = [];

        const jsonArray = await csv().fromFile(filePath);

        for (const row of jsonArray) {
            let {
                'Freight Name': courierName,
                'Freight Type': courierType,
                'Email': email,
                'Phone Number': phone,
                'Image': imageUrl,
                Street,
                City,
                State,
                Zipcode,
                Country
            } = row;

            // Ensure the 'freightType' is parsed as an array and any extra spaces or quotes are trimmed
            if (typeof courierType === 'string') {
                // Remove surrounding quotes and split by commas
                courierType = courierType.replace(/['"]+/g, '').split(',').map(item => item.trim());
            }

            const address = {
                street: Street,
                city: City,
                state: State,
                zipCode: Zipcode,
                country: Country
            };

            couriers.push({
                courierName,
                courierType,
                email,
                phoneNumber: phone,
                imageUrl,
                address,
                company: company.companyId,
                user: company.id
            });
        }

        // Find existing emails to avoid duplicates
        const existingEmails = await Courier.find({
            email: { $in: couriers.map(c => c.email) },
            company: company.companyId
        }).select('email');

        const existingSet = new Set(existingEmails.map(c => c.email));
        const newCouriers = couriers.filter(c => !existingSet.has(c.email));

        if (newCouriers.length > 0) {
            await Courier.insertMany(newCouriers);
        }

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.status(201).json({
            status: 201,
            message: 'Couriers imported successfully',
            importedCount: newCouriers.length,
            data: newCouriers
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            error: error.message || 'Server error'
        });
    }
};

export default importFreights;
