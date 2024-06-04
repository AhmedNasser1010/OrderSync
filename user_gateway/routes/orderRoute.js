import express from 'express';

import getMenu from '../controllers/getMenuController.js'
import newOrder from '../controllers/newOrderController.js'

const router = express.Router();

router.post('/new-order', newOrder);
router.get('/menu', getMenu);

export default router;