const { store } = require('../../store.js')

function storeMappingPath(path) {
  console.log(path)

  const properties = path.split('.')
  let current = store

  for (const property of properties) {
    if (current[property] === undefined) {
      console.log(undefined)
      return
    }
    current = current[property]
  }

  console.log(current)
  return current
}

module.exports = storeMappingPath