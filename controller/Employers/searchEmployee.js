
import dotenv from 'dotenv';
import Employee from '../../model/Employees';
import EmployeeTable from '../../model/EmployeeTable';

import Roles from '../../model/Roles';


import utils from '../../config/utils';

import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const searchEmployee = async (req, res) => {

    try {

        const { name } = req.query;

        const query = {
            $or: [
              { firstName : new RegExp(name, 'i')},
              { lastName : new RegExp(name, 'i') }
            ]
          };

        const employee = await Employee.find(query)
       

        
        const employeeTable = await EmployeeTable.find()


        if(!employee){
            res.status(404).json({
                status:404,
                success: false,
                error:'No employee Found'
            })
            return
        }else{
            res.status(200).json({
                status: 200,
                success: true,
                data: employee,
               
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
export default searchEmployee;