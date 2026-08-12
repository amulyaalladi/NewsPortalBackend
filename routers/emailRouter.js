import express from 'express';
import { handleSendEmail } from './emailController.js';

const router = express.Router();

// Route definition mapping directly to controller logic
router.post('/send', handleSendEmail);

export default router;