const generateDiscountCode = (discountData, hasCondition) => {
	const { type, value, msg } = discountData
	let conditionArr = []

	if (discountData?.conditions?.length) {
		conditionArr = discountData.conditions.map(condi => {
			return `CASE:${condi.type}-${condi.value};`
		})
	}

	return {
		code: conditionArr.length && hasCondition ? `${type}-${value}_SWITCH{${conditionArr.join('')}}` : `${type}-${value}`,
		message: msg
	}
}

export default generateDiscountCode