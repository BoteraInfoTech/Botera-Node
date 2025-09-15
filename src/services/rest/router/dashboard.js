import express from 'express';
import auth from '../middleware/auth';
import {
  getDetailsCards,
  getTaskDetails,
  getWeeklyData,
  getRecentConversation,
} from '../controller/dashboard';

const router = express.Router();

router.get('/detailsCards', auth(['O']), getDetailsCards);
router.get('/getTasks', auth(['O']), getTaskDetails);
router.get('/getPerformance', auth(['O']), getWeeklyData);
router.get('/recentConversation', auth(['O']), getRecentConversation);

export default router;
