import { useState, useEffect } from 'react'

import { IoIosCloseCircleOutline } from 'react-icons/io'
import { IoIosArrowDown } from "react-icons/io"
import { IoIosCloseCircle } from "react-icons/io"
import { IoIosCheckmarkCircle } from "react-icons/io"

import { useDispatch, useSelector } from 'react-redux'
import { toggleLoginSidebar } from '../../utils/toggleSlice.js'
import { addUser, removeUser } from '../../utils/userAuthSlice.js'
import { clearCart } from "../../utils/cartSlice.js"
import AUTH_SIGNOUT from '../../utils/AUTH_SIGNOUT'

import SigninPhoneProvider from './SigninPhoneProvider'
import UserInfoForm from './UserInfoForm'
import UserAddress from './UserAddress'

const LoginSidebar = () => {
  const dispatch = useDispatch()
  const isLoginSidebarOpen = useSelector(state => state.toggle.isLoginSidebarOpen)
  const user = useSelector(state => state.user)
  const [status, setStatus] = useState('LOGIN')
  const [expandUserInfo, setExpandUserInfo] = useState(false)
  const [expandUserAddress, setExpandUserAddress] = useState(false)

  const handleCloseSidebar = () => {
    dispatch(toggleLoginSidebar())
    document.body.classList.remove("overflow-hidden")
  }

  const handleLogout = () => {
    AUTH_SIGNOUT().then(res => res && window.location.reload())
  }

  return (
    <>
      <div id='recaptcha-container'></div>
      <div className={`login-sidebar fixed top-0 right-0 h-full overflow-y-scroll justify-between bg-white transition-all duration-500 z-20 sm:px-20 px-5 py-5 w-full sm:py-10 flex flex-col sm:w-[500px] ${isLoginSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div>
          <button className='text-3xl mb-5' onClick={handleCloseSidebar}>
            <IoIosCloseCircleOutline />
          </button>
          <div className="relative left-0">
            {
              !user?.userInfo ?
                <>
                  <div className='flex items-center justify-between mb-5'>
                    <div>
                      <h2 className='text-color-1 text-3xl font-ProximaNovaMed'>{ status === 'SIGNUP' ? 'Signup' : 'Login' }</h2>
                      <p className='text-[#686b78] mt-2 font-ProximaNovaMed text-sm pr-5'>
                        {
                          status === "SIGNUP" ?
                            <span>Or <span onMouseUp={() => setStatus("LOGIN")} className='text-bold text-indigo-500 cursor-pointer'>Login</span></span>
                            :
                            <span>Or <span onMouseUp={() => setStatus("SIGNUP")} className='text-bold text-indigo-500 cursor-pointer'>Signup a new account</span></span>
                        }
                      </p>
                      <p className='font-ProximaNovaThin mt-1'>and <span className='text-color-2 font-ProximaNovaMed'>Enjoy your time</span></p>
                    </div>
                    <div>
                      <img className='h-24' src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_147,h_140/Image-login_btpq7r" alt="img" />
                    </div>
                  </div>

                  <SigninPhoneProvider status={status} setStatus={setStatus} />
                </>
                :
                <>
                  {user?.userInfo && <h2 className='font-ProximaNovaSemiBold text-2xl flex items-center'>Welcome {user?.userInfo?.name} </h2>}
                  <button onClick={() => setExpandUserInfo(expandUserInfo => !expandUserInfo)} className={`settings-btn relative w-full py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer mt-5 mb-5 ${user?.userInfo?.name ? 'bg-color-11' : 'bg-red-500'}`}><span className='text-xl absolute left-[20px] top-[50%] -translate-y-1/2'>{ user?.userInfo?.name ? <IoIosCheckmarkCircle /> : <IoIosCloseCircle /> }</span> Update User Information</button>
                  { expandUserInfo && <UserInfoForm setExpandUserInfo={setExpandUserInfo} />}
                  <button onClick={() => setExpandUserAddress(expandUserAddress => !expandUserAddress)} className={`settings-btn relative w-full py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer mt-5 mb-5 ${user?.locations?.home?.address && user?.locations?.home?.latlng[0] && user?.locations?.home?.latlng[0] !== 29.620106778124843 && user?.locations?.home?.latlng[1] !== 31.255811811669496 ? 'bg-color-11' : 'bg-red-500'}`}><span className='text-xl absolute left-[20px] top-[50%] -translate-y-1/2'>{ user?.locations?.home?.address && user?.locations?.home?.latlng[0] && user?.locations?.home?.latlng[0] !== 29.620106778124843 && user?.locations?.home?.latlng[1] !== 31.255811811669496 ? <IoIosCheckmarkCircle /> : <IoIosCloseCircle />}</span> Update User Address</button>
                  { expandUserAddress && <UserAddress setExpandUserAddress={setExpandUserAddress} />}
                  <div>
                    <p className='text-[#686b78] mt-2 font-ProximaNovaMed text-sm pr-5'>Thank you for your time and patience. Come back soon !</p>
                  </div>
                </>
            }

          </div>
        </div>

        { user?.userInfo &&  <button onClick={handleLogout} className='w-full py-4 uppercase text-base text-red-500 font-ProximaNovaSemiBold cursor-pointer mt-10 border border-red-500'>Logout</button>}
      </div>

      <div className={`login-sidebar-overlay ${isLoginSidebarOpen ? "fixed" : "hidden"} z-10 top-0 left-0 right-0 bottom-0 bg-color-1 opacity-[0.7] overflow-hidden`}></div>

    </>
  )
}

export default LoginSidebar