import { useDispatch } from 'react-redux'
import { initMenu } from '../rtk/slices/menuSlice'
import DB_GET_DOC from '../utils/DB_GET_DOC'

const useRestaurantMenu = () => {
  const dispatch = useDispatch()

  const resMenu = (resId) => {
    DB_GET_DOC('menus', resId)
    .then(menu => dispatch(initMenu(menu)))
  }

  return resMenu
}

export default useRestaurantMenu