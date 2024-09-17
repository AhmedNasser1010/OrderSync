function filterObject(obj, keysToRemove = [], removeNulls = true) {
  // Filter out null values if removeNulls is true
  const filteredEntries = Object.entries(obj).filter(([key, value]) => {
    if (removeNulls && value === null) {
      return false
    }
    if (keysToRemove.length > 0 && keysToRemove.includes(key)) {
      return false
    }
    return true
  })

  return Object.fromEntries(filteredEntries)
}

export default filterObject
