import PurchaseOrder from '../../model/Order';
import { v4 as uuidv4 } from 'uuid';

const createOrder = async (req, res) => {
    try {
        const company = req.payload;

        const { 
            internalOrderRefNo,
            referencePurchaseOrder,
            orderType,
            dateRequested,
            dueDate,
            products,
            customerId,
            customerShippingAddress
        } = req.body;
        
        // Generate unique order reference number (PO-YYYY-MMDDXX)
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const serialNumber = Math.floor(Math.random() * 100); 
        const orderNo = `PO-${year}-${month}${day}${serialNumber}`;
        
        // Generate a unique tracking ID
        const trackingId = uuidv4();

        // Calculate the subtotal, tax, and total amount
        const calculatedProducts = products.map(product => ({
            ...product,
            subtotal: product.quantity * product.unitPrice,
            tax: product.tax || 0
        }));

        const totalAmount = calculatedProducts.reduce((acc, product) => acc + product.subtotal + product.tax, 0);

        const newOrder = new PurchaseOrder({
            orderNo, // Assuming this is unique and auto-generated
            internalOrderRefNo,
            trackingId,
            referencePurchaseOrder,
            orderType,
            dateRequested,
            dueDate,
            products: calculatedProducts,
            customerId,
            customerShippingAddress,
            totalAmount,
            status: 'pending', // Default status
            notes: '',
            companyId: company.companyId,
            userId: company.id
        });

        await newOrder.save();

        res.status(201).json({
            status: 201,
            success: true,
            message: 'Order created successfully',
            data: newOrder
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
};


export default createOrder;