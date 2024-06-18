import { useDispatch } from 'react-redux'

import { clearBusiness } from '../rtk/slices/businessSlice'
import { clearMenu } from '../rtk/slices/menuSlice'
import { clearOrders } from '../rtk/slices/ordersSlice'
import { clearUser } from '../rtk/slices/userSlice'
import { clearWorkers } from '../rtk/slices/workersSlice'
import { setUserRegisterStatus } from '../rtk/slices/conditionalValuesSlice'
import AUTH_signout from '../functions/AUTH_signout'

const useLogout = () => {
  const dispatch = useDispatch()

  const handleLogout = async () => {
    const res = await AUTH_signout()
    if (res) {
      dispatch(clearBusiness())
      dispatch(clearMenu())
      dispatch(clearOrders())
      dispatch(clearUser())
      dispatch(clearWorkers())
      dispatch(setUserRegisterStatus('LOGGED_OUT'))
    }
  };

  return handleLogout
}

export default useLogout