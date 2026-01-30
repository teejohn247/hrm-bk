
import dotenv from 'dotenv';
import Kpi from '../../model/Kpi';
import AppraisalGroup from '../../model/AppraisalGroup';
import Employee from '../../model/Employees';


dotenv.config();


const assignGroupsEmployees = async (req, res) => {

    try {

        const { employees, appraisalId } = req.body;
        const appraisal = await AppraisalGroup.findOne({_id: appraisalId})

        console.log({appraisal})

        if(employees.length < 1){
            res.status(404).json({
                status:404,
                success: false,
                error:'employeesId is required'
            })
            return
        }


        if(!appraisalId){
            res.status(404).json({
                status:404,
                success: false,
                error:'appraisalId Not Found'
            })
            return
        }

        if(!appraisalId){
            res.status(404).json({
                status:404,
                success: false,
                error:'appraisal does not exist'
            })
            return
        }

        if(!appraisal){
            res.status(404).json({
                status:404,
                success: false,
                error:'appraisal does not exist'
            })
            return
        }


            const dd = []

            console.log('here')

         let checks_group = await Employee.find({ _id:  { $in: employees }},
            {assignedAppraisals: { $elemMatch: { appraisalId: appraisalId } } })

                    checks_group.map((chk) => {
                        if(chk.assignedAppraisals.length > 0){
                            dd.push(chk.assignedAppraisals)
                        }
                    })

                    console.log({dd})


            if(dd.length > 0){
                res.status(404).json({
                    status:404,
                    success: false,
                    error:'Appraisal has already been assigned to employee'
                })
                return
            }


            let groups = [];
    
            for (const groupId of employees) {
                console.log({ groupId });
        
                try {
                    const group = await Employee.findOne({ _id: groupId });

                    console.log({group})
                    
                    groups.push({
                        employee_id: groupId,
                        employee_name: group.employeeName,
                    });
                    console.log({ group });
                } catch (err) {
                    console.error(err);
                }
            }

        AppraisalGroup.findOneAndUpdate({ _id: appraisalId}, { 
            $push: { assignedEmployees: groups
            },
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

                    Employee.findOneAndUpdate({ _id:  { $in: employees }}, { 
                        $push: { assignedAppraisals: {
                            appraisalId,
                            appraisalName: appraisal.groupName,
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
export default assignGroupsEmployees;