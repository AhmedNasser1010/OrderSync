const now = new Date()
const day = String(now.getDate()).padStart(2, '0')
const month = String(now.getMonth() + 1).padStart(2, '0')
const year = now.getFullYear()
const hours = String(now.getHours()).padStart(2, '0')
const minutes = String(now.getMinutes()).padStart(2, '0')
const seconds = String(now.getSeconds()).padStart(2, '0')
const ampm = hours >= 12 ? 'PM' : 'AM'

const formattedDate = `${day}/${month}/${year}`
const formattedTime = `${hours % 12 || 12}:${minutes}:${seconds} ${ampm}`

function doneMsg(duration, orders, driver) {
	const ordersCopy = orders || []
	const ordersIds = ordersCopy.map(order => order.id)
	const durationCopy = duration || 0
	const driverCopy = driver || {uid: 'Null'}
	
	console.log(`\x1b[44m\x1b[37mASSIGN\x1b[0m \x1b[90m${formattedDate} \x1b[90m${formattedTime}\x1b[0m \x1b[90mDuration ${durationCopy}ms\x1b[0m : ${driverCopy.uid} => [${ordersIds.join(', ')}]`)
}
function warningMsg(duration, orders, driver, msg) {
	const ordersCopy = orders || []
	const ordersIds = ordersCopy.map(order => order.id)
	const durationCopy = duration || 0
	const driverCopy = driver || {uid: 'Null'}
	const msgCopy = msg || ''

	console.log(`\x1b[43m\x1b[37mWARNING\x1b[0m \x1b[90m${formattedDate} \x1b[90m${formattedTime}\x1b[0m \x1b[90mDuration ${durationCopy}ms\x1b[0m : ${driverCopy.uid} => [${ordersIds.join(', ')}] : ${msgCopy}`)
}
function errorMsg(duration, orders, driver, msg) {
	const ordersCopy = orders || []
	const ordersIds = ordersCopy?.map(order => order.id)
	const durationCopy = duration || 0
	const driverCopy = driver || {uid: 'Null'}
	const msgCopy = msg || ''
	
	console.log(`\x1b[41m\x1b[37mERROR\x1b[0m \x1b[90m${formattedDate} \x1b[90m${formattedTime}\x1b[0m \x1b[90mDuration ${durationCopy}ms\x1b[0m : ${driverCopy.uid} => [${ordersIds.join(', ')}] : ${msgCopy}`)
}
function criticalErrorMsg(duration, orders, driver, msg) {
	const ordersCopy = orders || []
	const ordersIds = ordersCopy?.map(order => order.id)
	const durationCopy = duration || 0
	const driverCopy = driver || {uid: 'Null'}
	const msgCopy = msg || ''
	
	console.log(`\x1b[41m\x1b[37mERROR\x1b[0m \x1b[41m\x1b[37m${formattedDate} \x1b[41m\x1b[37m${formattedTime} \x1b[41m\x1b[37mDuration ${durationCopy}ms \x1b[41m\x1b[37m${driverCopy.uid} => [${ordersIds.join(', ')}] : ${msgCopy}\x1b[0m`)
}

const assignLog = {
	done: (duration, orders, driver) => doneMsg(duration, orders, driver),
	error: (duration, orders, driver, msg) => errorMsg(duration, orders, driver, msg),
	warning: (duration, orders, driver, msg) => warningMsg(duration, orders, driver, msg),
	criticalError: (duration, orders, driver, msg) => criticalErrorMsg(duration, orders, driver, msg)
}

module.exports = assignLog