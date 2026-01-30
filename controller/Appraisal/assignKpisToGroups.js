
import dotenv from 'dotenv';
import Kpi from '../../model/Kpi';
import AppraisalGroup from '../../model/AppraisalGroup';



dotenv.config();


const assignKpis = async (req, res) => {

    try {

        const { groups, kpiId } = req.body;
        const kpi = await Kpi.findOne({_id: kpiId})
        const appraisal = await AppraisalGroup.findOne({_id: groups})

        if(!groups){
            res.status(404).json({
                status:404,
                success: false,
                error:'GroupId is required'
            })
            return
        }


        if(!kpiId){
            res.status(404).json({
                status:404,
                success: false,
                error:'kpiId Not Found'
            })
            return
        }

        if(!kpi){
            res.status(404).json({
                status:404,
                success: false,
                error:'Kpi does not exist'
            })
            return
        }

        if(!appraisal){
            res.status(404).json({
                status:404,
                success: false,
                error:'Appraisal does not exist'
            })
            return
        }


        // let checks_notification = await Employee.find({ _id:  { $in: employees }},
        //     { leaveAssignment: { $elemMatch: { leaveTypeId:  { $in: ids } }}})

        //     console.log(checks_notification)

            const dd = []

        //     checks_notification.map((chk) => {
        //         if(chk.leaveAssignment.length > 0){
        //             dd.push(chk.leaveAssignment)
        //         }
        //     })

        // let checks_expense = await Employee.find({ _id:  { $in: employees }},
        //     { leaveAssignment: { $elemMatch: { expenseTypeId:  { $in: ids2 } }}})

        //     console.log(checks_expense)

        //     const dd2 = []

        //     checks_notification.map((chk) => {
        //         if(chk.leaveAssignment.length > 0){
        //             dd.push(chk.leaveAssignment)
        //         }
        //     })

        //     if (dd2.length > 0) {
        //         res.status(400).json({
        //             status: 400,
        //             error: 'The expense type  has already been assigned to one of the employees'
        //         })
        //         return
        //     }

         let checks_group = await AppraisalGroup.find({ _id:  { $in: groups }},
            {groupKpis: { $elemMatch: { kpiId: kpiId } } })

                    checks_group.map((chk) => {
                        if(chk.groupKpis.length > 0){
                            dd.push(chk.groupKpis)
                        }
                    })


            if(dd.length > 0){
                res.status(404).json({
                    status:404,
                    success: false,
                    error:'kpi has already been assigned to group'
                })
                return
            }

        AppraisalGroup.updateMany({ _id: { $in : groups }}, { 
            $push: { groupKpis: {
                kpiId: kpiId,
                kpiName: kpi.kpiName,
                kpiDescription: kpi.kpiDescription,
                // "remarks.employeeComment": "",
                // "remarks.managerName": "",
                // "remarks.employeeName": "",
                // "remarks.managerComment": "",
                // "remarks.managerOverallComment": "",
                // "remarks.managerRating": "",
                // "remarks.employeeRating": "",
            }},
       },{ upsert: true },
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

                    // const manager = await AppraisalGroup.findOne({_id: groupId});

                    res.status(200).json({
                        status: 200,
                        success: true,
                        data: "Successfully assigned"
                    })

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
export default assignKpis;



