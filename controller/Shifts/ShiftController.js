import Shift from '../../model/Shift';
import Employee from '../../model/Employees';
import Company from '../../model/Company';

// Create a new shift
export const createShift = async (req, res) => {

    let company = await Company.findOne({ _id: req.payload.id });
    try {
        const shift = new Shift({
            ...req.body,
            companyName: company.companyName,
            companyId: company._id
        });
        await shift.save();
        res.status(200).json({ status: 200, success: true, data: shift });
    } catch (error) {
        res.status(400).json({ status: 400, success: false, message: error.message });
    }
};

// Get all shifts
export const getAllShifts = async (req, res) => {
    try {
        const { startTime, endTime, page = 1, limit = 10 } = req.query; // Extract startTime and endTime from query parameters
        const filter = {};

        // Determine if req.payload.id is an employeeId or companyId
        const companyId = req.payload.id; // Assuming req.payload.id is the companyId or employeeId

        // Add companyId filter
        filter.companyId = companyId;

        // Add filters for startTime and endTime if provided
        if (startTime) {
            filter.startTime = { $gte: new Date(startTime) }; // Greater than or equal to startTime
        }
        if (endTime) {
            filter.endTime = { $lte: new Date(endTime) }; // Less than or equal to endTime
        }

        const shifts = await Shift.find(filter).limit(limit * 1)
        .skip((page - 1) * limit)
        .exec(); // Apply the filter in the query
        const count = await Shift.find(filter).countDocuments()
        
        res.status(200).json({ status: 200, success: true, data: shifts, totalPages: Math.ceil(count / limit),
            currentPage: page });
    } catch (error) {
        res.status(400).json({ status: 400, success: false,  message: error.message });
    }
};

// Get a single shift by ID
export const getShiftById = async (req, res) => {
    try {
        const shift = await Shift.findById(req.params.id);
        if (!shift) {
            return res.status(404).json({ status: 'error', message: 'Shift not found' });
        }
        res.status(200).json({ status: 200, success: true, data: shift });
    } catch (error) {
        res.status(400).json({ status: 400, success: false,message: error.message });
    }
};

// Update a shift by ID
export const updateShift = async (req, res) => {
    try {
        const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!shift) {
            return res.status(404).json({ status: 'error', message: 'Shift not found' });
        }
        res.status(200).json({ status: 200, success: true, data: shift });
    } catch (error) {
        res.status(400).json({ status: 400, success: false, message: error.message });
    }
};

// Delete a shift by ID
export const deleteShift = async (req, res) => {
    try {
        const shift = await Shift.findByIdAndDelete(req.params.id);
        if (!shift) {
            return res.status(404).json({ status: 404, success: false, message: 'Shift not found' });
        }
        res.status(200).json({ status: 200, success: true, message: 'Shift deleted' });
    } catch (error) {
        res.status(400).json({ status: 400, success: false, message: error.message });
    }
};

// Get shifts by employee ID
export const getShiftsByEmployeeId = async (req, res) => {
    try {
        const shifts = await Shift.find({ 'assignedEmployees.employeeId': req.params.employeeId });
        if (shifts.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No shifts found for this employee' });
        }
        res.status(200).json({ status: 200, success: true, data: shifts });
    } catch (error) {
        res.status(400).json({ status: 400, success: false, message: error.message });
    }
};

// Assign multiple employees to a shift
export const assignEmployeesToShift = async (req, res) => {
    try {
        const { employeeIds } = req.body; // Expecting an array of employee IDs in the request body
        const shift = await Shift.findById(req.params.id);

        if (!shift) {
            return res.status(404).json({ status: 'error', message: 'Shift not found' });
        }

        // Fetch employee details for the provided employeeIds
        const employees = await Employee.find({ _id: { $in: employeeIds } });

        // Add employees to the assignedEmployees array
        employeeIds.forEach(employeeId => {
            const employee = employees.find(emp => emp._id.toString() === employeeId);
            if (employee && !shift.assignedEmployees.some(emp => emp.employeeId === employeeId)) {
                shift.assignedEmployees.push({ employeeId, fullName: employee.fullName, profilePic: employee.profilePic });
            }
        });

        await shift.save();
        res.status(200).json({status: 200, success: true, data: shift });
    } catch (error) {
        res.status(400).json({ status: 400, success: false, message: error.message });
    }
};

// Check in or check out an employee
export const checkInOutEmployee = async (req, res) => {
    try {
        const { employeeId } = req.body; // Expecting employeeId in the request body
        const shift = await Shift.findById(req.params.id); // Get the shift by ID

        if (!shift) {
            return res.status(404).json({ status: 'error', message: 'Shift not found' });
        }

        const assignedEmployee = shift.assignedEmployees.find(emp => emp.employeeId === employeeId);
        if (!assignedEmployee) {
            return res.status(403).json({ status: 400, success: false,message: 'Employee not assigned to this shift' });
        }

        const currentTime = new Date();
        if (!assignedEmployee.checkInTime) {
            // Check-in logic
            assignedEmployee.checkInTime = currentTime;
            assignedEmployee.status = 'inProgress'; // Set status to inProgress
        } else if (!assignedEmployee.checkOutTime) {
            // Check-out logic
            if (currentTime < shift.endTime) {
                return res.status(400).json({ status: 'error', message: 'Cannot check out before shift end time' });
            }
            assignedEmployee.checkOutTime = currentTime;
            assignedEmployee.status = 'fulfilled'; // Set status to fulfilled
        } else {
            return res.status(400).json({ status: 400, success: false, message: 'Employee has already checked out' });
        }

        await shift.save(); // Save the updated shift
        res.status(200).json({ status: 200, success: true, data: shift });
    } catch (error) {
        res.status(400).json({ status: 400, success: false, message: error.message });
    }
}; 