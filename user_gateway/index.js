import express from 'express'
import cors from 'cors'

import config from './config.js'
import orderRoute from './routes/orderRoute.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', orderRoute)

app.listen(config.port, () => {
	console.log(`Server is live @ ${config.hostUrl}`)
	console.log(`
		Server Routes:    Method:
		/menu             GET
		/business         GET
		/new-order        POST
	`)
})