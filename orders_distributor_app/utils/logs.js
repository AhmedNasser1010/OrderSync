const { spawn } = require('child_process')
const fs = require('fs')

function logs() {
	const logFile = 'logs.txt'
	const scriptProcess = spawn('script', [logFile])

	scriptProcess.stdout.on('data', (data) => {
		console.log(`Logging started. Output redirected to ${logFile}`)
	})

	scriptProcess.stderr.on('data', (data) => {
		console.error(`Error starting logging: ${data}`)
	})

	scriptProcess.on('close', (code) => {
		if (code === 0) {
			console.log(`Logging completed. Output saved to ${logFile}`)
		} else {
			console.error(`Logging process exited with code ${code}`)
		}
	})
}

module.exports = logs