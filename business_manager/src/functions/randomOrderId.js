const randomOrderId = () => {
	let result = [];

	result.push(new Date().getTime());
	result.push(Math.floor(Math.random() * 9999));

	return result.join('-');
}

export default randomOrderId;