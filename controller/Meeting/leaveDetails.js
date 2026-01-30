
import dotenv from 'dotenv';
import LeaveRecords from '../../model/LeaveRecords';
import Employees from '../../model/Employees';




import { emailTemp } from '../../emailTemplate';


const sgMail = require('@sendgrid/mail')

dotenv.config();




sgMail.setApiKey(process.env.SENDGRID_KEY);



const leaveDetails= async (req, res) => {
    try {
     // Aggregate to group employees by daysUsed range
const results = await Employees.aggregate([
  
    {
      $unwind: "$leaveAssignment", // Unwind the leaveAssignment array
    },
    {
      $match: {
        "leaveAssignment.leaveApproved": true, // Match only leaveApproved items
      },
    },
    {
      $facet: {
        "0-7 days": [
          {
            $match: {
              "leaveAssignment.daysUsed": { $lte: 7 }, // Range for 0-7 days
            },
          },
          {
            $group: {
              _id: null,
              employees: {
                $push: {
                  fullName: "$fullName",
                  firstName: "$firstName",
                  lastName: "$lastName",
                  profilePic: "$profilePic",
                  department: "$department",
                  designation: "$designationName",
                  dateOfBirth: "$dateOfBirth",
                  personalEmail: "$personalEmail",
                  maritalStatus: "$maritalStatus",
                  phoneNumber: "$phoneNumber",
                  address: "$address",
                  gender: "$gender",
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              group: "0-7 days",
              employees: 1,
            },
          },
        ],
        "8-14 days": [
          {
            $match: {
              "leaveAssignment.daysUsed": { $gt: 7, $lte: 14 }, // Range for 8-14 days
            },
          },
          {
            $group: {
              _id: null,
              employees: {
                $push: {
                  fullName: "$fullName",
                  firstName: "$firstName",
                  lastName: "$lastName",
                  profilePic: "$profilePic",
                  department: "$department",
                  designation: "$designationName",
                  dateOfBirth: "$dateOfBirth",
                  personalEmail: "$personalEmail",
                  maritalStatus: "$maritalStatus",
                  phoneNumber: "$phoneNumber",
                  address: "$address",
                  gender: "$gender",
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              group: "8-14 days",
              employees: 1,
            },
          },
        ],
        "15-21 days": [
          {
            $match: {
              "leaveAssignment.daysUsed": { $gt: 14, $lte: 21 }, // Range for 15-21 days
            },
          },
          {
            
            $group: {
              _id: null,
              employees: {
                $push: {
                  fullName: "$fullName",
                  firstName: "$firstName",
                  lastName: "$lastName",
                  profilePic: "$profilePic",
                  department: "$department",
                  designation: "$designationName",
                  dateOfBirth: "$dateOfBirth",
                  personalEmail: "$personalEmail",
                  maritalStatus: "$maritalStatus",
                  phoneNumber: "$phoneNumber",
                  address: "$address",
                  gender: "$gender",
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              group: "15-21 days",
              employees: 1,
            },
          },
        ],
        "21+ days": [ // Additional groups (if any)
          {
            $match: {
              "leaveAssignment.daysUsed": { $gt: 21 }, // Define your ranges for other groups
            },
          },
          {
            $group: {
              _id: null,
              employees: {
                $push: {
                  fullName: "$fullName",
                  firstName: "$firstName",
                  lastName: "$lastName",
                  profilePic: "$profilePic",
                  department: "$department",
                  designation: "$designationName",
                  dateOfBirth: "$dateOfBirth",
                  personalEmail: "$personalEmail",
                  maritalStatus: "$maritalStatus",
                  phoneNumber: "$phoneNumber",
                  address: "$address",
                  gender: "$gender",
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              group: "otherGroups",
              employees: 1,
            },
          },
        ],
      },
    },
 
    {
      $project: {
        results: {
          $concatArrays: [
            [
              {
                group: "0-7 days",
                employeeDetails: {
                  $cond: {
                    if: { $isArray: "$0-7 days" },
                    then: "$0-7 days",
                    else: [],
                  },
                },
              },
              {
                group: "8-14 days",
                employeeDetails: {
                  $cond: {
                    if: { $isArray: "$8-14 days" },
                    then: "$8-14 days",
                    else: [],
                  },
                },
              },
              {
                group: "15-21 days",
                employeeDetails: {
                  $cond: {
                    if: { $isArray: "$15-21 days" },
                    then: "$15-21 days",
                    else: [],
                  },
                },
              },
              {
                group: "21+ days",
                employeeDetails: {
                  $cond: {
                    if: { $isArray: "$21+ days" },
                    then: "$21+ days",
                    else: [],
                  },
                },
              },
              // Add other groups in a similar fashion...
            ],
          ],
        },
      },
    },
    {
      $unwind: "$results",
    },
    {
      $replaceRoot: {
        newRoot: "$results",
      },
    },
    {
      $addFields: {
        "employeeDetails.employees": {
          $reduce: {
            input: "$employeeDetails",
            initialValue: [],
            in: { $concatArrays: ["$$this.employees", "$$value"] },
          },
        },
      },
    },
    {
      $project: {
        group: 1,
        employees: {
          $cond: {
            if: { $isArray: "$employeeDetails.employees" },
            then: { $arrayElemAt: ["$employeeDetails.employees", 0] },
            else: "$$REMOVE",
          },
        },
      },
    },


  ]);
  
  
  console.log(results);
  
      

        res.status(200).json({
            status: 200,
            success: true,
            data: results,
            // totalPages: Math.ceil(counts / limit),
            // currentPage: page
        })

        return;

    } catch (error) {
        res.status(500).json({
            status: 500,
            success: false,
            error: error
        })
    }
}
export default leaveDetails;



