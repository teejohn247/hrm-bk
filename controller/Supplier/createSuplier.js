import Supplier from '../../model/supplier';

const createSupplier = async (req, res) => {
    try {
        const { supplierName, contactPersonName, email, phone, address, image } = req.body;
        const company = req.payload;
        
        //check if supplier exists
        const supplierExist = await Supplier.findOne({ email: email, company: company.companyId });
        if (supplierExist) {
            return res.status(400).json({
                status: 400,
                error: 'Supplier already exists'
            });
        }

        const result = await new Supplier({
            supplierName,
            contactPersonName,
            email,
            phone,
            address,
            imageUrl: image,
            company: company.companyId,
            user: company.id
        }).save();

        res.status(200).json({
            status: 200,
            message: 'Supplier created successfully',
            data: result
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error
        });
    }
}

export default createSupplier;