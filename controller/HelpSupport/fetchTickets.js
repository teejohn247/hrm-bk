import dotenv from 'dotenv';
import HelpSupport from '../../model/HelpSupport';
import Employee from '../../model/Employees';

dotenv.config();

const fetchTickets = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status;
        const category = req.query.category;

        // Get user details to check if admin or employee
        const user = await Employee.findOne({ _id: req.payload.id });
        const companyId = req.payload.companyId || req.payload.id;

        let query = {};

        // If user is an employee (not admin), show only their tickets
        if (user && !user.isSuperAdmin) {
            query['submittedBy.userId'] = req.payload.id;
        } else {
            // Admin can see all tickets for their company
            query.companyId = companyId;
        }

        // Filter by status if provided
        if (status) {
            query.status = status;
        }

        // Filter by category if provided
        if (category) {
            query.category = category;
        }

        const tickets = await HelpSupport.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalCount = await HelpSupport.countDocuments(query);

        res.status(200).json({
            status: 200,
            success: true,
            data: tickets,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: limit
            }
        });

    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({
            status: 500,
            success: false,
            error: error.message || error
        });
    }
};

export default fetchTickets;
