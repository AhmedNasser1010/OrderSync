const workingDaysChecker = (workingDays, isStrictOnline) => {

	if (!workingDays) return null

	if (isStrictOnline === true) return true

	if (isStrictOnline === false) return false

	const weekdayNames = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday"
	]

	const currentDate = new Date()
	const currentHours = currentDate.getHours()
	const currentMinutes = currentDate.getMinutes()
	const currentDayIndex = currentDate.getDay()

	const currentDayName = weekdayNames[currentDayIndex]
	const currentWorkingDay = workingDays[currentDayName]

	if (!currentWorkingDay) return false

	const startHoursMinutes = currentWorkingDay.start.split(':').map(Number)
	const endHoursMinutes = currentWorkingDay.end.split(':').map(Number)

	const currentTimeInMinutes = currentHours * 60 + currentMinutes
	const startTimeInMinutes = startHoursMinutes[0] * 60 + startHoursMinutes[1]
	const endTimeInMinutes = endHoursMinutes[0] * 60 + endHoursMinutes[1]

	const isOpen = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes

	return isOpen ? true : false
}

export default workingDaysChecker