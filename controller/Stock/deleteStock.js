import Stock from '../../model/Stock';

const deleteStock = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedStock = await Stock.findByIdAndDelete(id);

        if (!deletedStock) {
            return res.status(404).json({
                status: 404,
                message: 'Stock not found'
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Stock deleted successfully',
            data: deletedStock
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
}

export default deleteStock;