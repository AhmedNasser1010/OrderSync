const fromKebabToTitle = (kebabText) => {

	if (kebabText) {
		let kebabTextSplit = kebabText.split("-");

		kebabTextSplit = kebabTextSplit.map(text => text[0].toUpperCase() + text.slice(1))

		return kebabTextSplit.join(" ");
	}

	return '';
}

export default fromKebabToTitle;