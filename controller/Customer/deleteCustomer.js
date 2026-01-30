import Customer from '../../model/Customer';

const deleteCustomer = async (req, res) => {
    try {
        const company = req.payload;
        const customer = await Customer.findOne({ _id: req.params.id, company: company.companyId });

        if (!customer) {
            return res.status(404).json({
                status: 404,
                error: 'Customer not found'
            });
        }

        await Customer.findByIdAndDelete({ _id: req.params.id });

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Customer deleted successfully'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error
        });
    }
};


export default deleteCustomer;