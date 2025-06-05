import express from 'express';
import auth from '../middleware/authMiddleware.js';
import {
  savePassword,
  getPasswords,
  validateAccessKey,
  getPassword,
  markAsFavorite
} from '../controllers/passwordController.js';

const router = express.Router();

router.use(auth);
router.post('/create', savePassword);
router.get('/', getPasswords);
router.post('/validate-access-key', validateAccessKey);
router.get('/:siteName', getPassword);
router.put('/:id/favorite', markAsFavorite);

export default router;
