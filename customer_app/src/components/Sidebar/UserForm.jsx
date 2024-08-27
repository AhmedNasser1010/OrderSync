import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import TextInput from './TextInput'
import FindUserLocationMap from './FindUserLocationMap'
import useUserForm from '../../hooks/useUserForm'

const defaultLocation = [29.620106778124843, 31.255811811669496]

const UserForm = () => {
  const { t, i18n } = useTranslation()
  const user = useSelector((state) => state.user)
  const { saveName, savePhone, saveAddress, saveLocation } = useUserForm()
  const [formValues, setFormValues] = useState({
    name: '',
    phone: '',
    address: '',
    location: null
  })

  useEffect(() => {
    if (user?.userInfo) {
      setFormValues({
        name: user?.userInfo?.name || '',
        phone: user?.userInfo?.phone || '',
        address: user?.locations?.home?.address || '',
        location: user?.locations?.home?.latlng[0] ? user?.locations?.home?.latlng : null
      })
    }
  }, [user])

  const inputProps = (name, placeholder, onBlur) => {
    return {
      name,
      placeholder: t(placeholder),
      onBlur,
      value: formValues[name],
      onChange: (e) => setFormValues({ ...formValues, [name]: e.target.value }),
      variant: formValues[name] ? 'standard' : 'error'
    }
  }

  return (
    <div>
      <TextInput {...inputProps('name', 'User Name', saveName)} />
      <TextInput {...inputProps('phone', 'Phone Number', savePhone)} />
      <TextInput {...inputProps('address', 'Street, village, or well known place', saveAddress)} />
      <div className="border-t my-5"></div>
      <div className={`mx-7 ${!formValues.location && 'ring-1 ring-red-500'}`}>
        <FindUserLocationMap
          userLocation={formValues.location}
          defaultLocation={defaultLocation}
          onChange={(value) => {
            setFormValues({ ...formValues, location: value })
            saveLocation(value)
          }}
        />
      </div>
    </div>
  )
}

export default UserForm
