import DocumentType from '../../model/DocumentType';
import Company from '../../model/Company';
import Employee from '../../model/Employees';

/**
 * Update an existing document type
 * @route PUT /api/document-type/update/:id
 */
const updateDocumentType = async (req, res) => {
    try {
        const { documentType, description } = req.body;
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
        const existingDocType = await DocumentType.findOne({ _id: documentTypeId });

        if (!existingDocType) {
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
            isAuthorized = existingDocType.companyId === company._id.toString();
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
            if (existingDocType.companyId !== employee.companyId) {
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
                employee.permissions?.documentManagement?.edit_document_types === true;
        }

        if (!isAuthorized) {
            return res.status(403).json({
                status: 403,
                success: false,
                error: 'You do not have permission to update document types'
            });
        }

        // Check for duplicate name (if changing name)
        if (documentType && documentType.trim() !== '' && documentType !== existingDocType.documentType) {
            const duplicateDocType = await DocumentType.findOne({
                companyId: existingDocType.companyId,
                documentType: documentType.trim(),
                _id: { $ne: documentTypeId }
            });

            if (duplicateDocType) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    error: 'A document type with this name already exists'
                });
            }
        }

        // Build update object
        const updateFields = {};
        
        if (documentType && documentType.trim() !== '') {
            updateFields.documentType = documentType.trim();
        }
        
        if (description !== undefined) {
            updateFields.description = description.trim();
        }

        // Update document type
        const updatedDocType = await DocumentType.findByIdAndUpdate(
            documentTypeId,
            { $set: updateFields },
            { new: true }
        );

        console.log(`[UpdateDocumentType] Document type "${updatedDocType.documentType}" updated`);

        return res.status(200).json({
            status: 200,
            success: true,
            data: updatedDocType,
            message: 'Document type updated successfully'
        });

    } catch (error) {
        console.error('[UpdateDocumentType] Error:', {
            error: error.message,
            stack: error.stack,
            documentTypeId: req.params?.id,
            userId: req.payload?.id
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Validation error',
                details: error.message
            });
        }

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
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while updating document type'
        });
    }
};

export default updateDocumentType;