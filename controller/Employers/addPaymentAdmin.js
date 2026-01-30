
import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Roles from '../../model/Roles';
import AuditTrail from '../../model/AuditTrail';

import Company from '../../model/Company';

import utils from '../../config/utils';

import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const addPaymentAdmin = async (req, res) => {

    try {
        console.log(req.payload.id)

        const { bankAddress, bankName, accountNumber, sortCode, taxIdentificationNumber, accountName } = req.body;
        let company = await Company.findOne({ _id: req.payload.id });
        let check = await Employee.findOne({ _id: req.params.id });

            console.log({ company })
            console.log(req.body, 'test')
    
    
            if (!check) {
                res.status(400).json({
                    status: 400,
                    error: "Employee doesn't exist"
                })
                return;
            }

            // if (!company) {
            //     res.status(400).json({
            //         status: 400,
            //         error: "Company doesn't exist"
            //     })
            //     return;
            // }
    
            if (check.paymentInformation && check.paymentInformation.length < 1) {
                console.log('kjds')
                Employee.findOneAndUpdate({ _id: req.params.id },
                    {
                        $push: {
                            paymentInformation: {
    
                                bankName: bankName && bankName,
                                bankAddress: bankAddress && bankAddress,
                                accountNumber: accountNumber && accountNumber.toString(),
                                sortCode: sortCode && sortCode,
                                accountName: accountName && accountName,
                                taxIdentificationNumber: taxIdentificationNumber && taxIdentificationNumber
    
                            }
                        }
                    },
                    function (
                        err,
                        result
                    ) {
                        if (err) {
                            res.status(401).json({
                                status: 401,
                                success: false,
                                error: err
    
                            })
    
                        } else {
    
    
                            res.status(200).json({
                                status: 200,
                                success: true,
                                data: "Update Successful"
                            })

                            return
    
                        }
                    })
            } else {
                console.log('2kjds')
    
                Employee.findOneAndUpdate({ _id: req.params.id }, {
                    $set: {
                        "paymentInformation.$[i].bankName": bankName && bankName,
                        "paymentInformation.$[i].bankAddress": bankAddress && bankAddress,
                        "paymentInformation.$[i].accountNumber": accountNumber && accountNumber.toString(),
                        "paymentInformation.$[i].sortCode": sortCode && sortCode,
                        "paymentInformation.$[i].accountName":accountName && accountName,
                        "paymentInformation.$[i].taxIdentificationNumber":taxIdentificationNumber && taxIdentificationNumber,
    
                    }
                },
                    {
                        arrayFilters: [
                            {
                                "i._id": check.paymentInformation[0]._id
                            }
                        ]
                    },
                    function (
                        err,
                        result
                    ) {
                        if (err) {
                            res.status(401).json({
                                status: 401,
                                success: false,
                                error: err
    
                            })
    
                        } else {
    
    
    
    
                                res.status(200).json({
                                    status: 200,
                                    success: true,
                                    data: "Update Successful"
                                })
    
                                return;
                            }
                            })

        }
    }

    catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default addPaymentAdmin;



