import Document from '../../model/Document';
import Company from '../../model/Company';
import Employee from '../../model/Employees';

/**
 * Delete a document
 * @route DELETE /api/documents/delete/:id
 */
const deleteDocument = async (req, res) => {
    try {
        const documentId = req.params.id;
        const userId = req.payload.id;

        // Validate document type ID
        if (!documentId) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Document ID is required'
            });
        }

        // Get existing document type
        const document = await Document.findOne({ _id: documentId });

        if (!document) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Document not found'
            });
        }

        // Check authorization
        const company = await Company.findOne({ _id: userId });
        const isCompanyAccount = !!company;

        let isAuthorized = false;

        // if (isCompanyAccount) {
        //     // Company admin is authorized if document type belongs to their company
        //     isAuthorized = document.companyId === company._id.toString();
        // } else {
        //     const employee = await Employee.findOne({ _id: userId });

        //     if (!employee) {
        //         return res.status(404).json({
        //             status: 404,
        //             success: false,
        //             error: 'User not found'
        //         });
        //     }

        //     // Check if document type belongs to employee's company
        //     if (document.companyId !== employee.companyId) {
        //         return res.status(403).json({
        //             status: 403,
        //             success: false,
        //             error: 'Document does not belong to your company'
        //         });
        //     }

        //     // Check employee permissions
        //     isAuthorized = 
        //         employee.isSuperAdmin === true || 
        //         employee.role === 'Admin' || 
        //         employee.roleName === 'Admin' ||
        //         employee.permissions?.documentManagement?.delete_documents === true;
        // }

        // if (!isAuthorized) {
        //     return res.status(403).json({
        //         status: 403,
        //         success: false,
        //         error: 'You do not have permission to delete documents'
        //     });
        // }

        // Delete the document type
        await Document.deleteOne({ _id: documentId });

        console.log(`[DeleteDocument] Document "${document.documentName}" deleted`);

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Document deleted successfully',
            data: {
                deletedDocumentId: documentId,
                documentName: document.documentName
            }
        });

    } catch (error) {
        console.error('[DeleteDocument] Error:', {
            error: error.message,
            stack: error.stack,
            documentId: req.params?.id,
            userId: req.payload?.id
        });

        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'Invalid document ID format',
                details: error.message
            });
        }

        return res.status(500).json({
            status: 500,
            success: false,
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while deleting document'
        });
    }
};

export default deleteDocument;