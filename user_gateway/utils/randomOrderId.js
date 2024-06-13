const randomOrderId = () => {
	let result = []

	result.push(Math.floor(Math.random() * 9999))
	result.push(new Date().getTime())

	return result.join('-')
}

export default randomOrderId