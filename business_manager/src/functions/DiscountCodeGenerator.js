const DiscountCodeGenerator = ({ value, type, msg }) => {
	return {
		discount: {
			code: `${type}-${value}`,
			message: msg
		}
	}
}

export default DiscountCodeGenerator