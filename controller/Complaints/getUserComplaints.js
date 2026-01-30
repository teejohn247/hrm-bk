import dotenv from 'dotenv';
import UserComplaint from '../../model/UserComplaint';
import Employee from '../../model/Employees';
import Company from '../../model/Company';

dotenv.config();

/**
 * Controller for getting complaints created by a specific user
 * @route GET /api/complaints/user
 * @description Returns complaints created by the current user
 */
const getUserComplaints = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, issueCategory } = req.query;
        const userId = req.payload.id || req.params.id;
        
        // Build query - always filter by the current user's ID
        const query = { 
            userId: userId,
            isDeleted: false 
        };
        
        // Apply filters if provided
        if (status) {
            query.status = status;
        }
        
        if (issueCategory) {
            query.issueCategory = issueCategory;
        }
        
        // Execute query with pagination
        const complaints = await UserComplaint.find(query)
            .sort({ createdAt: -1 }) // Most recent first
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .exec();
            
        // Get total count for pagination
        const totalComplaints = await UserComplaint.countDocuments(query);
        
        // Format response data
        const formattedComplaints = complaints.map(complaint => ({
            id: complaint._id,
            userFullName: complaint.userFullName,
            userEmail: complaint.userEmail,
            companyName: complaint.companyName,
            description: complaint.description,
            issueCategory: complaint.issueCategory,
            screenshots: complaint.screenshots || [], // Return array of screenshots
            status: complaint.status,
            createdAt: complaint.createdAt,
            updatedAt: complaint.updatedAt,
            assignedToName: complaint.assignedToName || null,
            resolution: complaint.resolution || null,
            resolutionDate: complaint.resolutionDate || null,
            createdByRole: complaint.createdByRole || 'employee'
        }));
        
        return res.status(200).json({
            status: 200,
            success: true,
            data: formattedComplaints,
            pagination: {
                totalComplaints,
                totalPages: Math.ceil(totalComplaints / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
        
    } catch (error) {
        console.error('Error fetching user complaints:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            error: error.message || 'An error occurred while fetching user complaints'
        });
    }
};

export default getUserComplaints; 