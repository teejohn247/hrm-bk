import Customer from '../../model/Customer';

const fetchCustomers = async (req, res) => {
    try {
        const company = req.payload;
    
        const { page = 1, limit = 10, search = '' } = req.query;

        const searchCriteria = search
        ? { 
            company: company.companyId,
            $or: [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { companyName: { $regex: search, $options: "i" } }
            ]
          }
        : { company: company.companyId };

        const customers = await Customer.find(searchCriteria).sort({
            createdAt: -1
        })
        .populate('industry')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
        
        const count = await Customer.find(searchCriteria).countDocuments()
        
        res.status(200).json({
            status: 200,
            success: true,
            data: customers,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error
        });
    }
};

export default fetchCustomers;