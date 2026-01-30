import Industry from "../../model/Industry";

const getIndustries = async (req, res) => {
    try {
        const industries = await Industry.find();
        res.status(200).json({
            status: 200,
            message: 'Industries fetched successfully',
            data: industries
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            error: error.message || "Internal Server Error"
        });
    }
}

export default getIndustries;