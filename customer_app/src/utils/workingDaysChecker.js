import { getBusinessDayOfTimestamp } from '@ordersync/order-utils'

const workingDaysChecker = (workingDays, isStrictOnline) => {

	if (!workingDays) return null

	if (isStrictOnline === true) return true

	if (isStrictOnline === false) return false

	const businessDay = getBusinessDayOfTimestamp(Date.now(), workingDays)

	return businessDay !== null
}

export default workingDaysChecker
