import Stock from '../../model/Stock';

const fetchStock = async (req, res) => {
    try {
        //view a single stock
        const { id } = req.params;

        const stock = await Stock.findOne({ _id: id })
            .populate('supplier')
            .populate('productId');

        if (!stock) {
            return res.status(404).json({
                status: 404,
                message: 'Stock not found'
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            data: stock
        });

    }catch(error){
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error.message
        });
    }
}


export default fetchStock;