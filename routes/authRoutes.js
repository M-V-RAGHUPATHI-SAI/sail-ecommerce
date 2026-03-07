import express from 'express';
import { renderLogin, signup, login, logout } from '../controllers/authController.js';

const router = express.Router();

router.get('/login', renderLogin);
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout); // added a logout just to make it complete

export default router;
