import Customer from '../../model/Customer';
import Admin from '../../model/Company';
import Employee from '../../model/Employees';

const fetchCustomer = async (req, res) => {
    try {
        const company = req.payload;

        const customer = await Customer.findOne({ _id: req.params.id, company: company.companyId }).populate('industry')
       .exec();

        // let admin = await Admin.findOne({ email: email });
        // let employee = await Employee.findOne({ email: email });

        if (!customer) {
            return res.status(404).json({
                status: 404,
                error: 'Customer not found'
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Customer fetched successfully',
            data: customer
        });
    }catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error
        });
    }
};

export default fetchCustomer;