const { store } = require('../store.js')

function askQuestion(query, defaultValue) {
  return new Promise(resolve => {
    store.rl.values.question(query, (answer) => {
      resolve(answer || defaultValue)
    })
    store.rl.values.write(defaultValue)
  })
}


module.exports = askQuestion