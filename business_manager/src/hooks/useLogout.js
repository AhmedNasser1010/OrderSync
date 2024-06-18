import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { clearBusiness } from '../rtk/slices/businessSlice'
import { clearMenu } from '../rtk/slices/menuSlice'
import { clearOrders } from '../rtk/slices/ordersSlice'
import { clearUser } from '../rtk/slices/userSlice'
import { clearStaff } from '../rtk/slices/staffSlice'
import { setUserRegisterStatus } from '../rtk/slices/conditionalValuesSlice'
import AUTH_signout from '../functions/AUTH_signout'

const useLogout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const res = await AUTH_signout()
    if (res) {
      dispatch(clearBusiness())
      dispatch(clearMenu())
      dispatch(clearOrders())
      dispatch(clearUser())
      dispatch(clearStaff())
      dispatch(setUserRegisterStatus('LOGGED_OUT'))
      navigate('/')
    }
  };

  return handleLogout
}

export default useLogout