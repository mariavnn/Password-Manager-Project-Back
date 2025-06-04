import express from 'express';
import auth from '../middleware/authMiddleware.js';
import {
  savePassword,
  getPasswords,
  validateAccessKey,
  getPassword
} from '../controllers/passwordController.js';

const router = express.Router();

router.use(auth);
router.post('/create', savePassword);
router.get('/', getPasswords);
router.post('/validate-access-key', validateAccessKey);
router.get('/:site', getPassword);

export default router;
