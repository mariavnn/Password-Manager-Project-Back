import { Router } from 'express';
const router = Router();
import auth from '../middleware/authMiddleware';
import { savePassword, getPasswords, validateAccessKey, getPassword } from '../controllers/passwordController';

router.use(auth);
router.post('/', savePassword);
router.get('/', getPasswords);
router.post('/validate-access-key', validateAccessKey);
router.get('/:site', getPassword);

export default router;
