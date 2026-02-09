import DocumentType from '../../model/DocumentType';
import Company from '../../model/Company';
import Employee from '../../model/Employees';

/**
 * Delete a document type
 * @route DELETE /api/document-type/delete/:id
 */
const deleteDocumentType = async (req, res) => {
    try {
        const documentTypeId = req.params.id;
        const userId = req.payload.id;

        // Validate document type ID
        if (!documentTypeId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Document type ID is required'
            });
        }

        // Get existing document type
        const documentType = await DocumentType.findOne({ _id: documentTypeId });

        if (!documentType) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Document type not found'
            });
        }

        // Check authorization
        const company = await Company.findOne({ _id: userId });
        const isCompanyAccount = !!company;

        let isAuthorized = false;

        if (isCompanyAccount) {
            // Company admin is authorized if document type belongs to their company
            isAuthorized = documentType.companyId === company._id.toString();
        } else {
            const employee = await Employee.findOne({ _id: userId });

            if (!employee) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    error: 'User not found'
                });
            }

            // Check if document type belongs to employee's company
            if (documentType.companyId !== employee.companyId) {
                return res.status(403).json({
                    status: 403,
                    success: false,
                    error: 'Document type does not belong to your company'
                });
            }

            // Check employee permissions
            isAuthorized = 
                employee.isSuperAdmin === true || 
                employee.role === 'Admin' || 
                employee.roleName === 'Admin' ||
                employee.permissions?.documentManagement?.delete_document_types === true;
        }

        if (!isAuthorized) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You do not have permission to delete document types'
            });
        }

        // Delete the document type
        await DocumentType.deleteOne({ _id: documentTypeId });

        console.log(`[DeleteDocumentType] Document type "${documentType.documentType}" deleted`);

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Document type deleted successfully',
            data: {
                deletedDocumentTypeId: documentTypeId,
                documentTypeName: documentType.documentType
            }
        });

    } catch (error) {
        console.error('[DeleteDocumentType] Error:', {
            error: error.message,
            stack: error.stack,
            documentTypeId: req.params?.id,
            userId: req.payload?.id
        });

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid document type ID format',
                details: error.message
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while deleting document type'
        });
    }
};

export default deleteDocumentType;