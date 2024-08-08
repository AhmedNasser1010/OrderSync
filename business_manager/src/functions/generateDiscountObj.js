const generateDiscountObj = (currentItemDiscount) => {
	// Top level
	let regexSwitch = /([A-Za-z]+)-([0-9]+)_SWITCH\{([A-Za-z0-9:;_-]+)\}/i
	let regexNoConditions = /([A-Za-z]+)-([0-9]+)/i
	let topLevelMatches = currentItemDiscount.code.match(regexSwitch) || currentItemDiscount.code.match(regexNoConditions)

	if (topLevelMatches.length === 3) {
		return {
			value: Number(topLevelMatches[2]),
			type: topLevelMatches[1],
			msg: currentItemDiscount.message,
			conditions: []
		}
	}

	// Conditions level
	let nestedCode = topLevelMatches ? topLevelMatches[3] : undefined
	let nestedRegex = /(CASE:[A-Za-z0-9-]+)/ig
	let nestedMatches = nestedCode?.match(nestedRegex)

	// Conditions level discount
	const discount = {
		value: Number(topLevelMatches[2]),
		type: topLevelMatches[1],
		msg: currentItemDiscount.message,
		conditions: []
	}

	// Conditions level values
	const conditionsArr = nestedMatches?.map(condition => {
		let regex = /CASE:([A-Za-z]+)-([0-9]+)/i
		let matches = condition.match(regex)
		return {
			value: Number(matches[2]),
			type: matches[1],
		}
	})

	return {
		...discount,
		conditions: conditionsArr
	}
}

export default generateDiscountObj