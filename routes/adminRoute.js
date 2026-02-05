import express from 'express';
// import session from 'express-session';
import addCompany from '../controller/Company/addCompany';
import signin from '../controller/Company/signIn';
import showIndex from '../controller/index';
import addDepartment from '../controller/Department/addDepartment';
import deleteDepartment from '../controller/Department/deleteDepartment';
import fetchDepartment from '../controller/Department/fetchDepartment';
import updateDepartment from '../controller/Department/updateDepartment';
import addPayment from '../controller/Employers/addPaymentInformation';
import addTable from '../controller/Employers/addTable';
import inviteEmployee from '../controller/Employers/createEmployers';
import deleteEmployee from '../controller/Employers/deleteEmployer';
import fetchEmployees from '../controller/Employers/fetchEmployees';
import fetchSpecificEmployees from '../controller/Employers/fetchSpecificEmployee';
import updatePayment from '../controller/Employers/updatePayment';
import addHmo from '../controller/Role/addHmo';
import addLeave from '../controller/Role/addLeaveType';
import addRole from '../controller/Role/addRole';
import fetchRole from '../controller/Role/fetchRole';
import updateRole from '../controller/Role/updateRole';
import middlewareDetect from '../middleware/middlewareDetect';
import auth from '../middleware/auth'
import fetchCompany from '../controller/Company/fetchCompany';
import createCompany from '../controller/Company/createCompany';
import signUp from '../controller/Company/signUp';
import createDesignation from '../controller/createDesignation/createDesignation';
import fetchDesignation from '../controller/createDesignation/fetchDesignation';
// import upload from '../config/multer.config';
import imageUploader from '../middleware/uploadFile'
// import upload from '../middleware/uploadFile';
import addImage from '../controller/addImage';
import { cloudinaryConfig } from '../config/cloudinary';
import listAudits from '../controller/AuditTrail.js/listAudits';
import addDesignationLeave from '../controller/createDesignation/addDesignationLeave';
import addDesignationHmo from '../controller/createDesignation/addDesignationHmo';
import sheetModel from '../model/Test'
import Employees from '../model/Employees';
import forgotPassword from '../controller/Company/forgotPassword'; 
import changePassword from '../controller/Company/changePassword';
import verifyToken from '../controller/Company/verifyToken';
import bulkEmployee from '../controller/Employers/bulkEmployees';
import verifyNewUser from '../controller/Company/verifyNewUser';
import verifyEmployee from '../controller/Employers/verifyEmployee';
import createLeave from '../controller/Leave/createLeave';
import updateLeave from '../controller/Leave/updateLeave';
import fetchLeaves from '../controller/Leave/fetchLeave';
import fetchLeavesDetails from '../controller/Leave/fetchLeaveDetails';
import updateEmployeeAdmin from '../controller/Employers/updateEmployeeAdmin';
import updateEmployee from '../controller/Employers/updateEmployee';
import updateDesignation from '../controller/createDesignation/updateDesignation';
import deleteDesignation from '../controller/createDesignation/deleteDesignation';
import deleteLeave from '../controller/Leave/deleteLeave';
import assignManager from '../controller/Department/assignManager';
import assignManagerEmployee from '../controller/Employers/assignManagerEmployee';
import leaveApplication from '../controller/Employers/leaveApplication';
import leaveAction from '../controller/Employers/leaveAction';
import getLeaveRecords from '../controller/Employers/getLeaveRecords';
import assignDesignation from '../controller/createDesignation/assignDesignation';
import signDecode from '../middleware/signDecode';
import getAdminRecords from '../controller/Employers/getAdminRecords';
import createExpense from '../controller/Expense/createExpense';
import fetchExpenseDetails from '../controller/Expense/fetchExpenseDetails';
import fetchExpense from '../controller/Expense/fetchExpense';
import deleteExpense from '../controller/Expense/deleteExpense';
import updateExpense from '../controller/Expense/updateExpense';
import searchEmployee from '../controller/Employers/searchEmployee';
import updateLeaveApplication from '../controller/Employers/updateLeaveApplication';
import deleteLeaveApplication from '../controller/Employers/deleteLeaveApplication';
import createExpenseRequest from '../controller/Employers/createExpenseRequest';
import fetchExpenseReqs from '../controller/Employers/fetchLeaveRequests';
import getLeaveRecordsDetails from '../controller/Employers/fetchLeaveRequestsDetails';
import fetchExpenseReqDetails from '../controller/Employers/fetchLeaveReqDetails';
import fetchExpenseReqsAdmin from '../controller/Employers/fetchLeaveRequestsAdmin';
import createGroup from '../controller/Appraisal/CreateGroup';
import createKPI from '../controller/Appraisal/createKPI';
import createRating from '../controller/Appraisal/createRating';
import createPeriod from '../controller/Appraisal/appraisalPeriod';
import createFinal from '../controller/Appraisal/createFinal';
import assignKpis from '../controller/Appraisal/assignKpisToGroups';
import fetchGroups from '../controller/Appraisal/fetchGroups';
import fetchKPIs from '../controller/Appraisal/fetchKPIs';
import fetchRatings from '../controller/Appraisal/fetchRatings';
import fetchFinal from '../controller/Appraisal/fetchFinal';
import updateKPI from '../controller/Appraisal/updateKpi';
import updatePeriod from '../controller/Appraisal/updatePeriod';
import updateRating from '../controller/Appraisal/updateRating';
import updateGroup from '../controller/Appraisal/updateGroup';
import updateFinal from '../controller/Appraisal/updateFinal';
import fetchPeriod from '../controller/Appraisal/fetchPeriod';
import deleteFinal from '../controller/Appraisal/deleteFinal';
import deleteGroup from '../controller/Appraisal/deleteGroup';
import deletePeriod from '../controller/Appraisal/deletePeriod';
import deleteRating from '../controller/Appraisal/deleteRating';
import deleteKPI from '../controller/Appraisal/deleteKPI';
// import createRole from '../controller/systemRoles.js/createRole';
import createPermissions from '../controller/systemRoles.js/createPermissions';
import fetchPermissions from '../controller/systemRoles.js/fetchPermissions';
import fetchRoles from '../controller/systemRoles.js/fetchRoles';
import assignRole from '../controller/systemRoles.js/assignRoles';
import assignGroupsDepartment from '../controller/Appraisal/assignGroupsDepartment';
import assignGroupsDesignation from '../controller/Appraisal/assignGroupsDesignation';
import assignGroupsEmployees from '../controller/Appraisal/assignGroupsEmployees';
import approveExpense from '../controller/Expense/approveExpenseRequests';
import fetchGroupsByEmployee from '../controller/Appraisal/fetchGroupsByEmployee';
import fetchGroupsByDesignations from '../controller/Appraisal/fetchGroupsByDesignation';
import fetchGroupsByDepartment from '../controller/Appraisal/fetchGroupsByDeparment';
import fillAppraisal from '../controller/Appraisal/fillAppraisal';
import fetchFinalManager from '../controller/Appraisal/fetchFinalManager';
import createCredits from '../controller/Payroll/createCredits';
import createDebits from '../controller/Payroll/createDebit';
import payrollPeriod from '../controller/Payroll/payrollPeriod';
import fetchCredits from '../controller/Payroll/fetchCredits';
import fetchDebits from '../controller/Payroll/fetchDebits';
import fetchPayrollPeriod from '../controller/Payroll/fetchPayrollPeriod';
import updateCredits from '../controller/Payroll/updateCredit';
import updateDebits from '../controller/Payroll/updateDebits';
import updatePayrollPeriod from '../controller/Payroll/updatePayrollPeriod';
import createPayroll from '../controller/Payroll/createPayroll';
import fetchPayroll from '../controller/Payroll/fetchPayroll';
import fetchEmployeesByDepartment from '../controller/Employers/fetchEmployeesByDepartment';
import fetchRequests from '../controller/Requests/fetchRequests';
import approvedRequests from '../controller/Requests/approvedRequests';
import getAdminApprovedRecords from '../controller/Employers/getAdminApprovedRecords';
import deleteDebit from '../controller/Payroll/deleteDebit';
import deleteCredit from '../controller/Payroll/deleteCredit';
import deleteCompany from '../controller/Company/deleteCompany';
import deleteExpenseRequest from '../controller/Expense/deleteExpenseRequest';
import updateExpenseRequest from '../controller/Expense/updateExpenseRequest';
import createPayrollPeriod from '../controller/Payroll/payrollPeriodData';
import createPeriodPayData from '../controller/Payroll/createPeriodPayData';
import updatePayrollStatus from '../controller/Payroll/updatePayrollStatus';
import payrollGraph from '../controller/Payroll/payrollGraph';
import totalEarnings from '../controller/Payroll/grossSalary';
import netSalary from '../controller/Payroll/netSalary';
import fetchPayrollPrd from '../controller/Payroll/fetchPayrollPrd';
import fetchPayrollPeriodDetails from '../controller/Payroll/fetchPayrollPeriodDetails';
import leaveDetails from '../controller/Leave/leaveDetails';
import updatePeriodData from '../controller/Payroll/updatePeriodData';
import expenseGraph from '../controller/Expense/expenseGraph';
import addPaymentAdmin from '../controller/Employers/addPaymentAdmin';
import createHoliday from '../controller/Holiday/createHoliday';
import updateHoliday from '../controller/Holiday/updateHolidays';
import fetchHoliday from '../controller/Holiday/fetchHoliday';
import fetchHolidayDetails from '../controller/Holiday/fetchHolidayDetails';
import deleteHoliday from '../controller/Holiday/deleteHoliday';
import assignApproval from '../controller/Employers/assignApproval';
import setExpense from '../controller/Employers/setExpense';
import employeeKPI from '../controller/Appraisal/employeeKpi';
import rateKPI from '../controller/Appraisal/RateKPI';
import fetchAppraisalPeriodDetails from '../controller/Appraisal/fetchAppraisalPeriodDetails';
import fetchGroupsByPeriod from '../controller/Appraisal/fetchGroupsByPeriod';
import createMeeting from '../controller/Meeting/createMeeting';
import updateMeeting from '../controller/Meeting/updateMeeting';
import fetchMeeting from '../controller/Meeting/fetchMeeting';
import fetchMeetingDetails from '../controller/Meeting/fetchMeetingDetails';
import deleteMeeting from '../controller/Meeting/deleteMeeting';
import createVisit from '../controller/Visitors/createVisit';
import updateVisitor from '../controller/Visitors/updateVisitor';
import checkIn from '../controller/Visitors/checkIn';
import checkOut from '../controller/Visitors/checkOut';
import fetchVisits from '../controller/Visitors/fetchVisits';
import calender from '../controller/Holiday/calender';
import createJobListing from '../controller/JobListings/createJobListing';
import fetchJobListings from '../controller/JobListings/fetchJobListings';
import updateJobListing from '../controller/JobListings/updateJobListing';
import deleteJobListing from '../controller/JobListings/deleteJobListing';
import fetchJobListingDetails from '../controller/JobListings/fetchJobListingDetails';
import publishJobListing from '../controller/JobListings/publishJobListing';
import createForm from '../controller/JobListings/createForm';
import updateForm from '../controller/JobListings/updateForm';
import exportEmployees from '../controller/Employers/exportEmployees';
import exportPayroll from '../controller/Exports/exportPayroll';
import createSalaryScale from '../controller/salaryScale/createSalaryScale';
import fetchSalaryScale from '../controller/salaryScale/fetchSalaryScale';
import deleteSalaryscale from '../controller/salaryScale/deleteSalaryscale';
import updateSalaryScale from '../controller/salaryScale/updateSalaryScale';
import payrollSettings from '../controller/Payroll/payrollSettings';
import createPost from '../controller/Post/createPost';
import getPosts from '../controller/Post/getAllPost';
import deletePost from '../controller/Post/deletePost';
import getPost from '../controller/Post/getSinglePost';
import updatePost from '../controller/Post/updatePost';
import payrollYears from '../controller/Payroll/payrollYears';
import fetchEmails from '../controller/Email/fetchEmails';
import signInAceERP from '../controller/AceERP/Auth/signInAceErp';
import generatePasswordForAceERP from '../controller/AceERP/Auth/createAdmin';
import fetchAllCompanies from '../controller/AceERP/Auth/fetchAllCompanies';
import updateEmployeePermission from '../controller/RolesandPermissions/updateEmployeePermission';
import updateRoleAndPermissions from '../controller/RolesandPermissions/updateRoleandPermissions';
import subscribe from '../controller/AceERP/Auth/subscribe';
import companyId from '../controller/AceERP/Auth/companyId';
import createCustomer from '../controller/Customer/createCustomer';
import fetchCustomers from '../controller/Customer/fetchCustomers';
import fetchCustomer from '../controller/Customer/fetchCustomer';
import deleteCustomer from '../controller/Customer/deleteCustomer';
import createSupplier from '../controller/Supplier/createSuplier';
import createCourier from '../controller/Courier/createCourier';
import getSuppliers from '../controller/Supplier/getSuppliers';
import getSupplier from '../controller/Supplier/getSupplier';
import updateSupplier from '../controller/Supplier/updateSupplier';
import deleteSupplier from '../controller/Supplier/deleteSupplier';
import importSuppliers from '../controller/Supplier/importSupplier';
import fetchCouriers from '../controller/Courier/fetchCourier';
import getCourier from '../controller/Courier/getCourier';
import updateCourier from '../controller/Courier/updateCourier';
import deleteCourier from '../controller/Courier/deleteCourier';
import updateCustomer from '../controller/Customer/updateCustomer';
import createOrder from '../controller/order/createOrder';
import editCompany from '../controller/AceERP/Auth/editCompany';
import modules from '../controller/AceERP/Auth/modules';
import moduleController from '../controller/AceERP/Auth/modules';
import addPermission from '../controller/AceERP/Auth/modules';
import role from '../controller/AceERP/Auth/roles';
import fetchAdminRoles from '../controller/AceERP/Auth/fetchRoles';
import toggleModule from '../controller/AceERP/Auth/toggleModule';
import fetchModules from '../controller/AceERP/Auth/fetchModules';
import getOrders from '../controller/order/getOrders';
import getOrder from '../controller/order/getOrder';
import updateOrder from '../controller/order/updateOrder';
import deleteOrder from '../controller/order/deleteOrder';
import createSubPlan from '../controller/AceERP/Auth/createSubPlan';
import fetchPlans from '../controller/AceERP/Auth/fetchPlans';
import fetchSubscriptions from '../controller/AceERP/Auth/fetchSubscriptions';
import fetchSubscriptionByCompany from '../controller/AceERP/Auth/fetchSubscriptionByCompany';
import createProductCategory from '../controller/ProductCategory/createCategory';
import getCategories from '../controller/ProductCategory/getCategories';
import getCategory from '../controller/ProductCategory/getCategory';
import updateCategory from '../controller/ProductCategory/updateCategories';
import deleteCategory from '../controller/ProductCategory/deleteCategory';
import createProduct from '../controller/Product/createProduct';
import getProducts from '../controller/Product/getProducts';
import getProduct from '../controller/Product/getProduct';
import deleteProduct from '../controller/Product/deleteProduct';
import checkInFormController from '../controller/Appraisal/checkInFormController';

import createMediaFeed from '../controller/MediaFeeds/createMediaFeed';
import updateMediaFeed from '../controller/MediaFeeds/updateMediaFeed';
import publishMediaFeed from '../controller/MediaFeeds/publishMediaFeed';
import deleteMediaFeed from '../controller/MediaFeeds/deleteMediaFeed';
import getMediaFeed from '../controller/MediaFeeds/fetchMediaFeed';
import fetchByCompanyMediaFeed from '../controller/MediaFeeds/fetchByCompany';
import leaveRecordsDetails from '../controller/Leave/leaveRecordsDetails';

import importCustomersFromCSV from '../controller/Customer/importCustomer';
import exportCustomersToExcel from '../controller/Customer/exportCustomer';
import pullIndustries from '../controller/Industries/createIndustries';
import getIndustries from '../controller/Industries/getIndustries';

import utils from '../config/utils';

import Employee from '../model/Employees';

import updateProduct from '../controller/Product/updateProduct';
import createStock from '../controller/Stock/createStock';
import fetchStocks from '../controller/Stock/fetchStocks';
import importStock from '../controller/Stock/importStock';
import fetchStock from '../controller/Stock/fetchStock';
import importProducts from '../controller/Product/importProduct';
import trackOrder from '../controller/order/orderTracking';

import getQuizById from '../controller/Quiz/getQuizById.js';
import createQuiz from '../controller/Quiz/createQuiz.js';
import updateQuiz from '../controller/Quiz/updateQuiz.js';
import deleteQuiz from '../controller/Quiz/deleteQuiz.js';
import submitQuizAnswers from '../controller/Quiz/submitQuizAnswers.js';

import getAllCourses from '../controller/Course/getAllCourses.js';
import getCourseById from '../controller/Course/getCourseById.js';
import createCourse from '../controller/Course/createCourse.js';
import updateCourse from '../controller/Course/updateCourse.js';
import deleteCourse from '../controller/Course/deleteCourse.js';
import getQuizzesByCourseId from '../controller/Quiz/getQuizzesByCourseId.js';
import {
  createShift,
  getAllShifts,
  getShiftById,
  updateShift,
  deleteShift,
  getShiftsByEmployeeId,
  assignEmployeesToShift,
  checkInOutEmployee
} from '../controller/Shifts/ShiftController';

import updateEmployeeAppraisalStatus from '../controller/Appraisal/updateEmployeeAppraisalStatus.js';

// Import user complaint controllers
import {
    createComplaint,
    getComplaints,
    getComplaintById,
    updateComplaint,
    deleteComplaint,
    uploadScreenshot,
    getUserComplaints,
    getStaffComplaints
} from '../controller/Complaints';

import managerLeaveStats from '../controller/Leave/managerLeaveStats';

// Import Announcement controllers
import createAnnouncement from '../controller/Announcement/createAnnouncement';
import fetchAnnouncements from '../controller/Announcement/fetchAnnouncements';
import fetchAnnouncementById from '../controller/Announcement/fetchAnnouncementById';
import updateAnnouncement from '../controller/Announcement/updateAnnouncement';
import deleteAnnouncement from '../controller/Announcement/deleteAnnouncement';

// Import Branch controllers
import createBranch from '../controller/Branch/createBranch';
import fetchBranches from '../controller/Branch/fetchBranches';
import fetchBranchById from '../controller/Branch/fetchBranchById';
import updateBranch from '../controller/Branch/updateBranch';
import deleteBranch from '../controller/Branch/deleteBranch';
import addEmployeeToBranch from '../controller/Branch/addEmployeeToBranch';
import removeEmployeeFromBranch from '../controller/Branch/removeEmployeeFromBranch';

// Import HelpSupport controllers
import createTicket from '../controller/HelpSupport/createTicket';
import fetchTickets from '../controller/HelpSupport/fetchTickets';
import fetchTicketById from '../controller/HelpSupport/fetchTicketById';
import updateTicket from '../controller/HelpSupport/updateTicket';
import addMessageToTicket from '../controller/HelpSupport/addMessageToTicket';
import deleteTicket from '../controller/HelpSupport/deleteTicket';

const { userValidationRules, validate } = require('../middleware/signUpValidation')
const multer = require("multer");
const mult = multer({ dest: "uploads/" });
const cloudinary = require("cloudinary").v2;
const Multer = require("multer");
const csv = require('csvtojson');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET,
  });

  
  const storage = new Multer.memoryStorage();
  const upload = Multer({
    storage,
  });

  const storagecsv = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
  
  const uploadcsv = multer({ storage: storagecsv });

  async function handleUpload(file) {
    const res = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return res;
  }

const router = express.Router();
// Public routes
router.get('/courseCategories', getAllCategories);
router.get('/courseCategory/:id', getCategoryById);

// Protected routes
router.post('/courseCategory',  createCategory);
router.put('/courseCategory/:id',  updateCategory);
router.delete('/courseCategory/:id',  deleteCategory);

router.get('/courses', getAllCourses);
router.get('/course/:id', getCourseById);
router.post('/course', upload.single("thumbnail"), imageUploader, createCourse);
router.patch('/course/:id', upload.single("thumbnail"), imageUploader, updateCourse);
router.delete('/course/:id', deleteCourse);

router.get('/assessment/:id', getQuizById);
router.get('/assessment/:quizId/submissions/:submissionId', getQuizSubmissionDetails);
router.get('/assessment/:courseId/results', getCourseQuizResults);
router.get('/assessment/course/:courseId', getQuizStatsByCourseId);
router.get('/getAssessments', getAllQuizzes);
// Protected routes (require authentication)
router.post('/assessment', createQuiz);
router.patch('/assessment/:id', updateQuiz);
router.delete('/assessment/:id', deleteQuiz);
router.post('/assessment/submit', auth, submitQuizAnswers);
router.get('/assessment/user/:userId', getUserQuizSubmissions);
router.get('/getAssessment/:courseId', getQuizzesByCourseId);
router.get('/getResults/:quizId', getQuizWithSubmissions);
router.get('/getCourseProgress/:courseId/:userId', getCourseProgress);
router.get('/getUserCoursesProgress/:userId', getUserCoursesProgress);
router.patch('/updateCourseProgress/:courseId/:userId', updateCourseProgress);
router.get('/:courseId/fix-quiz-relationship', fixCourseQuizRelationships);


// Add session middleware BEFORE passport initialization
// router.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         secure: false,
//         maxAge: 24 * 60 * 60 * 1000
//     }
// }));

// Initialize passport and session AFTER session middleware
// router.use(passport.initialize());
// router.use(passport.session());

// // Passport configuration
// passport.serializeUser((user, done) => {
//     done(null, user);
// });

// passport.deserializeUser((user, done) => {
//     done(null, user);
// });

router.post("/upload-cv", upload.single("payroll"), (req, res) => {
  //convert csvfile to jsonArray
  
  const fileName = req.file.filename


    csv()
    .fromFile(req.file.path)
    .then((jsonObj) => {
      console.log(jsonObj)
   
      Employees.insertMany(jsonObj, function(err){
        if (err){
          console.log(err);

          res.status(500).json({
            status: 500,
            success: true,
            data: err
        })

        } else {
          console.log("Succesfully saved");
          res.status(200).json({
            status: 200,
            success: true,
            data: "Update Successful"
        })
        }
      });

});
});


// import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import updateCompanyByCompany from '../controller/AceERP/Auth/updateCompanyByCompany';
import assignSalaryScale from '../controller/salaryScale/assignSalaryScale';
import deleteRolePermissions from '../controller/AceERP/Auth/deleteRolePermission';
import syncCompanyFeaturesToRoles from '../controller/AceERP/Auth/syncCompanyFeaturesToRoles';
import deletePayrollPeriod from '../controller/Payroll/deletePeriod';
import deleteStock from '../controller/Stock/deleteStock';
import updateEmployeeLeaveType from '../controller/Leave/updateLeaveType';
import fetchLeaveByEmployeeId from '../controller/Leave/fetchLeaveByEmployeeId';
import getAllCategories from '../controller/Category/getAllCategories.js';
import getCategoryById from '../controller/Category/getCategoryById.js';
import createCategory from '../controller/Category/createCategory.js';
import getQuizSubmissionDetails from '../controller/Quiz/getQuizSubmissionDetails.js';
import getCourseQuizResults from '../controller/Quiz/getCourseQuizResults.js';
import getUserQuizSubmissions from '../controller/Quiz/getUserQuizSubmissions.js';
import getQuizStatsByCourseId from '../controller/Quiz/getQuizStatsByCourseId.js';
import getQuizWithSubmissions from '../controller/Quiz/getQuizWithSubmissions.js';
import getCourseProgress from '../controller/Course/getCourseProgress.js';
import getUserCoursesProgress from '../controller/Course/getUserCoursesProgress.js';
import updateCourseProgress from '../controller/Course/updateCourseProgress.js';
import getAllQuizzes from '../controller/Quiz/getAllQuizzes.js';
import fixCourseQuizRelationships from '../controller/Quiz/fixCourseQuizRelationships.js';
import updateAppraisalPeriod from '../controller/Appraisal/updateAppraisalPeriod.js';
import importFreights from '../controller/Courier/importCourier.js';

// Add passport configuration
// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// passport.use(new GoogleStrategy({
//     clientID: process.env.clientID.trim(),
//     clientSecret: process.env.clientSecret.trim(),
//     callbackURL: process.env.callbackURL.trim(),
//     scope: ['profile', 'email']
//   },
//   function(request, accessToken, refreshToken, profile, done) {
//     return done(null, profile);
//   }
// ));


router.get("/", (req, res) => {
    res.json({message: "You are not logged in"})
})

router.get("/failed", (req, res) => {
    res.send("Failed")
})
router.get("/success", (req, res) => {
    res.send(`Welcome ${req.user.email}`)
})

// router.get('/google',
//     passport.authenticate('google')
// );

// router.get('/auth/google/callback',
//     passport.authenticate('google', { 
//         failureRedirect: '/failed',
//         // successRedirect: '/success',
//         failureFlash: true
//     }),
//     async (req, res) => {



//       console.log(req.user)
//       const email = req.user.emails[0].value;

//       console.log(email)

//           // Find employee by email
//           const employee = await Employee.findOne({ email });
            
//           if (!employee) {
//               return res.status(404).json({
//                   success: false,
//                   error: 'No account found with this email'
//               });
//           }

//           console.log(employee)

//           // Generate token using the same method as signIn
//           const token = utils.encodeToken(
//               employee._id,
//               false,
//               email,
//               employee.companyId
//           );

//           res.status(200).json({
//               success: true,
//               message: 'Authentication successful',
//               token,
//               user: {
//                   id: employee._id,
//                   email: employee.email,
//                   companyId: employee.companyId
//                   // Add other needed employee fields
//               }
//           });
//   }
// );

router.post('/forgotPassword', forgotPassword);
router.get('/', showIndex);
router.patch('/changePassword', auth, changePassword);
router.patch('/verifyPassword', verifyToken);
router.post("/addImage", auth, upload.single("my_file"), imageUploader, addImage);
router.post('/addEmployee', auth, inviteEmployee);
router.patch('/addLeaveType/:roleId', auth, addLeave);

router.post('/emailWebhook', fetchEmails);

// router.patch('/addHmo/:id', auth, addHmo);
router.patch('/addLeave/:id', auth, addDesignationLeave);
router.patch('/addHmo/:id', auth, addDesignationHmo);
router.post('/addCompany', addCompany);
router.post('/signIn', signin);
router.post('/addRole', auth, addRole);
router.post('/updateRole/:id', updateRole);
router.get('/fetchCompanyRoles', auth, fetchRole);
router.get('/fetchCompany', auth, fetchCompany);
router.post('/createCompany', auth, createCompany);
router.post('/signUp', signUp);
router.post('/createDesignation', auth,  createDesignation);
router.post('/addDepartment', auth, addDepartment);
router.get('/fetchDepartments', auth, fetchDepartment);
router.patch('/updateDepartment/:id',auth, updateDepartment);
router.delete('/deleteDepartment/:id',auth, deleteDepartment);
router.post('/addTable', addTable);
router.patch('/addPayment',auth, addPayment);
router.post('/updatePayment', auth, updatePayment);
router.get('/fetchEmployees',auth,  fetchEmployees);
router.get('/fetchEmployee/:id', auth, fetchSpecificEmployees);
router.patch('/adminUpdateEmployee/:id', auth, upload.single("profilePhoto"), imageUploader,  updateEmployeeAdmin);
router.patch('/updateEmployee', auth, upload.single("profilePhoto"), imageUploader,  updateEmployee);
router.delete('/deleteEmployee/:id', auth, deleteEmployee);
router.get('/fetchDesignations', auth, fetchDesignation);
router.get('/listAuditTrails', auth, listAudits);
router.post("/uploadBulkEmployees", auth, mult.single("file"), bulkEmployee);
router.post("/verifyEmail", verifyNewUser);
router.post("/decodeEmail", verifyToken);
router.post("/setPassword", signDecode, verifyEmployee);
router.post("/createLeave", auth, createLeave);
router.post("/createExpenseType", auth, createExpense);
router.get("/getExpense/:id", auth, fetchExpenseDetails);
router.get("/getExpenseTypes", auth,fetchExpense);
router.delete("/deleteExpenseType/:id", auth,deleteExpense);
router.patch("/updateExpenseType/:id", auth,updateExpense);
router.get("/searchEmployee", auth, searchEmployee);
router.patch("/assignDepartmentManager", auth, assignManager);
router.patch("/assignManager", auth, assignManagerEmployee);
router.delete("/deleteLeave/:leaveId", auth, deleteLeave);
router.patch("/updateLeave/:id", auth, updateLeave);
router.get("/fetchLeave", auth, fetchLeaves);
router.get("/fetchLeave/:id", auth, fetchLeavesDetails);
router.patch("/updateDesignation/:id", auth, updateDesignation);
router.delete("/deleteDesignation/:id", auth, deleteDesignation);
router.delete("/deleteDebit/:id", auth, deleteDebit);
router.delete("/deleteCredit/:id", auth, deleteCredit);
router.post("/leaveApplication", auth, leaveApplication);
router.patch("/leaveAction", auth, leaveAction);
router.get("/getLeaveRecords", auth, getLeaveRecords);
router.patch("/assignBulkDesignation", auth, assignDesignation);
router.get("/fetchRequestedLeaves", auth, getAdminRecords);
router.patch("/updateLeaveApplication/:id", auth, updateLeaveApplication);
router.delete("/deleteLeaveApplication/:id", auth, deleteLeaveApplication);
router.post("/createExpenseRequests", auth, upload.single("attachment"), imageUploader, createExpenseRequest);
router.get("/fetchExpenseRequests", auth, fetchExpenseReqs);
router.get("/getLeaveRecords/:id", auth, getLeaveRecordsDetails);
router.get("/fetchApprovalExpenseRequest", auth, fetchExpenseReqsAdmin);
router.post("/createKpiGroups", auth, createGroup);
router.post("/createKpis", auth, createKPI);
router.post("/createRating", auth, createRating);
router.post("/createAppraisalPeriod", auth, createPeriod);
router.post("/createAppraisal", auth, createFinal);
router.patch("/assignKpis", auth, assignKpis);
router.get("/fetchAppraisalGroups", auth, fetchGroups);
router.get("/fetchKPIs", auth, fetchKPIs);
router.get("/fetchRatings", auth, fetchRatings);
router.get("/fetchAppraisals", auth, fetchFinal);
router.get("/fetchPeriod", auth, fetchPeriod);
router.get("/fetchGroupByEmployee", auth, fetchGroupsByEmployee);
router.get("/fetchGroupByDesignation/:designation", auth, fetchGroupsByDesignations);
router.get("/fetchGroupByDepartment/:department", auth, fetchGroupsByDepartment);
router.get("/fetchAppraisalRequests/:id",   auth, fetchFinalManager);
router.get("/fetchApprovedLeaveRequests/:id", auth, getAdminApprovedRecords);
router.patch("/updateKPIs/:id", auth, updateKPI);
router.patch("/updatePeriod/:id", auth, updatePeriod);
router.patch("/updateRating/:id", auth, updateRating);
router.patch("/updateGroup/:id", auth, updateGroup);
router.patch("/updateAppraisal/:id", auth, updateFinal);
router.patch("/updateAppraisalPeriodStatus/:id", auth, updateAppraisalPeriod);
router.patch("/updateEmployeeAppraisalStatus/:appraisalDataId", auth, updateEmployeeAppraisalStatus);
router.patch("/assignAppraisalToDepartment", auth, assignGroupsDepartment);
router.patch("/assignAppraisalToDesignations", auth, assignGroupsDesignation);
router.patch("/assignAppraisalToEmployees", auth, assignGroupsEmployees);
router.patch("/updateExpenseRequest/:id", auth, upload.single("attachment"), imageUploader, updateExpenseRequest);
router.patch("/expenseAction", auth, approveExpense);
router.post("/employeeFillAppraisal", auth, fillAppraisal);
router.get("/fetchApprovalRequests/:id", auth, fetchRequests);
router.get("/fetchEmployeesByDepartment", auth, fetchEmployeesByDepartment);
router.get("/fetchApprovedLeaveRequests", auth, approvedRequests);
router.delete("/deleteKPI/:id", auth, deleteKPI);
router.delete("/deletePeriod/:id", auth, deletePeriod);
router.delete("/deleteRating/:id", auth, deleteRating);
router.delete("/deleteGroup/:id", auth, deleteGroup);
router.delete("/deleteAppraisal/:id", auth, deleteFinal);
router.delete("/deleteCompany", auth, deleteCompany);
router.delete("/deleteExpenseRequest/:id", auth, deleteExpenseRequest);
router.delete("/deletePayrollPeriod/:id", auth, deletePayrollPeriod);
// router.post("/createRole", auth, createRole);
router.post("/createPermissions", auth, createPermissions);
router.get("/fetchPermissions", auth, fetchPermissions);
router.patch("/assignRole", auth, assignRole);
router.get("/fetchRoles", auth, fetchRoles);
router.post("/createCredits", auth, createCredits);
router.post("/createDebits", auth, createDebits);
router.post("/createPayrollPeriod", auth, createPayrollPeriod);
router.get("/fetchCredits", auth, fetchCredits);
router.get("/fetchDebits", auth, fetchDebits);
// router.get("/fetchPayrollPeriods", auth, fetchPayrollPeriod);
router.patch("/updateCredits/:id", auth, updateCredits);
router.patch("/updateDebits/:id", auth, updateDebits);
router.patch("/updatePayrollPeriod/:id", auth, updatePayrollPeriod);
router.post("/createPermissions", auth, createPermissions);
router.get("/fetchPermissions", auth, fetchPermissions);
router.patch("/assignRole", auth, assignRole);
router.get("/fetchRoles", auth, fetchRoles);
router.get("/fetchPayroll", auth, fetchPayroll);
router.get("/fetchEmployeesByDepartment", auth, fetchEmployeesByDepartment);
router.patch("/updatePayrollStatus", auth, updatePayrollStatus);
router.get("/payrollGraph/:year", auth, payrollGraph);
router.post("/uploadPayroll/:id", auth, mult.single("file"), createPeriodPayData);
router.get("/totalEarnings", auth, totalEarnings);
router.get("/totalnetEarnings", auth, netSalary);
router.get("/fetchPayrollPeriods", auth, fetchPayrollPrd);
router.get("/fetchPayrollPeriodDetails/:id", auth, fetchPayrollPeriodDetails);
router.get("/leaveStats", auth, leaveDetails);
router.get("/expenseGraph/:year", auth, expenseGraph);
router.patch("/updatePayrollEntry/:id", auth, updatePeriodData);
router.patch("/addPayment/:id", auth, addPaymentAdmin);
router.post("/createHoliday", auth, createHoliday);
router.patch("/updateHoliday/:id", auth, updateHoliday);
router.get("/fetchHolidays", auth, fetchHoliday);
router.get("/fetchHoliday/:id", auth, fetchHolidayDetails);
router.delete("/deleteHoliday/:id", auth, deleteHoliday);
router.patch("/assignApprover", auth, assignApproval);
router.patch("/setExpense",  setExpense);
router.patch("/managerRateKpi/:id",  auth, rateKPI);
router.post("/employeeRequestAppraisal", auth, employeeKPI);
router.get("/fetchAppraisalPeriod/:id", auth, fetchAppraisalPeriodDetails);
router.get("/fetchGroupDetails/:employeeId/:appraisalPeriodId", auth, fetchGroupsByPeriod);
router.post("/createMeeting", auth, createMeeting);
router.patch("/updateMeeting/:id", auth, updateMeeting);
router.get("/fetchMeetings", auth, fetchMeeting);
router.get("/fetchMeeting/:id", auth, fetchMeetingDetails);
router.delete("/deleteMeeting/:id", auth, deleteMeeting);
router.get("/fetchCalendar", auth, calender);
router.post("/bookVisitor", auth, createVisit);
router.patch("/updateVisit/:id", auth, updateVisitor);
router.get("/fetchVisits", auth, fetchVisits);
router.patch("/checkIn/:id", auth, checkIn);
router.patch("/checkOut/:id", auth, checkOut);
router.post("/createJobListing", auth, createJobListing);
router.get("/exportEmployees", auth, exportEmployees);
router.post("/createForm", auth, createForm);
router.patch("/updateForm", auth, updateForm);
router.get("/fetchJobListings", auth, fetchJobListings);
router.get("/fetchJobListing/:id", auth, fetchJobListingDetails);
router.patch("/fetchJobListing/:id", auth, updateJobListing);
router.patch("/publishJob/:id", auth, publishJobListing);
router.delete("/deleteJobListing/:id", auth, deleteJobListing);
router.post("/createForm", auth, createForm);
router.patch("/updateForm/:id", auth, updateForm);
router.get("/exportPayroll/:id", auth, exportPayroll);
router.post('/createSalaryScale', auth,  createSalaryScale);
router.get('/fetchSalaryScale', auth,  fetchSalaryScale);
router.delete('/deleteSalaryScale/:id', auth, deleteSalaryscale);
router.patch('/updateSalaryScale/:id', auth, updateSalaryScale);
router.patch('/setPayrollFrequency', auth, payrollSettings);
router.post('/createPost', auth, createPost);
router.get('/fetchPosts', auth, getPosts);
router.delete('/deletePost/:id', auth, deletePost);
router.get('/fetchPost/:id', auth, getPost);
router.patch('/updatePost/:id', auth, updatePost);
router.get('/payrollYears', auth, payrollYears);
router.post('/signInAceERP', signInAceERP);
router.post('/createAdminAceERP', generatePasswordForAceERP);
router.get('/fetchAllCompanies', auth, fetchAllCompanies);
router.put('/update-permissions', auth, updateEmployeePermission); 
router.put('/updateRole', auth, updateRoleAndPermissions);
router.post('/subscribe', auth, subscribe);
router.get('/companyId/:companyId', auth, companyId);
router.post('/create-customer', auth, createCustomer);
router.post('/import-customer', auth, mult.single("file"), importCustomersFromCSV)
router.get('/export-customer', auth, exportCustomersToExcel)
router.get('/fetch-customers', auth, fetchCustomers);
router.get('/fetch-customer/:id', auth, fetchCustomer);
router.delete('/delete-customer/:id', auth, deleteCustomer);
router.post('/create-supplier', auth,  upload.single("logo"), imageUploader, createSupplier);
router.get('/fetch-suppliers', auth, getSuppliers);
router.get('/fetch-supplier/:id', auth, getSupplier);
router.patch('/update-supplier/:id', auth, upload.single("logo"), imageUploader, updateSupplier);
router.delete('/delete-supplier/:id', auth, deleteSupplier);
router.post('/import-supplier', auth, mult.single("file"), importSuppliers);
router.post('/create-Courier', auth, upload.single("logo"), imageUploader, createCourier);
router.get('/fetch-Couriers', auth, fetchCouriers);
router.get('/fetch-Courier/:id', auth, getCourier);
router.patch('/update-Courier/:id', auth, upload.single("logo"), imageUploader, updateCourier)
router.delete('/delete-Courier/:id', auth, deleteCourier)
router.post('/importFreights', auth, mult.single("file"), importFreights);

router.patch('/update-customer/:id', auth, updateCustomer);
router.post('/create-order', auth, upload.single("logo"), imageUploader, createOrder)
router.get('/get-orders', auth, getOrders)
router.get('/get-order/:id', auth, getOrder)
router.patch('/update-order/:id', auth, upload.single("logo"), updateOrder)
router.delete('/delete-order/:id', auth, deleteOrder)
router.patch('/editCompany/:id', auth, editCompany);
router.post('/createPermission', auth, addPermission);
router.get('/fetchModules', auth, fetchModules);
// router.get('/fetchModule/:id', auth, moduleController.fetchModule);
router.post('/createRole', auth, role);
router.get('/roles', auth, fetchAdminRoles);
router.patch('/updatePermissions', auth, toggleModule);
router.post('/createSubPlan', createSubPlan);
router.get('/subscriptionPlans', fetchPlans);
router.post('/subscribe', subscribe);
router.get('/subscriptions', fetchSubscriptions);
router.get('/subscriptions/company/:companyId', fetchSubscriptionByCompany);
router.post('/create-product-cat', auth, createProductCategory);
router.get('/get-product-cats', auth, getCategories);
router.get('/get-product-cat/:id', auth, getCategory);
router.patch('/updaite-product-cat/:id', auth, updateCategory);
router.delete('/delete-product-cat/:id', auth, deleteCategory);
router.post('/create-product', auth, upload.single("productImage"), imageUploader, createProduct);
router.get('/fetch-products', auth, getProducts);
router.get('/fetch-product/:id', auth, getProduct);
router.post('/import-products', auth, mult.single("file"), importProducts)
router.delete('/delete-product/:id', auth, deleteProduct);


router.post('/createAppraisalForm', auth, checkInFormController.createForm);
router.get('/getAppraisalForms', auth, checkInFormController.getForms);
router.get('/getAppraisalForm/:id', auth, checkInFormController.getForm);
router.patch('/updateAppraisalForm/:id', auth, checkInFormController.updateForm);
router.delete('/deleteAppraisalForm/:id', auth, checkInFormController.deleteForm);

router.get('/getMediaFeeds',auth, getMediaFeed);
router.get('/fetchMediaFeedByCompany',auth, fetchByCompanyMediaFeed);
router.delete('/deleteMediaFeed/:id', auth, deleteMediaFeed);
router.patch('/updateMediaFeed/:id', auth, upload.single("image"), imageUploader, updateMediaFeed);
router.patch('/publishMediaFeed/:id', auth, publishMediaFeed);
router.post('/createMediaFeed', auth, upload.single("image"), imageUploader, createMediaFeed);
router.get('/leaveGraphDetails', auth, leaveRecordsDetails);

router.patch('/updateCompany/:id', auth, updateCompanyByCompany);
router.patch('/assignSalaryScale', auth, assignSalaryScale);
router.delete('/deleteRolePermissions/:companyId', auth, deleteRolePermissions);

router.patch('/update-product/:id', auth, upload.single("productImage"), imageUploader, updateProduct);
router.get('/pull-industry', pullIndustries);
router.get('/fetch-industries', auth, getIndustries);
router.post('/create-stock', auth, createStock)
router.get('/fetch-stocks', auth, fetchStocks)
router.post('/import-stock', auth, uploadcsv.single('file'), importStock)
router.get('/fetch-stock/:id', auth, fetchStock)
router.delete('/delete-stock/:id', auth, deleteStock)

router.get('/order-tracking', trackOrder)
router.post('/sync-company-features', syncCompanyFeaturesToRoles);

router.post('/createShift', auth, createShift);
router.get('/getShift', auth, getAllShifts);
router.get('/getShift/:id', auth, getShiftById);
router.patch('/updateShift/:id',auth, updateShift);
router.delete('/deleteShift/:id', auth, deleteShift);
router.get('/getEmployeeShift/:employeeId', auth, getShiftsByEmployeeId);
router.post('/assign-employees/:id', auth, assignEmployeesToShift);
router.patch('/check-in-out/:id', auth, checkInOutEmployee);
router.patch('/assignLeaveDays', auth, updateEmployeeLeaveType);
router.get('/fetchLeaveByEmployeeId', auth, fetchLeaveByEmployeeId);
// Route to handle creating a new form and getting all forms
// router
//     .route('/')
//     .get(auth, checkInFormController.getForms)
//     .post(auth, );

// // Route to handle getting, updating, and deleting a single form by ID
// router
//     .route('/:id')
//     .get(auth, checkInFormController.getForm)  
//     .put(auth, checkInFormController.updateForm)
//     .delete(auth, checkInFormController.deleteForm);

// Add route handlers for user complaints
router.post('/complaints', auth, createComplaint);
router.get('/complaints/user', auth, getUserComplaints);
router.get('/complaints/staff', auth, getStaffComplaints);
router.get('/complaints', auth, getComplaints);
router.get('/complaints/:id', auth, getComplaintById);
router.patch('/complaints/:id', auth, updateComplaint);
router.delete('/complaints/:id', auth, deleteComplaint);
router.post('/complaints/upload-screenshot', auth, uploadScreenshot);

router.get('/managerLeaveStats', auth, managerLeaveStats);

// Announcement routes
router.post('/announcements', auth, createAnnouncement);
router.get('/announcements', auth, fetchAnnouncements);
router.get('/announcements/:id', auth, fetchAnnouncementById);
router.patch('/announcements/:id', auth, updateAnnouncement);
router.delete('/announcements/:id', auth, deleteAnnouncement);

// Branch routes
router.post('/branches', auth, createBranch);
router.get('/branches', auth, fetchBranches);
router.get('/branches/:id', auth, fetchBranchById);
router.patch('/branches/:id', auth, updateBranch);
router.delete('/branches/:id', auth, deleteBranch);
router.post('/branches/:branchId/employees', auth, addEmployeeToBranch);
router.delete('/branches/:branchId/employees/:employeeId', auth, removeEmployeeFromBranch);

// HelpSupport routes
router.post('/support-tickets', auth, createTicket);
router.get('/support-tickets', auth, fetchTickets);
router.get('/support-tickets/:id', auth, fetchTicketById);
router.patch('/support-tickets/:id', auth, updateTicket);
router.post('/support-tickets/:id/messages', auth, addMessageToTicket);
router.delete('/support-tickets/:id', auth, deleteTicket);


export default router;