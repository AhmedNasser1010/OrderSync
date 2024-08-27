import { useSelector, useDispatch } from 'react-redux'
import DB_UPDATE_NESTED_VALUE from '../utils/DB_UPDATE_NESTED_VALUE'
import { updateUserName, updateUserPhone, updateUserAddress, updateUserLocation } from '../rtk/slices/userSlice'

const pathMap = {
  name: 'userInfo.name',
  phone: 'userInfo.phone',
  address: 'locations.home.address',
  location: 'locations.home.latlng'
}

const useUserForm = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)

  const isValidInput = (currentValue, newValue, expectedName, inputName) => {
    if (!user?.userInfo?.uid) {
      console.error('User is not logged in.')
      return false
    }
    if (!newValue) {
      console.error('Input value is empty.')
      return false
    }
    if (expectedName !== inputName) {
      console.error('Input name does not match expected name.')
      return false
    }
    if (currentValue === newValue) {
      console.error('New value is the same as the current value.')
      return false
    }
    return true
  }

  const updateField = async (field, value, updateAction) => {
    try {
      const currentValue = user?.userInfo[field]
      const inputName = field

      if (!isValidInput(currentValue, value, inputName, inputName)) {
        return
      }

      const res = await DB_UPDATE_NESTED_VALUE(
        'customers',
        user.userInfo.uid,
        pathMap[field],
        value
      )
      if (res) {
        dispatch(updateAction(value))
      }
    } catch (error) {
      console.error('Error updating field:', error)
    }
  }

  const saveName = (e) => updateField('name', e?.target?.value, updateUserName)
  const savePhone = (e) => updateField('phone', e?.target?.value, updateUserPhone)
  const saveAddress = (e) => updateField('address', e?.target?.value, updateUserAddress)
  const saveLocation = (value) => updateField('location', value, updateUserLocation)

  return {
    saveName,
    savePhone,
    saveAddress,
    saveLocation
  }
}

export default useUserForm
