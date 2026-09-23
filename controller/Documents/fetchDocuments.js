
import dotenv from 'dotenv';
import DocumentType from '../../model/DocumentType.js'; // Adjust path as needed
import Document from '../../model/Document.js'; // Adjust path as needed
import Employee from '../../model/Employees.js'; // Adjust path as needed
import Company from '../../model/Company.js'; // Adjust path as needed
dotenv.config();


/**
 * Controller for fetching all documents for a specific employee
 * @route GET /api/documents/employee/:employeeId
 */
const getEmployeeDocuments = async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        if (!employeeId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Employee ID is required'
            });
        }
        
        // Fetch all documents for the employee
        const documents = await Document.find({ employeeId }).sort({ createdAt: -1 });
        
        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Documents retrieved successfully',
            data: documents,
            count: documents.length
        });
        
    } catch (error) {
        console.error('Error fetching employee documents:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An error occurred while fetching documents'
        });
    }
};

export default getEmployeeDocuments;