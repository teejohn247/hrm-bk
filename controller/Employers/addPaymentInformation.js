
// import dotenv from 'dotenv';
// import Employee from '../../model/Employees';
// import Roles from '../../model/Roles';
// import AuditTrail from '../../model/AuditTrail';

// import Company from '../../model/Company';

// import utils from '../../config/utils';

// import { emailTemp } from '../../emailTemplate';


// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const addPayment = async (req, res) => {

//     try {
//         console.log(req.payload.id)

//         const { bankAddress, bankName, accountNumber, sortCode, taxIdentificationNumber, accountName } = req.body;
//         let company = await Company.findOne({ _id: req.payload.id });


//         const check = await Employee.findOne({ _id: req.payload.id })

//         if(check){
//             console.log({ check })
//             console.log(req.body, 'test')
    
    
//             if (!check) {
//                 res.status(400).json({
//                     status: 400,
//                     error: "Employee doesn't exist"
//                 })
//                 return;
//             }
    
//             // console.log(check.paymentInformation[0]._id)
    
//             if (check.paymentInformation && check.paymentInformation.length < 1) {
//                 console.log('kjds')
//                 Employee.findOneAndUpdate({ _id: req.payload.id },
//                     {
//                         $push: {
//                             paymentInformation: {
    
//                                 bankName: bankName && bankName,
//                                 bankAddress: bankAddress && bankAddress,
//                                 accountNumber: accountNumber && accountNumber.toString(),
//                                 sortCode: sortCode && sortCode,
//                                 accountName: accountName && accountName,
//                                 taxIdentificationNumber: taxIdentificationNumber && taxIdentificationNumber
    
//                             }
//                         }
//                     },
//                     function (
//                         err,
//                         result
//                     ) {
//                         if (err) {
//                             res.status(401).json({
//                                 status: 401,
//                                 success: false,
//                                 error: err
    
//                             })
    
//                         } else {
    
    
//                             res.status(200).json({
//                                 status: 200,
//                                 success: true,
//                                 data: "Update Successful"
//                             })
//     return
//                         }
//                     })
//             } else {
//                 console.log('2kjds')
    
//                 Employee.findOneAndUpdate({ _id: req.payload.id }, {
//                     $set: {
//                         "paymentInformation.$[i].bankName": bankName && bankName,
//                         "paymentInformation.$[i].bankAddress": bankAddress && bankAddress,
//                         "paymentInformation.$[i].accountNumber": accountNumber && accountNumber.toString(),
//                         "paymentInformation.$[i].sortCode": sortCode && sortCode,
//                         "paymentInformation.$[i].accountName":accountName && accountName,
//                         "paymentInformation.$[i].taxIdentificationNumber":taxIdentificationNumber && taxIdentificationNumber,
    
//                     }
//                 },
//                     {
//                         arrayFilters: [
//                             {
//                                 "i._id": check.paymentInformation[0]._id
//                             }
//                         ]
//                     },
//                     function (
//                         err,
//                         result
//                     ) {
//                         if (err) {
//                             res.status(401).json({
//                                 status: 401,
//                                 success: false,
//                                 error: err
    
//                             })
    
//                         } else {
    
    
    
//                             // res.status(200).json({
//                             //     status: 200,
//                             //     success: true,
//                             //     data: "Update Successful"
//                             // })
    
//                         }
    
    
                      
//                     })
    
//                     // const checkUpdated = await Employee.findOne({ _id: req.payload.id })
    
//                     // console.log(checkUpdated)
//                     // console.log(checkUpdated.officialInformation[0].officialEmail)
//                     // AuditTrail.findOneAndUpdate({ companyId: check.companyId },
//                     //     {
//                     //         $push: {
//                     //             humanResources: {
    
//                     //                 userName: `${checkUpdated.personalInformation[0].firstName} ${checkUpdated.personalInformation[0].lastName}`,
//                     //                 email: checkUpdated.officialInformation[0].officialEmail,
//                     //                 action: `Super admin updated ${checkUpdated.personalInformation[0].firstName} ${checkUpdated.personalInformation[0].lastName} bank details`,
//                     //                 dateTime: new Date()
//                     //             }
//                     //         }
//                     //     },
//                     //     function (
//                     //         err,
//                     //         result
//                     //     ) {
//                     //         if (err) {
//                     //             res.status(401).json({
//                     //                 status: 401,
//                     //                 success: false,
//                     //                 error: err
    
//                     //             })
    
//                     //         } else {
    
    
//                                 res.status(200).json({
//                                     status: 200,
//                                     success: true,
//                                     data: "Update Successful"
//                                 })
    
//                                 return;
    
//                     //         }
//                     //     })

            
//         }

//         } else if(company){
//             onsole.log({ check })
//             console.log(req.body, 'test')
    
    
//             if (!check) {
//                 res.status(400).json({
//                     status: 400,
//                     error: "Employee doesn't exist"
//                 })
//                 return;
//             }
    
//             // console.log(check.paymentInformation[0]._id)
    
//             if (check.paymentInformation && check.paymentInformation.length < 1) {
//                 console.log('kjds')
//                 Employee.findOneAndUpdate({ _id: req.payload.id },
//                     {
//                         $push: {
//                             paymentInformation: {
    
//                                 bankName: bankName && bankName,
//                                 bankAddress: bankAddress && bankAddress,
//                                 accountNumber: accountNumber && accountNumber.toString(),
//                                 sortCode: sortCode && sortCode,
//                                 accountName: accountName && accountName,
//                                 taxIdentificationNumber: taxIdentificationNumber && taxIdentificationNumber
    
//                             }
//                         }
//                     },
//                     function (
//                         err,
//                         result
//                     ) {
//                         if (err) {
//                             res.status(401).json({
//                                 status: 401,
//                                 success: false,
//                                 error: err
    
//                             })
    
//                         } else {
    
    
//                             // res.status(200).json({
//                             //     status: 200,
//                             //     success: true,
//                             //     data: "Update Successful"
//                             // })
    
//                         }
//                     })
//             } else {
//                 console.log('2kjds')
    
//                 Employee.findOneAndUpdate({ _id: req.payload.id }, {
//                     $set: {
//                         "paymentInformation.$[i].bankName": bankName && bankName,
//                         "paymentInformation.$[i].bankAddress": bankAddress && bankAddress,
//                         "paymentInformation.$[i].accountNumber": accountNumber && accountNumber.toString(),
//                         "paymentInformation.$[i].sortCode": sortCode && sortCode,
//                         "paymentInformation.$[i].accountName":accountName && accountName,
//                         "paymentInformation.$[i].taxIdentificationNumber":taxIdentificationNumber && taxIdentificationNumber,
    
//                     }
//                 },
//                     {
//                         arrayFilters: [
//                             {
//                                 "i._id": check.paymentInformation[0]._id
//                             }
//                         ]
//                     },
//                     function (
//                         err,
//                         result
//                     ) {
//                         if (err) {
//                             res.status(401).json({
//                                 status: 401,
//                                 success: false,
//                                 error: err
    
//                             })
    
//                         } else {
    
    
    
    
//                                 res.status(200).json({
//                                     status: 200,
//                                     success: true,
//                                     data: "Update Successful"
//                                 })
    
//                                 return;
//                             }
//                             })

//         }
//     }

//     }
//     catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })
//     }
// }
// export default addPayment;



import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Company from '../../model/Company';
import AuditTrail from '../../model/AuditTrail';

dotenv.config();

/**
 * Add or update employee payment information (bank details)
 * @route POST /api/employee/payment/add
 */
const addPayment = async (req, res) => {
    try {
        const { 
            bankAddress, 
            bankName, 
            accountNumber, 
            sortCode, 
            taxIdentificationNumber, 
            accountName 
        } = req.body;
        const userId = req.payload.id;

        // Validate required fields
        if (!bankName || bankName.trim() === '') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Bank name is required'
            });
        }

        if (!accountNumber || accountNumber.toString().trim() === '') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Account number is required'
            });
        }

        if (!accountName || accountName.trim() === '') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Account name is required'
            });
        }

        // Check if user is company or employee
        const company = await Company.findOne({ _id: userId });
        const isCompanyAccount = !!company;

        let targetEmployee;
        let userCompany;

        if (isCompanyAccount) {
            // Company accounts update their own payment info
            // Find or create a Company payment record (if needed)
            // For now, return error as companies typically don't have employee payment info
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Company accounts cannot have employee payment information. Please use a specific employee account.'
            });
        } else {
            // Employee updating their own payment info
            targetEmployee = await Employee.findOne({ _id: userId });

            if (!targetEmployee) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'Employee not found'
                });
            }

            userCompany = await Company.findOne({ _id: targetEmployee.companyId });
        }

        // Prepare payment information object
        const paymentInfo = {
            bankName: bankName.trim(),
            bankAddress: bankAddress?.trim() || '',
            accountNumber: accountNumber.toString().trim(),
            sortCode: sortCode?.trim() || '',
            accountName: accountName.trim(),
            taxIdentificationNumber: taxIdentificationNumber?.trim() || '',
            updatedAt: new Date()
        };

        let updatedEmployee;

        // Check if payment information already exists
        if (!targetEmployee.paymentInformation || targetEmployee.paymentInformation.length === 0) {
            // Create new payment information
            updatedEmployee = await Employee.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        paymentInformation: paymentInfo
                    }
                },
                { new: true }
            );

            console.log(`[AddPayment] Created payment info for ${targetEmployee.fullName || targetEmployee.email}`);
        } else {
            // Update existing payment information (first entry)
            const existingPaymentId = targetEmployee.paymentInformation[0]._id;

            updatedEmployee = await Employee.findOneAndUpdate(
                { _id: userId },
                {
                    $set: {
                        'paymentInformation.$[i].bankName': paymentInfo.bankName,
                        'paymentInformation.$[i].bankAddress': paymentInfo.bankAddress,
                        'paymentInformation.$[i].accountNumber': paymentInfo.accountNumber,
                        'paymentInformation.$[i].sortCode': paymentInfo.sortCode,
                        'paymentInformation.$[i].accountName': paymentInfo.accountName,
                        'paymentInformation.$[i].taxIdentificationNumber': paymentInfo.taxIdentificationNumber,
                        'paymentInformation.$[i].updatedAt': paymentInfo.updatedAt
                    }
                },
                {
                    arrayFilters: [{ 'i._id': existingPaymentId }],
                    new: true
                }
            );

            console.log(`[AddPayment] Updated payment info for ${targetEmployee.fullName || targetEmployee.email}`);
        }

        // Create audit trail entry
        if (userCompany) {
            try {
                await AuditTrail.findOneAndUpdate(
                    { companyId: userCompany._id },
                    {
                        $push: {
                            humanResources: {
                                userName: targetEmployee.fullName || `${targetEmployee.firstName} ${targetEmployee.lastName}`,
                                email: targetEmployee.email,
                                action: `Employee updated their bank details (Account: ${accountNumber.toString().slice(-4).padStart(accountNumber.toString().length, '*')})`,
                                dateTime: new Date()
                            }
                        }
                    },
                    { upsert: true }
                );
            } catch (auditError) {
                console.error('Failed to create audit trail:', auditError);
                // Don't fail the request if audit trail fails
            }
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Payment information updated successfully',
            data: {
                bankName: paymentInfo.bankName,
                accountName: paymentInfo.accountName,
                accountNumber: `****${accountNumber.toString().slice(-4)}`, // Masked for security
                sortCode: paymentInfo.sortCode
            }
        });

    } catch (error) {
        console.error('[AddPayment] Error:', {
            error: error.message,
            stack: error.stack,
            userId: req.payload?.id
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Validation error',
                details: error.message
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid ID format',
                details: error.message
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while updating payment information'
        });
    }
};

export default addPayment;