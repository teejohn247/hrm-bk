import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import Department from '../../model/Department';
import Designation from '../../model/Designation';



dotenv.config();

const secretKey = process.env.ENCODING_SECRET_KEY || 'your-secret-key';

const encode = (text) => {
    const buffer = Buffer.from(text.toString());
    const keyBuffer = Buffer.from(secretKey);
    const result = Buffer.alloc(buffer.length);

    for (let i = 0; i < buffer.length; i++) {
        result[i] = buffer[i] ^ keyBuffer[i % keyBuffer.length];
    }

    return result.toString('base64');
};

const fetchSpecificEmployees = async (req, res) => {

    try {


        const employee = await Employee.find({_id: req.params.id})


        if(!employee){
            res.status(404).json({
                status:404,
                success: false,
                error:'No employee Found'
            })
            return
        }else{



            if (employee[0].designation) {
                employee[0].designationName = employee[0].designation;
            }
            if (employee[0].department) {
                employee[0].departmentName = employee[0].department;
            }

            if (!employee[0].designationId && employee[0].designationName) {
                const designation = await Designation.findOne({name: employee[0].designationName});
                employee[0].designationId = designation ? designation._id : null;
            }
            if (!employee[0].departmentId && employee[0].departmentName) {
                const department = await Department.findOne({departmentName: employee[0].departmentName});
                employee[0].departmentId = department ? department._id : null;
            }

            await Employee.updateOne({_id: employee[0]._id}, {
                designationId: employee[0].designationId,
                departmentId: employee[0].departmentId,
                departmentName: employee[0].department,
                designationName: employee[0].designation
            });

            const encodedEmployee = employee[0].paymentInformation && employee[0].paymentInformation.length > 0
                ? {
                    ...employee[0].toObject(),
                    paymentInformation: employee[0].paymentInformation.map(info => {
                        const encodedInfo = {};
                        for (const [key, value] of Object.entries(info.toObject())) {
                            // Skip encoding the _id field
                            encodedInfo[key] = key !== '_id' ? encode(value) : value;
                        }
                        return encodedInfo;
                    })
                }
                : await Employee.findById(employee[0]._id);

            res.status(200).json({
                status: 200,
                success: true,
                data: encodedEmployee,
            })
        }

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default fetchSpecificEmployees;



