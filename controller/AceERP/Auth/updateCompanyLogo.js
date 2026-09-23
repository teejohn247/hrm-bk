import Company from '../../../model/Company';

/**
 * Update company logo from uploaded image.
 * Expects req.body.image (set by imageUploader middleware after Cloudinary upload).
 */
const updateCompanyLogo = async (req, res) => {
    try {
        const { id } = req.params;
        const imageUrl = req.body.image;

        if (!imageUrl) {
            return res.status(400).json({
                status: 400,
                error: 'No image provided. Upload a file with field name "companyLogo".'
            });
        }

        const company = await Company.findByIdAndUpdate(
            id,
            { $set: { companyLogo: imageUrl } },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({
                status: 404,
                error: 'Company not found'
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Company logo updated successfully',
            data: {
                companyLogo: company.companyLogo
            }
        });
    } catch (error) {
        console.error('Error in updateCompanyLogo:', error);
        return res.status(500).json({
            status: 500,
            error: error.message || 'Server error'
        });
    }
};

export default updateCompanyLogo;
