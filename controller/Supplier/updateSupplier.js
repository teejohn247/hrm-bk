import Supplier from '../../model/supplier';

const updateSupplier = async (req, res) => {
    try {
        const company = req.payload;
        const supplier = await Supplier.findOne({ _id: req.params.id, company: company.companyId });

        if (!supplier) {
            return res.status(404).json({
                status: 404,
                error: 'Supplier not found'
            });
        }

        const { supplierName, contactPersonName, email, phone, address, image } = req.body;
   
         await Supplier.findByIdAndUpdate({ _id: req.params.id }, {
            supplierName: supplierName,
            contactPersonName: contactPersonName,
            email: email,
            phone: phone,
            address: address,
            imageUrl: image
        });

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Supplier updated successfully'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error
        });
    }
}

export default updateSupplier;