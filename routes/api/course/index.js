import express from 'express';
import getAllCourses from '../../../controller/Course/getAllCourses.js';
import getCourseById from '../../../controller/Course/getCourseById.js';
import createCourse from '../../../controller/Course/createCourse.js';
import updateCourse from '../../../controller/Course/updateCourse.js';
import deleteCourse from '../../../controller/Course/deleteCourse.js';
import fixCourseQuizRelationship from '../../../controller/Course/fixCourseQuizRelationship.js';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

// Utility route to fix course-quiz relationship
router.get('/:courseId/fix-quiz-relationship', fixCourseQuizRelationship);

export default router; 