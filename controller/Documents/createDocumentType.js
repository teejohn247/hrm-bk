import DocumentType from '../../model/DocumentType';
import Company from '../../model/Company';

const createDocumentType = async (req, res) => {
    try {
        const { documentType, description } = req.body;
        const companyId = req.payload.id;
        const company = await Company.findOne({ _id: companyId });
        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'Company not found'
            });
        }
        const newDocumentType = await DocumentType.create({
            documentType,
            description,
            companyId: company._id,
            companyName: company.companyName
        });
        return res.status(200).json({
            status: 200,
            success: true,
            data: newDocumentType,
            message: 'Document type created successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: error.message
        });
    }
}

export default createDocumentType;