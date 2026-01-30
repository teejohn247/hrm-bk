import Customer from '../../model/Customer';
import Company from '../../model/Company';
import Industry from '../../model/Industry';


const createCustomer = async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            companyName,
            customerType, 
            industry, 
            email, 
            phone, 
            shippingAddress 
        } = req.body;

        const company = req.payload;

        // Check if the customer already exists
        const customerExist = await Customer.findOne({ email, company: company.companyId });
        if (customerExist) {
            return res.status(400).json({
                status: 400,
                error: 'Customer already exists',
            });
        }

        const industryExists = await Industry.findById(industry);
        if (!industryExists) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid industry ID'
            });
        }

        // Fetch the company details
        const companyResult = await Company.findOne({ id: company.companyId });
        if (!companyResult) {
            return res.status(404).json({
                status: 404,
                error: 'Company not found',
            });
        }

        // Check if the company has a system role named "External"
        const externalRole = companyResult.systemRoles.find(role => role.roleName === 'External');
        
        if (!externalRole) {
            return res.status(400).json({
                status: 400,
                error: 'Role "External" not found',
            });
        }

        // Create and save the new customer
        const newCustomer = new Customer({
            firstName,
            lastName,
            companyName,
            customerType,
            industry,
            email,
            phone,
            shippingAddress,
            company: company.companyId,
            systemRoles: externalRole,
            user: company.id,
        });

        const result = await newCustomer.save();

        // Return success response
        return res.status(201).json({
            status: 201,
            message: 'Customer created successfully',
            data: result,
        });
    } catch (error) {
        console.error('Error creating customer:', error.message);
        return res.status(500).json({
            status: 500,
            error: 'Internal Server Error',
        });
    }
};


export default createCustomer;