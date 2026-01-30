



import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';
import PayrollPeriod from '../../model/PayrollPeriod';
import Employee from '../../model/Employees';
import PeriodPayData from '../../model/ExpenseRequests';
import mongoose from 'mongoose';




const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);


const expenseGraph = async (req, res) => {

    try {
       
        const { year, payrollPeriodId  } = req.params;

        console.log(req.params)

      
        let company = await Company.findOne({ _id: req.payload.id });

        


        if (!company.companyName) {
            res.status(400).json({
                status: 400,
                error: 'No company has been created for this account'
            })
            return;
        }



        const monthlynetEarnings = await PeriodPayData.aggregate([
            {
              $match: {
                // payrollPeriodId: mongoose.Types.ObjectId(payrollPeriodId),
                approved: true,
                endDate: {
                  $gte: new Date(`${year}-01-01`),
                  $lt: new Date(`${year + 1}-01-01`),
                },
              },
            },
            {
              $group: {
                _id: { $month: '$dateRequested' },
                totalAmount: { $sum: '$amount' },
              },
            },
            {
              $project: {
                _id: 0,
                month: '$_id',
                totalAmount: 1,
              },
            },
          ])

          console.log({monthlynetEarnings})


          const monthlyTotalnetEarnings = Array(12).fill(0); // Initialize array for 12 months

     monthlynetEarnings.map((monthData) => {
            const { month, totalAmount: amount } = monthData;
            monthlyTotalnetEarnings[month - 1] =  amount; // Subtract 1 to match array index (0-based)
          });

          console.log({monthlyTotalnetEarnings})
      
          const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
          ];
      
          const response = monthlyTotalnetEarnings.reduce((acc, amount, index) => {
            acc.push({ [monthNames[index]]:  amount });
            return acc;
          }, []);

          const convertedData = response.map((monthObj) => {
            const monthName = Object.keys(monthObj)[0];
            const amount = monthObj[monthName];
            return { [monthName.toLowerCase()]: amount };
          });

          const compressedData = response.reduce((acc, monthObj) => {
            const monthName = Object.keys(monthObj)[0];
            const amount = monthObj[monthName];
            acc[monthName.toLowerCase()] = amount;
            return acc;
        }, {});
        
        console.log({compressedData});
// 
          console.log({convertedData})
          res.status(200).json({
            status: 200,
            success: true,
            data:  compressedData
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default expenseGraph;

































// const mongoose = require('mongoose');

// const PeriodPayData = mongoose.model('PeriodPayData', periodPayDataSchema);

// async function calculateMonthlyTotalnetEarnings(year, payrollPeriodId) {
//   try {
//     const monthlynetEarnings = await PeriodPayData.aggregate([
//       {
//         $match: {
//           payrollPeriodId: mongoose.Types.ObjectId(payrollPeriodId),
//           createdAt: {
//             $gte: new Date(`${year}-01-01`),
//             $lt: new Date(`${year + 1}-01-01`),
//           },
//         },
//       },
//       {
//         $group: {
//           _id: { $month: '$createdAt' },
//           totalnetEarnings: { $sum: '$netEarnings' },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           month: '$_id',
//           totalnetEarnings: 1,
//         },
//       },
//     ]);

//     const monthlyTotalnetEarnings = Array(12).fill(0); // Initialize array for 12 months

//     monthlynetEarnings.forEach((monthData) => {
//       const { month, totalnetEarnings: netEarnings } = monthData;
//       monthlyTotalnetEarnings[month - 1] = netEarnings; // Subtract 1 to match array index (0-based)
//     });

//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December',
//     ];

//     const response = monthlyTotalnetEarnings.reduce((acc, netEarnings, index) => {
//       acc.push({ [monthNames[index]]: netEarnings });
//       return acc;
//     }, []);

//     return { data: response };
//   } catch (error) {
//     console.error('Error calculating monthly total net pay:', error);
//     throw error;
//   }
// }

// // Example usage:
// const year = 2023; // Specify the year
// const payrollPeriodId = '61579862e5901e2d484aadcf'; // Replace with actual payrollPeriodId
// calculateMonthlyTotalnetEarnings(year, payrollPeriodId)
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.error(error);
//   });
