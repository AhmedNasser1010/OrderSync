const toTitle = (text, comma) => {
	let result = text;

	result = result.toLowerCase();
	result = result.split(comma);
	result = result.map(word => word[0].toUpperCase() + word.slice(1));
	result = result.join(' ');

	return result;
}

export default toTitle;