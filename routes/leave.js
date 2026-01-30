// Import the new managerLeaveStats endpoint
import managerLeaveStats from '../controller/Leave/managerLeaveStats';

// ... (existing code)

// Add the route for managerLeaveStats
router.get("/manager-stats", verifyToken, managerLeaveStats);

// ... (rest of existing code) 