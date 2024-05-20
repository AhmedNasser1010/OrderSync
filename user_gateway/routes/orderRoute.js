import express from 'express';

import {
  newOrder,
  getMenu
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/new-order', newOrder);
router.get('/menu', getMenu);

export default router;