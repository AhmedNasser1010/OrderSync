import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from "react-router-dom"
import { store } from './rtk/store'
import { Provider } from 'react-redux'

// styles
import './style/index.css'
import './style/sideBar.css'
import './style/keyframs.css'
import "./style/mediaSM.css"

// Fonts
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import "@fontsource/roboto"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/400-italic.css"

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<BrowserRouter> 
		<Provider store={store}>
			<App />
		</Provider>
	</BrowserRouter>
)

window.read = 0
window.write = 0

navigator.serviceWorker.register('sw.js')