import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { initRestaurants } from '../rtk/slices/restaurantsSlice'
import DB_GET_COLLECTION from '../utils/DB_GET_COLLECTION'

const useRestaurants = () => {
  const dispatch = useDispatch()

  const fetchRestaurants = async _ => await DB_GET_COLLECTION('businesses')

  useEffect(() => {
    fetchRestaurants().then(res => dispatch(initRestaurants(res)))
  }, [])
}

export default useRestaurants