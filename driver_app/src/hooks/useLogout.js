import { useDispatch } from 'react-redux'

import { clearBusiness } from '../rtk/slices/businessSlice'
// import { clearMenus } from '../rtk/slices/menuSlices'
import { clearOrders } from '../rtk/slices/ordersSlice'
import { clearUser } from '../rtk/slices/userSlice'
import { setUserRegisterStatus } from '../rtk/slices/conditionalValuesSlice'
import AUTH_SIGNOUT from '../utils/AUTH_SIGNOUT'

const useLogout = () => {
  const dispatch = useDispatch()

  const handleLogout = async () => {
    const res = await AUTH_SIGNOUT()
    if (res) {
      dispatch(clearBusiness())
      // dispatch(clearMenus())
      dispatch(clearOrders())
      dispatch(clearUser())
      dispatch(setUserRegisterStatus('LOGGED_OUT'))
    }
  };

  return handleLogout
}

export default useLogout