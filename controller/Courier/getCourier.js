import Courier from "../../model/Courier";

const getCourier = async (req, res) => {
    try{
        const company = req.payload;

        const findCourier = await Courier.findById({company: company.companyId, _id: req.params.id});
        if(!findCourier){
            return res.status(404).json({
                status: 404,
                error: 'Courier not found'
            });
        }

        

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Courier fetched successfully',
            data: findCourier
        });

    }catch(error){
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error
        });
    }
}

export default getCourier;