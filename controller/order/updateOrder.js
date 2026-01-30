import PurchaseOrder from '../../model/Order';

const updateOrder = async (req, res) => {
    try {
        const company = req.payload;
        const orderId = req.params.id; // assuming the order ID is passed in the URL

        const { 
            internalOrderRefNo,
            referencePurchaseOrder,
            orderType,
            dateRequested,
            dueDate,
            products,
            customerId,
            customerShippingAddress,
            supplier,
            courier
        } = req.body;

        let calculatedProducts;
        let totalAmount;

        // Recalculate product details if products are provided
        if (products) {
            calculatedProducts = products.map(product => ({
                ...product,
                subtotal: product.quantity * product.unitPrice,
                tax: product.tax || 0
            }));

            totalAmount = calculatedProducts.reduce(
                (acc, product) => acc + product.subtotal + product.tax, 
                0
            );
        }


        // Build an update object. Only include fields that are provided.
        const updateFields = {
            ...(internalOrderRefNo !== undefined && { internalOrderRefNo }),
            ...(referencePurchaseOrder !== undefined && { referencePurchaseOrder }),
            ...(orderType !== undefined && { orderType }),
            ...(dateRequested !== undefined && { dateRequested }),
            ...(dueDate !== undefined && { dueDate }),
            ...(products && { products: calculatedProducts, totalAmount }),
            ...(customerId !== undefined && { customerId }),
            ...(customerShippingAddress !== undefined && { customerShippingAddress }),
            ...(supplier !== undefined && { supplier }),
            ...(courier !== undefined && { courier }),
            updatedAt: new Date() // update the timestamp
        };

        // Optionally, include a check to ensure the order belongs to the company making the request.
        const updatedOrder = await PurchaseOrder.findOneAndUpdate(
            { _id: orderId, companyId: company.companyId },
            updateFields,
            { new: true } // return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).json({
                status: 404,
                message: 'Order not found or unauthorized access'
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Order updated successfully',
            data: updatedOrder
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
};

export default updateOrder;
