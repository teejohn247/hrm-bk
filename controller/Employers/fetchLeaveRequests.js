import dotenv from 'dotenv';
import ExpenseRequests from '../../model/ExpenseRequests';

dotenv.config();

/**
 * Fetch expense requests for a specific employee (with filters and pagination)
 * Returns employee's own expense requests with various filter options
 */
const fetchExpenseReqs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            startDate,
            endDate,
            expenseTypeId,
            minAmount,
            maxAmount
        } = req.query;

        const employeeId = req.payload.id;

        // Parse and validate pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Build filter query - start with employee filter
        const filterQuery = { employeeId };

        // Add status filter
        if (status) {
            filterQuery.status = status;
        }

        // Add expense type filter
        if (expenseTypeId) {
            filterQuery.expenseTypeId = expenseTypeId;
        }

        // Add date range filter
        if (startDate || endDate) {
            filterQuery.expenseDate = {};
            if (startDate) {
                filterQuery.expenseDate.$gte = new Date(startDate);
            }
            if (endDate) {
                filterQuery.expenseDate.$lte = new Date(endDate);
            }
        }

        // Add amount range filter
        if (minAmount || maxAmount) {
            filterQuery.amount = {};
            if (minAmount) {
                filterQuery.amount.$gte = parseFloat(minAmount);
            }
            if (maxAmount) {
                filterQuery.amount.$lte = parseFloat(maxAmount);
            }
        }

        // Execute query and count in parallel
        const [expenseRequests, totalCount] = await Promise.all([
            ExpenseRequests.find(filterQuery)
                .sort({ dateRequested: -1 })
                .limit(limitNum)
                .skip(skip)
                .populate('expenseTypeId', 'name description')
                .populate('approver', 'firstName lastName email')
                .lean()
                .exec(),
            ExpenseRequests.countDocuments(filterQuery)
        ]);

        const totalPages = Math.ceil(totalCount / limitNum);

        // Calculate summary statistics
        const summary = {
            totalAmount: expenseRequests.reduce((sum, req) => sum + (req.amount || 0), 0),
            approvedAmount: expenseRequests
                .filter(req => req.status === 'Approved')
                .reduce((sum, req) => sum + (req.amount || 0), 0),
            pendingAmount: expenseRequests
                .filter(req => req.status === 'Pending')
                .reduce((sum, req) => sum + (req.amount || 0), 0)
        };

        return res.status(200).json({
            status: 200,
            success: true,
            data: expenseRequests,
            summary,
            totalPages: totalPages,
            currentPage: pageNum,
            limit: limitNum,
        });

    } catch (error) {
        console.error('Error fetching expense requests:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Failed to fetch expense requests',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default fetchExpenseReqs;