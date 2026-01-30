import Orders from '../../model/Order';

const trackOrder = async (req, res) => {
    try {
        const { trackingId } = req.query;

        // Fetch the order by tracking ID and populate related fields
        const order = await Orders.findOne({ trackingId })
        .populate({
            path: 'supplier.supplierId',
            model: 'Supplier',
            select: 'supplierName imageUrl email phone'
        })
        .populate({
            path: 'supplier.product',
            model: 'Product',
            select: 'productName productImage'
        })
        .populate({
            path: 'courier.courierId',
            model: 'Courier',
            select: 'courierName courierType imageUrl email'
        })
        .populate({
            path: 'courier.products.productId',
            model: 'Product',
            select: 'productName productImage'
        })
        .populate({
            path: 'products.productId',
            model: 'Product',
            select: 'productName productImage'
        })
        .populate({
            path: 'customerId',
            model: 'Customer',
            select: 'firstName lastName companyName email phone'
        });

        if (!order) {
            return res.status(404).json({
                status: 404,
                message: 'Order not found',
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            data: order,
        });
    } catch (error) {
        console.error(`Error tracking order: ${error.message}`);
        res.status(500).json({
            status: 500,
            error: error.message,
        });
    }
};

export default trackOrder;