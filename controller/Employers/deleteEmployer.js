
import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Company from '../../model/Company';
import AuditTrail from '../../model/AuditTrail';

dotenv.config();


const deleteEmployee = async (req, res) => {

    try {
        let company = await Company.find({ _id: req.payload.id });

        let employee = await Employee.findOne({ _id: req.params.id });


        if (!employee) {
            res.status(400).json({
                status: 400,
                error: 'Employee not found'
            })
            return;
        }

        Employee.remove({ _id: req.params.id },
            function (
                err,
                result
            ) {

                console.log(result)

                if (err) {
                    res.status(401).json({
                        status: 401,
                        success: false,
                        error: err
                    })
                }
                else {

                    // AuditTrail.findOneAndUpdate({ companyId: company[0]._id},
                    //     {
                    //         $push: {
                    //             humanResources: {

                    //                 userName: `${employee.personalInformation[0].firstName} ${employee.personalInformation[0].lastName}`,
                    //                 email: employee.officialInformation[0].officialEmail,
                    //                 action: `Super admin deleted ${employee.personalInformation[0].firstName} ${employee.personalInformation[0].lastName} as an employee`,
                    //                 dateTime: new Date()
                    //             }
                    //         }
                    //     },
                    //     function (
                    //         err,
                    //         result
                    //     ) {
                    //         if (err) {
                    //             res.status(401).json({
                    //                 status: 401,
                    //                 success: false,
                    //                 error: err

                    //             })

                    //         } else {



                                res.status(200).json({
                                    status: 200,
                                    success: true,
                                    data: "Employee Deleted successfully!"
                                })
                            // }

                    //     })




                }

                
            })


            // const checkUpdated = await Employee.findOne({ _id: req.params.id })

            // console.log(checkUpdated)
            // console.log(checkUpdated.officialInformation[0].officialEmail)
            // AuditTrail.findOneAndUpdate({ companyId: company[0]._id },
            //     {
            //         $push: {
            //             humanResources: {
            //                 userName: `${employee.personalInformation[0].firstName}  ${employee.personalInformation[0].lastName}`,
            //                 email: employee.officialInformation[0].officialEmail,
            //                 action: `Super admin deleted ${checkUpdated.personalInformation[0].firstName} ${checkUpdated.personalInformation[0].lastName} as an employee`,
            //                 dateTime: new Date()
            //             }
            //         }
            //     },
            //     function (
            //         err,
            //         result
            //     ) {
            //         if (err) {
            //             res.status(401).json({
            //                 status: 401,
            //                 success: false,
            //                 error: err

            //             })

            //         } else {


            //             res.status(200).json({
            //                 status: 200,
            //                 success: true,
            //                 data: "Update Successful"
            //             })

            //         }
            //     })

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default deleteEmployee;
