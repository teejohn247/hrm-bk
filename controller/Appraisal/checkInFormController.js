import CheckInForm from '../../model/CheckInForm.js';
import Company from '../../model/Company.js';
import mongoose from 'mongoose';

// Create new form template
async function createForm(req, res) {
    try {
        // Validate and get company first
        const company = await Company.findById(req.payload.id);
        if (!company) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'Company not found'
            });
        }

        console.log({company});

        const formData = {
            ...req.body,
            companyId: req.payload.id,
            companyName: company.companyName
        };

        const newForm = await CheckInForm.create(formData);
        return res.status(201).json({
            status: 200,
            success: true,
            data: newForm
        });
    } catch (error) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: error.message
        });
    }
}

// Get all form templates
async function getForms(req, res) {
        try {
        const forms = await CheckInForm.find({ isActive: true })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            status: 200,
            success: true,
            count: forms.length,
            data: forms
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: error.message
        });
    }
}

// Get single form template
async function getForm(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'Invalid form ID'
            });
        }

        const form = await CheckInForm.findById(req.params.id);
        
        if (!form) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'Form template not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: form
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: error.message
        });
    }
}


// Update form template
async function updateForm(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid form ID'
            });
        }

        const updatedForm = await CheckInForm.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );

        if (!updatedForm) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'Form template not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedForm
        });
    } catch (error) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: error.message
        });
    }
}

// Delete form template (soft delete)
async function deleteForm(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'Invalid form ID'
            });
        }

        const form = await CheckInForm.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!form) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'Form template not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Form template deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: error.message
        });
    }
}

export default {
    createForm,
    getForms,
    getForm,
    updateForm,
    deleteForm
}; 