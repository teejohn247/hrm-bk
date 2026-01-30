
import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Payroll from '../../model/Payroll';
import PeriodPayData from '../../model/PeriodPayData';
import Credits from '../../model/Credits';
import Debits from '../../model/Debit';

const csv = require('csvtojson');



const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);


const createPeriodPayData = async (req, res) => {

    try {

        console.log(req.file)
        let company = await Company.findOne({ _id: req.payload.id });

        let credits = await Credits.find({ companyId: company._id });
        let debits = await Debits.find({ _id: company._id });

        const deletePromises = [
            await PeriodPayData.deleteMany({ payrollPeriodId: req.params.id }),
          ]

          await Promise.all(deletePromises)



        csv()
        .fromFile(req.file.path)
        .then(async (jsonObj) => {
        console.log({jsonObj})


        console.log({jsonObj})

        const jsonObjKeys = Object.keys(jsonObj[0]);

        console.log({jsonObjKeys})

        // Gather all unique keys from credits and debits
          const allKeys = new Set();
          credits.forEach((credit) => {
          allKeys.add(credit.name);
          });
          debits.forEach((debit) => {
          allKeys.add(debit.name);
          });

// Convert Set to array
const allKeysArray = Array.from(allKeys);

console.log({allKeysArray})

// Check for missing keys
const missingKeys = allKeysArray.filter(key => !jsonObjKeys.includes(key));

        if (missingKeys.length === 0) {
        console.log('All keys exist in the CSV file headers!');
        // Proceed with further processing
        } else {
        console.log('Missing keys in the CSV file headers:', missingKeys.join(', '));

        res.status(400).json({
            status: 400,
            success: false,
            error: `Missing keys in the CSV file headers:', ${missingKeys.join(', ')}`
        })
        return
        // Handle missing keys as needed
        }

        jsonObj.map((data, index) => {
            data.companyName = company.companyName;
            data.companyId = req.payload.id;

          
        })
        for (const data of jsonObj) {
            const dynamicFields = {};
            for (const key of allKeysArray) {
              dynamicFields[key] = data[key] || 0;
            }
            const newPeriodPayData = new PeriodPayData({
                payrollPeriodId: req.params.id,
                employeeId: data.employeeIdId && data.employeeIdId,
                firstName: data.firstName,
                lastName: data.lastName,
                fullName:data.fullName,
                profilePic: data.profilePic,
                department: data.department,
                designation: data.designation,
                role: data.role, // Assigning role field from Employee model
                dynamicFields: dynamicFields,
                netEarnings: data.netEarnings,
                totalEarnings: data.totalEarnings,
                deductions: data.deductions,
                status: data.status, // Default status
              });
        
                await newPeriodPayData.save().then((adm) => {
                    console.log({adm});
                  
                }).catch((err) => {
                        console.error(err)
                        res.status(400).json({
                            status: 400,
                            success: false,
                            error: err
                        })
                    })
            }
            res.status(200).json({
                status: 200,
                success: true,
                data: jsonObj
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
export default createPeriodPayData;