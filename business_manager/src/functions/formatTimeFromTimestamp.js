const formatTimeFromTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    let hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    const strTime = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`
    return strTime
}

export default formatTimeFromTimestamp