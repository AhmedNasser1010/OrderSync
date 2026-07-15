import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { initMenus } from '../rtk/slices/menusSlice'
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../firebase.js"

function useMenus() {
	const dispatch = useDispatch()
	const queue = useSelector(state => state.queue)

	const getCurrentAccessTokens = () => {
		let accessTokensFiltered = []

		queue.map(quOrder => {
			const finded = accessTokensFiltered.find(accessToken => accessToken === quOrder.accessToken)
			!finded && accessTokensFiltered.push(quOrder.accessToken)
		})

		return accessTokensFiltered
	}

	const menus = async () => {
		try {

			if (!queue.length) {
				dispatch(initMenus([]))
				return
			}

			// Get current accessToken's
			const accessTokens = getCurrentAccessTokens()

			// Get menus data based on current accessTokens
			const q = query(collection(db, "menus"), where("accessToken", "in", accessTokens))
			const querySnapshot = await getDocs(q)
			const allMenus = []

			querySnapshot.forEach((doc) => {
				doc.data().items.map(item => allMenus.push(item))
			})

			dispatch(initMenus(allMenus))

		} catch(e) {
			console.log(e)
		}
	}

	return menus
}

export default useMenus