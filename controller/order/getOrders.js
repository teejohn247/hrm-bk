import PurchaseOrder from '../../model/Order';

const getOrders = async (req, res) => {
    try {
        const company = req.payload;
        const { page = 1, limit = 10, search = '', customerId, trackingId, supplierId, courierId} = req.query;

        const searchCriteria = {
            company: company.companyId,
            ...(customerId && { customerId }),
            ...(trackingId && { trackingId }),
            ...(supplierId && { 'supplier.supplierId': supplierId }),
            ...(courierId && { 'courier.courierId': courierId }),
            ...(search && {
                $or: [
                    { orderNo: { $regex: search, $options: "i" } }
                ]
            })
        };

        const orders = await PurchaseOrder.find(searchCriteria)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await PurchaseOrder.find(searchCriteria).countDocuments();

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Orders fetched successfully',
            data: orders,
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

export default getOrders;