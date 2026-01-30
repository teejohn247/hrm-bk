



// import dotenv from 'dotenv';
// import Role from '../../model/Role';
// import Company from '../../model/Company';
// import Leave from '../../model/Expense';
// import PayrollPeriod from '../../model/PayrollPeriod';
// import Employee from '../../model/Employees';
// import PeriodPayData from '../../model/PeriodPayData';
// import mongoose from 'mongoose';




// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);


// const payrollGraph = async (req, res) => {

//     try {
       
//         const { year, payrollPeriodId  } = req.params;


      
//         let company = await Company.findOne({ _id: req.payload.id });
//         let emp = await Employee.findOne({ _id: req.payload.id });

//         // let appraisal = await PayrollPeriod.findOne({ companyId:company._id,  _id : payrollPeriodId  });
//         // console.log({appraisal})

//         console.log({company})

//         const monthlynetEarnings = await PeriodPayData.aggregate([
//             {
//               $match: {
//                 // payrollPeriodId: mongoose.Types.ObjectId(payrollPeriodId),
//                 companyId: company ? req.payload.id : emp.companyId,
//                 createdAt: {
//                   $gte: new Date(`${year}-01-01`),
//                   $lt: new Date(`${year + 1}-01-01`),
//                 },
//               },
//             },
//             {
//               $group: {
//                 _id: { $month: '$createdAt' },
//                 totalEarnings: { $sum: '$totalEarnings' },
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 month: '$_id',
//                 totalEarnings: 1,
//               },
//             },
//           ])

//           console.log({monthlynetEarnings})


//           const monthlyTotalnetEarnings = Array(12).fill(0); // Initialize array for 12 months

//      monthlynetEarnings.map((monthData) => {
//             const { month, totalEarnings: totalEarnings } = monthData;
//             monthlyTotalnetEarnings[month - 1] =  totalEarnings; // Subtract 1 to match array index (0-based)
//           });

//           console.log({monthlyTotalnetEarnings})
      
//           const monthNames = [
//             'January', 'February', 'March', 'April', 'May', 'June',
//             'July', 'August', 'September', 'October', 'November', 'December',
//           ];
      
//           const response = monthlyTotalnetEarnings.reduce((acc,  totalEarnings, index) => {
//             acc.push({ [monthNames[index]]:  totalEarnings });
//             return acc;
//           }, []);

//           const convertedData = response.map((monthObj) => {
//             const monthName = Object.keys(monthObj)[0];
//             const totalEarnings = monthObj[monthName];
//             return { [monthName.toLowerCase()]: totalEarnings };
//           });

//           const compressedData = response.reduce((acc, monthObj) => {
//             const monthName = Object.keys(monthObj)[0];
//             const netEarnings = monthObj[monthName];
//             acc[monthName.toLowerCase()] = netEarnings;
//             return acc;
//         }, {});
        
//         console.log({compressedData});

//           console.log({convertedData})
//           res.status(200).json({
//             status: 200,
//             success: true,
//             data:  compressedData
//         })
//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })
//     }
// }
// export default payrollGraph;

































// // const mongoose = require('mongoose');

// // const PeriodPayData = mongoose.model('PeriodPayData', periodPayDataSchema);

// // async function calculateMonthlyTotalnetEarnings(year, payrollPeriodId) {
// //   try {
// //     const monthlynetEarnings = await PeriodPayData.aggregate([
// //       {
// //         $match: {
// //           payrollPeriodId: mongoose.Types.ObjectId(payrollPeriodId),
// //           createdAt: {
// //             $gte: new Date(`${year}-01-01`),
// //             $lt: new Date(`${year + 1}-01-01`),
// //           },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: { $month: '$createdAt' },
// //           totalnetEarnings: { $sum: '$netEarnings' },
// //         },
// //       },
// //       {
// //         $project: {
// //           _id: 0,
// //           month: '$_id',
// //           totalnetEarnings: 1,
// //         },
// //       },
// //     ]);

// //     const monthlyTotalnetEarnings = Array(12).fill(0); // Initialize array for 12 months

// //     monthlynetEarnings.forEach((monthData) => {
// //       const { month, totalnetEarnings: netEarnings } = monthData;
// //       monthlyTotalnetEarnings[month - 1] = netEarnings; // Subtract 1 to match array index (0-based)
// //     });

// //     const monthNames = [
// //       'January', 'February', 'March', 'April', 'May', 'June',
// //       'July', 'August', 'September', 'October', 'November', 'December',
// //     ];

// //     const response = monthlyTotalnetEarnings.reduce((acc, netEarnings, index) => {
// //       acc.push({ [monthNames[index]]: netEarnings });
// //       return acc;
// //     }, []);

// //     return { data: response };
// //   } catch (error) {
// //     console.error('Error calculating monthly total net pay:', error);
// //     throw error;
// //   }
// // }

// // // Example usage:
// // const year = 2023; // Specify the year
// // const payrollPeriodId = '61579862e5901e2d484aadcf'; // Replace with actual payrollPeriodId
// // calculateMonthlyTotalnetEarnings(year, payrollPeriodId)
// //   .then((result) => {
// //     console.log(result);
// //   })
// //   .catch((error) => {
// //     console.error(error);
// //   });


import dotenv from 'dotenv';
import Role from '../../model/Role';
import Company from '../../model/Company';
import Leave from '../../model/Expense';
import PayrollPeriod from '../../model/PayrollPeriod';
import Employee from '../../model/Employees';
import PeriodPayData from '../../model/PeriodPayData';
import mongoose from 'mongoose';

dotenv.config();

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_KEY);

const payrollGraph = async (req, res) => {
  try {
    const { year, payrollPeriodId } = req.params;
    let company = await Company.findOne({ _id: req.payload.id });
    let emp = await Employee.findOne({ _id: req.payload.id });

    // Use either the company or employee's companyId
    const companyId = company ? req.payload.id : emp.companyId;

    // Aggregate data to group by month for the specific year
    const monthlynetEarnings = await PeriodPayData.aggregate([
      {
        $match: {
          companyId,
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${+year + 1}-01-01`), // Ensure data is only for the specified year
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalEarnings: { $sum: '$totalEarnings' },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          totalEarnings: 1,
        },
      },
    ]);

    const monthlyTotalnetEarnings = Array(12).fill(0); // Initialize array for 12 months

    // Map aggregated earnings to the correct month index
    monthlynetEarnings.forEach((monthData) => {
      const { month, totalEarnings } = monthData;
      monthlyTotalnetEarnings[month - 1] = totalEarnings; // Subtract 1 to match array index (0-based)
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    // Format the response data
    const compressedData = monthlyTotalnetEarnings.reduce((acc, totalEarnings, index) => {
      acc[monthNames[index].toLowerCase()] = totalEarnings;
      return acc;
    }, {});

    // Send the response
    res.status(200).json({
      status: 200,
      success: true,
      data: compressedData,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      success: false,
      error: error.message,
    });
  }
};

export default payrollGraph;
