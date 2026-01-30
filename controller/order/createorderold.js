import Orders from '../../model/Order'
const { v4: uuidv4 } = require('uuid');

const createOrder = async (req, res) => {
    try {
        const company = req.payload;
        const { 
            internalOrderRef, 
            customerId, 
            orderCreationDate, 
            actualOrderDeliveryDate, 
            proposedOrderDeliveryDate, 
            items, 
            shippingAddress, 
            paymentTerms, 
            notes, 
            attachments 
        } = req.body;

        // Generate a unique tracking ID for the order
        const trackingId = uuidv4();

        // Calculate the subtotal for each item and the grand total
        const calculatedItems = items.map(item => ({
            ...item,
            subtotal: item.quantity * item.unitPrice
        }));

        const subtotal = calculatedItems.reduce((acc, item) => acc + item.subtotal, 0);
        
        // Calculate grandTotal
        const grandTotal = subtotal + (items[0].taxTotal || 0) + (items.reduce((acc, item) => acc + (item.shippingCost || 0), 0)) - (items.reduce((acc, item) => acc + (item.discountTotal || 0), 0));

        const newOrder = await new Orders({
            internalOrderRef, 
            customerId, 
            orderCreationDate, 
            actualOrderDeliveryDate, 
            proposedOrderDeliveryDate, 
            items: calculatedItems, 
            shippingAddress, 
            paymentTerms, 
            subtotal, 
            taxTotal: items.reduce((acc, item) => acc + item.taxTotal, 0), // Total tax from all items
            shippingCost: items.reduce((acc, item) => acc + (item.shippingCost || 0), 0), 
            discountTotal: items.reduce((acc, item) => acc + (item.discountTotal || 0), 0), 
            grandTotal, 
            notes, 
            attachments, 
            trackingId, 
            company: company.companyId, 
            userId: company.id
        }).save();

        res.status(201).json({
            status: 201,
            success: true,
            message: 'Order created successfully',
            data: newOrder
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error
        });
    }
};

export default createOrder;
