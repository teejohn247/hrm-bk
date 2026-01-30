import Customer from '../../model/Customer';

const updateCustomer = async (req, res) => {
    try{
        const { firstName, lastName, companyName, industry, email, phone, billingAddress, shippingAddress } = req.body;

        await Customer.findByIdAndUpdate(req.params.id, {
            firstName: firstName,
            lastName: lastName,
            companyName: companyName,
            industry: industry,
            email: email,
            phone: phone,
            billingAddress: billingAddress,
            shippingAddress: shippingAddress
        })

        res.status(200).json({
            status: 200,
            success: true,
            message: 'Customer updated successfully'
        });
    } catch(error){
        console.log(error);
        res.status(500).json({
            status: 500,
            error: error
        });
    }
}


export default updateCustomer;