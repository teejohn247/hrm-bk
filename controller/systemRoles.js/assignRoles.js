
import dotenv from 'dotenv';
import Roles from '../../model/Roles';
import Admin from '../../model/Employees';

import mongoose from 'mongoose'

dotenv.config();


const assignRole = async (req, res) => {

    try {


        const { roleId, adminIds } = req.body;

        const role = await Roles.findOne({ companyId: req.payload.id,  _id: roleId });
        console.log({role})
        const admin = await Admin.findOne({companyId: req.payload.id,  _id: { $in : adminIds }})

        console.log({admin})

        if (!role) {
            res.status(404).json({
                status: 404,
                error: 'This role does not exist'
            })
            return
        }

        if (!admin) {
            res.status(404).json({ 
                status: 404,
                error: 'This admin does not exist'
            })
            return
        }

        // check if this form has already been assigned to admin

        let check_role = await Roles.find(
            {
                companyId: req.payload.id,
                _id: roleId,
                assignedTo: { $elemMatch: { admin_id: { $in: adminIds.map(id => mongoose.Types.ObjectId(id)) } } }
            }
        );

            console.log({check_role})

            let check_admin = await Admin.find(
                {
                    _id: { $in: adminIds.map(id => mongoose.Types.ObjectId(id)) },
                    roles: { $elemMatch: { role_id: mongoose.Types.ObjectId(roleId) } }
                }
            );


             
                // if (role.enabled != true) {
                //     res.status(400).json({
                //         status: 400,
                //         error: 'Role has been disabled. Enable role before assigning to admin'
                //     })
                //     return
                // }

        if (check_role[0].assigned_to && check_role[0].assigned_to.length > 0) {
            res.status(400).json({
                status: 400,
                error: 'This role has already been assigned to admin'
            })
            return
        }

        if (check_admin[0] && check_admin[0].roles.length > 0) {

            res.status(400).json({
                status: 400,
                error: 'Role already exist'
            })
            return
        }

       console.log('herer');
       
        Admin.findOneAndUpdate({ _id: { $in : adminIds }},  {  $set: { "roles.employeeManagement.roleId": roleId, "roles.employeeManagement.roleName": role.roleName, "roles.employeeManagement.dateAssigned": new Date()} } ,
        { upsert: true, new: true },
        async function (
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
                for (const adminId of adminIds) {
                    console.log({ adminId });
                
                    try {
                        const adminDetails = await Admin.findOne({ _id: adminId });
                
                        await Roles.findOneAndUpdate(
                            { _id: roleId },
                            {
                                $push: {
                                    assigned_to: {
                                        adminId: adminId,
                                        adminName: `${adminDetails.firstName} ${adminDetails.lastName}`,
                                        date_assigned: new Date()
                                    }
                                }
                            },
                            { upsert: true, new: true }
                        );
                
                        res.status(200).json({
                            status: 200,
                            success: true,
                            data: "Admin Role assigned"
                        });
                    } catch (err) {
                        res.status(401).json({
                            status: 401,
                            success: false,
                            error: err.message // or use a custom error message if needed
                        });
                        return; // Ensure to stop the execution here if there's an error
                    }
                }
       

            }
        })
    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default assignRole;
