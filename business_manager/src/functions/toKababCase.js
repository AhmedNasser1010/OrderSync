const toKababCase = (text) => {
	return text.toLowerCase().split(' ').join('-');
}

export default toKababCase;