
import dotenv from 'dotenv';
import AppraisalGroup from '../../model/AppraisalGroup';




dotenv.config();







const fetchGroupsByDepartment = async (req, res) => {

    try {

        const { page, limit } = req.query;


        const appraisalGroups = await AppraisalGroup.find({
            'assignedDepartments.department_id': req.params.department,
          });


      

        res.status(200).json({
            status: 200,
            success: true,
            data: appraisalGroups
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default fetchGroupsByDepartment;



