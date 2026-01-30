import Orders from '../../model/Order'

const deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Orders.findOneAndDelete({ id: req.params.id });

        if (!deletedOrder) {
            return res.status(404).json({
                status: 404,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Order deleted successfully',
            data: deletedOrder
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
}

export default deleteOrder;