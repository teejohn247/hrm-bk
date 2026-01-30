import Courier from "../../model/Courier";

const createCourier = async (req, res) => {
    try {
        const { freightName, freightType, image, email, phone, address } = req.body;
        const company = req.payload;

        let courierType = freightType;
        if (typeof courierType === 'string' && courierType.startsWith('[')) {
            try {
                courierType = JSON.parse(courierType.replace(/'/g, '"'));
            } catch (e) {
                return res.status(400).json({
                    status: 400,
                    error: 'Invalid freightType format. Must be an array or a properly stringified array.'
                });
            }
        }

        const courierExist = await Courier.findOne({ courierName: freightName, company: company.companyId });
        if (courierExist) {
            return res.status(400).json({
                status: 400,
                error: 'Courier already exists'
            });
        }

        const result = await new Courier({
            courierName: freightName,
            courierType,
            email,
            phoneNumber: phone,
            imageUrl: image,
            address,
            company: company.companyId,
            user: company.id
        }).save();

        res.status(200).json({
            status: 200,
            message: 'Courier created successfully',
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            error: error.message || 'An error occurred'
        });
    }
};

export default createCourier;
