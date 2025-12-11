import express from 'express';
import {
  getGifList,
  getUnsplashImages,
  getPixabayImages,
  uploadMedia,
} from '../controller/misc';
import auth from '../middleware/auth';

const router = express.Router();

router.get('/getGif', auth(['O']), getGifList);
router.get('/getUnsplashImage', auth(['O']), getUnsplashImages);
router.get('/getPixabayImages', auth(['O']), getPixabayImages);
router.post('/uploadMedia', auth(['O']), uploadMedia);

export default router;
