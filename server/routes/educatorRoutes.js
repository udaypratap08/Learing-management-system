import express from 'express';
import {
  addCourse,
  educatorDashboardData,
  getEducatorCourses,
  getEnrolledStudentsData,
} from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js';

const educatorRouter = express.Router();

// Role assignment must be handled through trusted onboarding/admin approval.
// Do not expose an unrestricted /update-role endpoint.

educatorRouter.post('/add-course', protectEducator, upload.single('image'), addCourse);
educatorRouter.get('/courses', protectEducator, getEducatorCourses);
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData);
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData);

export default educatorRouter;



 