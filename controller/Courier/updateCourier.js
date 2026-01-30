import Courier from "../../model/Courier";

const updateCourier = async (req, res) => {
    try {
        const company = req.payload;
        const courier = await Courier.findOne({ _id: req.params.id, company: company.companyId });

        if (!courier) {
            return res.status(404).json({
                status: 404,
                error: 'courier not found'
            });
        }

        const { courierName, courierType, image, email, phoneNumber, address  } = req.body;

        courier.courierName = courierName;
        courier.email = email;
        courier.courierType = courierType;
        courier.image = image;
        courier.phoneNumber = phoneNumber;
        courier.address = address;
        

        await courier.save();

        res.status(200).json({
            status: 200,
            success: true,
            message: 'courier updated successfully'
        });

    }catch(error){
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error
        });
    }
}

export default updateCourier;