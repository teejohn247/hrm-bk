
// import dotenv from 'dotenv';
// import Employee from '../../model/Employees';
// import Roles from '../../model/Roles';
// import AuditTrail from '../../model/AuditTrail';
// import Company from '../../model/Company';
// import utils from '../../config/utils';
// import { emailTemp } from '../../emailTemplate';

// import Designation from "../../model/Designation";
// import Department from "../../model/Department";

// const sgMail = require('@sendgrid/mail')

// dotenv.config();




// sgMail.setApiKey(process.env.SENDGRID_KEY);



// const updateEmployee = async (req, res) => {

//     try {
   
//         // const { firstName, lastName, dateOfBirth, departmentId , companyRole, designationId, phoneNumber, gender,
//         // employmentType} = req.body;

       
        
//         const { firstName, lastName, personalEmail, personalPhone,maritalStatus, nextOfKinFullName, nextOfKinPhoneNumber, nextOfKinGender, nextOfKinRelationship, nextOfKinAddress,  nationality, country, city, gender, phoneNumber, address, dateOfBirth,
//              paymentInformation} = req.body;


//              console.log({paymentInformation})
        

//         const check = await Employee.findOne({ _id: req.payload.id });
//         console.log({check})

     
//         let company = await Company.find({ _id: check.companyId});
//         console.log({company})

//         console.log('img', req.body.image)

//         if (!check) {
//             res.status(400).json({
//                 status: 400,
//                 error: "Employee doesn't exist"
//             });
//             return;
//         }
//         Employee.findOneAndUpdate({ _id: req.payload.id}, { 
//             $set: { 

//                     firstName: firstName && firstName,
//                     lastName: lastName && lastName,
//                     dateOfBirth: dateOfBirth && dateOfBirth,
//                     gender: gender && gender,  
//                     address: address && address,
//                     personalEmail: personalEmail && personalEmail,
//                     phoneNumber: phoneNumber && phoneNumber,
//                     profilePic: req.body.image && req.body.image,
//                     nationality: nationality && nationality,
//                     maritalStatus: maritalStatus && maritalStatus,
//                     personalPhone: personalPhone && personalPhone,
//                     fullName: firstName && lastName && `${firstName} ${lastName}`,
//                     country: country && country,
//                     city: city && city,
//                     nextOfKinFullName: nextOfKinFullName && nextOfKinFullName,
//                     nextOfKinAddress: nextOfKinAddress && nextOfKinAddress,
//                     nextOfKinGender: nextOfKinGender && nextOfKinGender,
//                     nextOfKinPhoneNumber: nextOfKinPhoneNumber && nextOfKinPhoneNumber,
//                     nextOfKinRelationship: nextOfKinRelationship && nextOfKinRelationship

//             }
//        },
//             async function (
//                 err,
//                 result
//             ) {
//                 if (err) {
//                     res.status(401).json({
//                         status: 401,
//                         success: false,
//                         error: err

//                     })

//                     return;

//                 } else {

//                     await check.updateOne({
//                         paymentInformation: paymentInformation && paymentInformation, 
//                     });
//                     const checkUpdated = Employee.findOne({ _id: req.params.id })
//                     AuditTrail.findOneAndUpdate({ companyId: company[0]._id},
//                         { $push: { humanResources: { 
        
//                             userName: checkUpdated.firstName && checkUpdated.lastName,
//                             email: checkUpdated.email && checkUpdated.email,
//                             action: `Super admin updated ${checkUpdated.firstName} ${checkUpdated.lastName} records`,
//                             dateTime: new Date()

//                          }}
//                        },
//                             async function (
//                                 err,
//                                 result
//                             ) {
//                                 if (err) {
//                                     res.status(401).json({
//                                         status: 401,
//                                         success: false,
//                                         error: err
                
//                                     })
//                                     return;
                
//                                 } else {


//                                     const updated = await Employee.findOne({ _id: req.payload.id})
                
//                                     res.status(200).json({
//                                         status: 200,
//                                         success: true,
//                                         data: updated
//                                     })
//                                     return;
                
//                                 }
//                             })
//                 }
//             })



//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             success: false,
//             error: error
//         })

//         return;

//     }
// }
// export default updateEmployee;


import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import AuditTrail from '../../model/AuditTrail';
import Company from '../../model/Company';

dotenv.config();

const updateEmployee = async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            personalEmail, 
            personalPhone,
            maritalStatus, 
            nextOfKinFullName, 
            nextOfKinPhoneNumber, 
            nextOfKinGender, 
            nextOfKinRelationship, 
            nextOfKinAddress,  
            nationality, 
            country, 
            city, 
            gender, 
            phoneNumber, 
            address, 
            dateOfBirth,
            paymentInformation,
            image
        } = req.body;

        // Use lean() for read query
        const employee = await Employee.findOne({ _id: req.payload.id }).lean();

        if (!employee) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Employee doesn't exist"
            });
        }

        // Build update object dynamically (only include provided fields)
        const updateFields = {};
        
        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;
        if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
        if (gender) updateFields.gender = gender;
        if (address) updateFields.address = address;
        if (personalEmail) updateFields.personalEmail = personalEmail;
        if (phoneNumber) updateFields.phoneNumber = phoneNumber;
        if (image) updateFields.profilePic = image;
        if (nationality) updateFields.nationality = nationality;
        if (maritalStatus) updateFields.maritalStatus = maritalStatus;
        if (personalPhone) updateFields.personalPhone = personalPhone;
        if (country) updateFields.country = country;
        if (city) updateFields.city = city;
        if (nextOfKinFullName) updateFields.nextOfKinFullName = nextOfKinFullName;
        if (nextOfKinAddress) updateFields.nextOfKinAddress = nextOfKinAddress;
        if (nextOfKinGender) updateFields.nextOfKinGender = nextOfKinGender;
        if (nextOfKinPhoneNumber) updateFields.nextOfKinPhoneNumber = nextOfKinPhoneNumber;
        if (nextOfKinRelationship) updateFields.nextOfKinRelationship = nextOfKinRelationship;
        if (paymentInformation) updateFields.paymentInformation = paymentInformation;

        // Update fullName if both first and last name are provided
        if (firstName && lastName) {
            updateFields.fullName = `${firstName} ${lastName}`;
        } else if (firstName && employee.lastName) {
            updateFields.fullName = `${firstName} ${employee.lastName}`;
        } else if (lastName && employee.firstName) {
            updateFields.fullName = `${employee.firstName} ${lastName}`;
        }

        // Update employee
        const updatedEmployee = await Employee.findOneAndUpdate(
            { _id: req.payload.id },
            { $set: updateFields },
            { new: true, lean: true }
        );

        // Get company for audit trail (only if needed, use lean())
        const company = await Company.findOne({ _id: employee.companyId }).lean();

        if (company) {
            // Create audit trail entry
            const auditEntry = {
                userName: `${updatedEmployee.firstName || employee.firstName} ${updatedEmployee.lastName || employee.lastName}`,
                email: updatedEmployee.email || employee.email,
                action: `Super admin updated ${updatedEmployee.firstName || employee.firstName} ${updatedEmployee.lastName || employee.lastName} records`,
                dateTime: new Date()
            };

            // Update audit trail (don't wait for response)
            AuditTrail.findOneAndUpdate(
                { companyId: company._id },
                { $push: { humanResources: auditEntry } }
            ).exec(); // Fire and forget - don't block response
        }

        return res.status(200).json({
            status: 200,
            success: true,
            data: updatedEmployee
        });

    } catch (error) {
        console.error('Update employee error:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message
        });
    }
};

export default updateEmployee;


