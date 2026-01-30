import express from 'express';
import getassessmentById from '../../../controller/assessment/getassessmentById.js';
import createassessment from '../../../controller/assessment/createassessment.js';
import updateassessment from '../../../controller/assessment/updateassessment.js';
import deleteassessment from '../../../controller/assessment/deleteassessment.js';
import submitassessmentAnswers from '../../../controller/assessment/submitassessmentAnswers.js';
import getassessmentSubmissionDetails from '../../../controller/assessment/getassessmentSubmissionDetails.js';
import getCourseassessmentResults from '../../../controller/assessment/getCourseassessmentResults.js';
import getassessmentzesByCourseId from '../../../controller/assessment/getassessmentzesByCourseId.js';

const router = express.Router();

// Public routes
router.get('/:id', getassessmentById);

// Protected routes (require authentication)
router.post('/', createassessment);
router.put('/:id', updateassessment);
router.delete('/:id', deleteassessment);
router.post('/submit',submitassessmentAnswers);
router.get('/:assessmentId/submissions/:submissionId', getassessmentSubmissionDetails);
router.get('/:courseId/results', getCourseassessmentResults);
router.get('/course/:courseId', getassessmentzesByCourseId);

export default router;