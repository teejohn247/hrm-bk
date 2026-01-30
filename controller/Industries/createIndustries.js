import axios from "axios";
import Industry from "../../model/Industry";

const pullIndustries = async (req, res) => {
    try {
        // Fetch data from the API
        const response = await axios.get('https://api.smartrecruiters.com/v1/industries');
        const industries = response.data.content;

        // Process industries and save to database
        const results = [];
        for (const industry of industries) {
            const industryExist = await Industry.findOne({ industryName: industry.label });
            if (!industryExist) {
                const newIndustry = await new Industry({
                    industryName: industry.label
                }).save();
                results.push(newIndustry);
            }
        }

        res.status(200).json({
            status: 200,
            message: 'Industries processed successfully',
            data: results
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            error: error.message || "Internal Server Error"
        });
    }
};

export default pullIndustries;
