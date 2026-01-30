import Supplier from '../../model/supplier';

const getSuppliers = async (req, res) => {
    try {
        const company = req.payload;
        const { page = 1, limit = 10, search = '' } = req.query;

        // Define search criteria based on the 'search' query parameter
        const searchCriteria = search
            ? { 
                company: company.companyId,
                $or: [
                    { supplierName: { $regex: search, $options: "i" } }
                ]
              }
            : { company: company.companyId };

        // Fetch suppliers based on search criteria, pagination, and sorting
        const suppliers = await Supplier.find(searchCriteria)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // Count total documents that match search criteria
        const count = await Supplier.find(searchCriteria).countDocuments();

        res.status(200).json({
            status: 200,
            success: true,
            data: suppliers,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
};


export default getSuppliers;