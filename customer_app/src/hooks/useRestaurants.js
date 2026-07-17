import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { initRestaurants } from '../rtk/slices/restaurantsSlice'

const useRestaurants = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const businessesRef = collection(db, 'businesses')

    const unsubscribe = onSnapshot(
      businessesRef,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        dispatch(initRestaurants(data))
      },
      (error) => {
        console.error('Error in real-time listener [businesses]:', error?.message)
      }
    )

    return () => unsubscribe()
  }, [])
}

export default useRestaurants