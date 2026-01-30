import Supplier from '../../model/supplier';


const deleteSupplier = async (req, res) => {
    try {
        const company = req.payload;
        const supplier = await Supplier.findOne({ _id: req.params.id, company: company.companyId });

        if (!supplier) {
            return res.status(404).json({
                status: 404,
                error: 'Supplier not found'
            });
        }

        await Supplier.findByIdAndDelete({ _id: req.params.id });

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Supplier deleted successfully'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error
        });
    }
}

export default deleteSupplier;