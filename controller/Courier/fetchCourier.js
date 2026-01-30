import Courier from "../../model/Courier";

const fetchCouriers = async (req, res) => {
    try {
        const company = req.payload;
        const { page = 1, limit = 10, search = '' } = req.query;

        // Define search criteria based on the 'search' query parameter
        const searchCriteria = search
            ? { 
                company: company.companyId,
                $or: [
                    { courierName: { $regex: search, $options: "i" } }
                ]
              }
            : { company: company.companyId };

        // Fetch Couriers based on search criteria, pagination, and sorting
        const couriers = await Courier.find(searchCriteria)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // Count total documents that match search criteria
        const count = await Courier.find(searchCriteria).countDocuments();

        res.status(200).json({
            status: 200,
            success: true,
            data: couriers,
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


export default fetchCouriers;