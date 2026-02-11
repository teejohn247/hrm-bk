import dotenv from 'dotenv';
import DocumentType from '../../model/DocumentType.js'; // Adjust path as needed
import Document from '../../model/Document.js'; // Adjust path as needed
import Employee from '../../model/Employees.js'; // Adjust path as needed
import Company from '../../model/Company.js'; // Adjust path as needed
dotenv.config();

/**
 * Controller for uploading a document for an employee
 * @route POST /api/documents/upload-document
 */
const uploadDocument = async (req, res) => {
    try {
        
        const { image, documentType, documentName, employeeId } = req.body;
        
        // Validate required fields
        if (!image) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Document file data is required'
            });
        }
        
        if (!documentType) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Document type ID is required'
            });
        }
        
        if (!documentName) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Document name is required'
            });
        }

        if (!employeeId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Employee ID is required'
            });
        }
        
        // Fetch the employee details using the employeeId
        const employee = await Employee.findOne({ _id: employeeId });
        
        if (!employee) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Employee not found'
            });
        }

        const company = await Company.findOne({ _id: employee.companyId });
        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company not found'
            });
        }
        
        // Fetch the document type details using the _id
        const docType = await DocumentType.findOne({ _id: documentType });
        
        if (!docType) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Document type not found'
            });
        }
        
        // Create new document with the fetched employee name and documentType name
        const newDocument = new Document({
            documentName,
            documentType: docType.documentType, // Use the actual documentType string
            document: image,
            employeeId: employee._id,
            employeeName: employee.name || employee.fullName, // Adjust based on your Employee schema field
            companyId: company._id,
            companyName: company.companyName
        });
        
        await newDocument.save();
        
        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Document uploaded successfully',
            data: newDocument
        });
        
    } catch (error) {
        console.error('Error uploading document:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An error occurred while uploading the document'
        });
    }
};

export default uploadDocument;