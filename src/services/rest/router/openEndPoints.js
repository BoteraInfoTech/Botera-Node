import express from 'express';

const router = express.Router();

// welcome Route
router.get('/', (req, res) => {
  res.send({ message: 'Welcome To Botera' });
});

router.get('/welcome', (req, res) => {
  res.send('Welcome To Botera  :)');
});

export default router;
