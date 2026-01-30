
import dotenv from 'dotenv';
import Kpi from '../../model/Kpi';
import AppraisalGroup from '../../model/AppraisalGroup';
import Designation from '../../model/Designation';


dotenv.config();


const assignGroupsDesignation = async (req, res) => {

    try {

        const { designations, appraisalId } = req.body;
        const appraisal = await AppraisalGroup.findOne({_id: appraisalId})

        console.log({appraisal})

        if(designations.length < 1){
            res.status(404).json({
                status:404,
                success: false,
                error:'designationId is required'
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

         let checks_group = await Designation.find({ _id:  { $in: designations }},
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
                    error:'Appraisal has already been assigned to designation'
                })
                return
            }


            let groups = [];
    
            for (const groupId of designations) {
                console.log({ groupId });
        
                try {
                    const group = await Designation.findOne({ _id: groupId });

                    console.log({group})
                    
                    groups.push({
                        designation_id: groupId,
                        designation_name: group.designationName,
                    });
                    console.log({ group });
                } catch (err) {
                    console.error(err);
                }
            }

        AppraisalGroup.findOneAndUpdate({ _id: appraisalId}, { 
            $push: { assignedDesignations: groups
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

                    Designation.findOneAndUpdate({ _id:  { $in: designations }}, { 
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
export default assignGroupsDesignation;