const { spawn } = require('child_process')

function restartApp(rl) {
	rl.close() // Close readline interface

	// Reset terminal state
	process.stdin.setRawMode(false)

	console.log('Restarting the application...')
	const child = spawn(process.argv[0], process.argv.slice(1), {
		stdio: 'inherit'
	})

	child.on('error', (err) => {
		console.error('Failed to restart:', err)
	})

	child.on('exit', (code, signal) => {
		console.log(`Child process exited with code ${code} and signal ${signal}`)
		rl.resume() // Resume readline interface
		rl.prompt() // Prompt for new input
	})

	// Optionally, you can handle SIGINT to properly close the application
	process.on('SIGINT', () => {
		console.log('Exiting...')
		rl.close()
		process.exit(0)
	})

	console.clear()
}

module.exports = restartApp