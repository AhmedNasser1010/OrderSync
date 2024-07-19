const unknownCommand = require('../../utils/unknownCommand')
const storeMappingPath = require('./storeMappingPath')
const { store } = require('../../store.js')

function storeMapping(input) {
		
	if (input === 'store') {
		console.log(store)
		console.log('<!> You can access on data using property path: store path.to.property <!>')
		return
	} else {
		storeMappingPath(input.split(' ')[1])
		return
	}

	unknownCommand(input)
}

module.exports = storeMapping