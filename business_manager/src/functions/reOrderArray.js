const reOrderArray = (array, arrayOfIndexes) => {
  return arrayOfIndexes.map(index => {
    return array[index]
  })
}

export default reOrderArray;