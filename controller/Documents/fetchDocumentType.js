import DocumentType from '../../model/DocumentType';
import Company from '../../model/Company';
import Employee from '../../model/Employees';

/**
 * Fetch document types with pagination
 * @route GET /api/document-type/fetch
 */
const fetchDocumentType = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const userId = req.payload.id;

        // Check if user is company or employee
        const company = await Company.findOne({ _id: userId });
        const isCompanyAccount = !!company;

        let companyId;

        if (isCompanyAccount) {
            // User is company account
            companyId = company._id.toString();
            console.log(`[FetchDocumentType] Company account: ${company.companyName}`);
        } else {
            // User is employee - get their company
            const employee = await Employee.findOne({ _id: userId });

            if (!employee) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'User not found'
                });
            }

            companyId = employee.companyId;
            console.log(`[FetchDocumentType] Employee account: ${employee.fullName || employee.email}`);
        }

        // Fetch document types for the company
        const documentTypes = await DocumentType.find({ companyId })
            .sort({ _id: -1 })
            .limit(limit)
            .skip(skip)
            .exec();

        // Get total count for pagination
        const totalCount = await DocumentType.countDocuments({ companyId });

        console.log(`[FetchDocumentType] Found ${documentTypes.length} document types for company ${companyId}`);

        return res.status(200).json({
            status: 200,
            success: true,
            data: documentTypes,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: limit,
              
        });

    } catch (error) {
        console.error('[FetchDocumentType] Error:', {
            error: error.message,
            stack: error.stack,
            userId: req.payload?.id
        });

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid ID format',
                details: error.message
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while fetching document types'
        });
    }
};

export default fetchDocumentType;