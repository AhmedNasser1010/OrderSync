import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { initMenu } from '../rtk/slices/menuSlice'
import DB_GET_DOC from '../utils/DB_GET_DOC'

const useRestaurantMenu = (resId) => {
  const dispatch = useDispatch()

  const fetchRestaurantMenu = async _ => await DB_GET_DOC('menus', resId)

  useEffect(() => {
    fetchRestaurantMenu().then(res => dispatch(initMenu(res)))
  }, [])
}

export default useRestaurantMenu