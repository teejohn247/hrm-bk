import Orders from '../../model/Order'

const getOrder = async (req, res) => {
    try {
        const order = await Orders.findOne({ _id: req.params.id })
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
                message: 'Order not found'
            });
        }

        res.status(200).json({
            status: 200,
            data: order
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
}

export default getOrder;