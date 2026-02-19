import Company from '../../../model/Company';

/**
 * PATCH /company/:id/currency
 * Update company currency. Body: { currency: string }
 */
const updateCompanyCurrency = async (req, res) => {
    try {
        const { id } = req.params;
        const { currency } = req.body;

        if (currency === undefined || currency === null) {
            return res.status(400).json({
                status: 400,
                success: false,
                error: 'currency is required'
            });
        }

        const company = await Company.findByIdAndUpdate(
            id,
            { $set: { currency: String(currency) } },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                error: 'Company not found'
            });
        }

        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Company currency updated successfully',
            data: { currency: company.currency }
        });
    } catch (error) {
        console.error('Error in updateCompanyCurrency:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'Server error'
        });
    }
};

export default updateCompanyCurrency;
