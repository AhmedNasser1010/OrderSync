import express from 'express';

import getMenu from '../controllers/getMenuController.js'
import newOrder from '../controllers/newOrderController.js'
import getBusinessInfo from '../controllers/getBusinessInfo.js'

const router = express.Router()

router.get('/menu', getMenu)
router.get('/business', getBusinessInfo)
router.post('/new-order', newOrder)

export default router