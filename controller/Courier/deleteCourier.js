import Courier from "../../model/Courier";

const deleteCourier = async (req, res) => {
    try {
        const company = req.payload;
        const courier = await Courier.findOne({ _id: req.params.id, company: company.companyId });

        if (!courier) {
            return res.status(404).json({
                status: 404,
                error: 'Courier not found'
            });
        }

        await Courier.findByIdAndDelete({ _id: req.params.id });

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Courier deleted successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error
        });
    }
        
};

export default deleteCourier