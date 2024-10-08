import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { IoIosCloseCircleOutline } from 'react-icons/io'
import { IoIosArrowDown } from 'react-icons/io'
import { IoIosCloseCircle } from 'react-icons/io'
import { IoIosCheckmarkCircle } from 'react-icons/io'

import { useDispatch, useSelector } from 'react-redux'
import { toggleLoginSidebar } from '../../utils/toggleSlice.js'
import { addUser, removeUser } from '../../utils/userAuthSlice.js'
import { clearCart } from '../../utils/cartSlice.js'
import AUTH_SIGNOUT from '../../utils/AUTH_SIGNOUT'
import useLanguageDirection from '../../hooks/useLanguageDirection'
import { toggleLng } from '../../rtk/slices/toggleSlice'

import SigninPhoneProvider from './SigninPhoneProvider'
import SignupGoogleProvider from './SignupGoogleProvider'
import UserInfoForm from './UserInfoForm'
import UserAddress from './UserAddress'
import UserForm from './UserForm'

const LoginSidebar = () => {
  const { t, i18n } = useTranslation()
  const direction = useLanguageDirection()
  const dispatch = useDispatch()
  const isLoginSidebarOpen = useSelector((state) => state.toggle.isLoginSidebarOpen)
  const user = useSelector((state) => state.user)
  const lng = useSelector((state) => state.toggle.lng)
  const [status, setStatus] = useState('LOGIN')
  const [expandUserInfo, setExpandUserInfo] = useState(false)

  useEffect(() => {
    if (user?.userInfo && expandUserInfo === false && isLoginSidebarOpen === true) {
      if (!user.userInfo?.name || !user.userInfo?.phone || !user.location?.home?.address || !user.location?.home?.latlng) {
        setExpandUserInfo(true)
      }
    }
  }, [user, isLoginSidebarOpen])

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    dispatch(toggleLng(lng))
  }

  const handleCloseSidebar = () => {
    dispatch(toggleLoginSidebar())
    document.body.classList.remove('overflow-hidden')
    setExpandUserInfo(false)
  }

  const handleLogout = () => {
    AUTH_SIGNOUT().then((res) => res && window.location.reload())
  }

  const isCompletedForm =
    user?.locations?.home?.address &&
    user?.locations?.home?.latlng &&
    user?.locations?.home?.latlng[0] &&
    user?.locations?.home?.latlng[1] &&
    user?.userInfo?.name &&
    user?.userInfo?.phone
      ? true
      : false

  return (
    <>
      <div id="recaptcha-container"></div>
      <div
        className={`login-sidebar fixed top-0 ${
          direction === 'rtl' ? 'left-0' : 'right-0'
        } h-full overflow-y-scroll justify-between bg-white transition-all duration-500 z-20 sm:px-20 px-5 py-5 w-full sm:py-10 flex flex-col sm:w-[500px] ${
          isLoginSidebarOpen
            ? direction === 'rtl'
              ? '-translate-x-0'
              : 'translate-x-0'
            : direction === 'rtl'
            ? '-translate-x-full'
            : 'translate-x-full'
        }`}>
        <div>
          <button className="text-3xl mb-5" onClick={handleCloseSidebar}>
            <IoIosCloseCircleOutline />
          </button>
          <div className="relative left-0">
            {!user?.userInfo ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-color-1 text-3xl font-ProximaNovaMed">
                      {status === 'SIGNUP' ? t('Signup') : t('Login')}
                    </h2>
                    <p className="text-[#686b78] mt-2 font-ProximaNovaMed text-sm pr-5">
                      {/*
                          status === "SIGNUP" ?
                            <span>Or <span onMouseUp={() => setStatus("LOGIN")} className='text-bold text-indigo-500 cursor-pointer'>Login</span></span>
                            :
                            <span>Or <span onMouseUp={() => setStatus("SIGNUP")} className='text-bold text-indigo-500 cursor-pointer'>Signup a new account</span></span>
                        */}
                    </p>
                    <p className="font-ProximaNovaThin mt-1">
                      {t('and')}{' '}
                      <span className="text-color-2 font-ProximaNovaMed">
                        {t('Enjoy your time')}
                      </span>
                    </p>
                  </div>
                  <div>
                    <img
                      className="h-24"
                      src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_147,h_140/Image-login_btpq7r"
                      alt="img"
                    />
                  </div>
                </div>

                {/*<SigninPhoneProvider status={status} setStatus={setStatus} />*/}
                <SignupGoogleProvider />
              </>
            ) : (
              <>
                <button
                  className={`settings-btn relative w-full py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer mt-5 mb-5 ${
                    isCompletedForm ? 'bg-color-11' : 'bg-red-500'
                  }`}
                  onClick={() => setExpandUserInfo(expandUserInfo => !expandUserInfo)}>
                  <span className="text-xl absolute left-[20px] top-[50%] -translate-y-1/2">
                    {isCompletedForm ? <IoIosCheckmarkCircle /> : <IoIosCloseCircle />}
                  </span>{' '}
                  {t('Update User Information')}
                </button>
                { expandUserInfo && <UserForm /> }
              </>
            )}

            <div className="flex w-full font-ProximaNovaSemiBold cursor-pointer mt-5 border border-color-11">
              <button
                className={`w-full p-4 ${lng === 'en' && 'bg-color-11 text-white order-1'}`}
                onClick={() => changeLanguage('en')}>
                English
              </button>
              <button
                className={`w-full p-4 ${lng === 'ar' && 'bg-color-11 text-white'}`}
                onClick={() => changeLanguage('ar')}>
                العربية
              </button>
            </div>
          </div>
        </div>

        {user?.userInfo && (
          <button
            onClick={handleLogout}
            className="w-full py-4 uppercase text-base text-red-500 font-ProximaNovaSemiBold cursor-pointer mt-10 border border-red-500">
            {t('Logout')}
          </button>
        )}
      </div>

      <div
        className={`login-sidebar-overlay ${
          isLoginSidebarOpen ? 'fixed' : 'hidden'
        } z-10 top-0 left-0 right-0 bottom-0 bg-color-1 opacity-[0.7] overflow-hidden`}></div>
    </>
  )
}

export default LoginSidebar
