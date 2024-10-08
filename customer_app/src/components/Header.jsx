import { useEffect } from 'react'
import { Link } from "react-router-dom"
import { IoIosArrowDown } from "react-icons/io"
import { CiLocationOn } from "react-icons/ci"
import { MdDeliveryDining } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"
import { toggleLocationSidebar, toggleLoginSidebar, toggleOrderSidebar } from "../rtk/slices/toggleSlice"
import { LOGO_URL } from "../utils/constants"
import { useTranslation } from 'react-i18next'
import toast from "react-hot-toast"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from '../config/firebase'

import { initUser } from '../rtk/slices/userSlice'
import { initServices } from '../rtk/slices/servicesSlice'
import AUTH_ON_CHANGE from '../utils/AUTH_ON_CHANGE'
import DB_GET_DOC from '../utils/DB_GET_DOC'
import useLanguageDirection from '../hooks/useLanguageDirection'

const Header = () => {
  useLanguageDirection()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const cartItems = useSelector(state => state.cart.items)
  const user = useSelector(state => state.user)

  const handleLocationSidebar = () => {
    dispatch(toggleLocationSidebar())
    document.body.classList.add("overflow-hidden")
  }

  const handleOrdderSidebar = () => {
    dispatch(toggleOrderSidebar())
    document.body.classList.add("overflow-hidden")
  }

  const handleLoginSidebar = () => {
    dispatch(toggleLoginSidebar())
    document.body.classList.add("overflow-hidden")
  }

  const truncateStr = (str) => {
    return str.length > 35 ? str.slice(0, 35) + "..." : str
  }

  useEffect(() => {
    let unsub = null

    AUTH_ON_CHANGE()
    .then(uid => {
      if (uid) {

        const userRef = doc(db, 'customers', uid)

        unsub = onSnapshot(userRef, doc => {
          window.read += 1
          console.log('Read: ', window.read)

          if (doc.exists()) {
            dispatch(initUser(doc.data()))
          }
        })
      }
    })

    return () => {
      unsub && unsub()
    }
  }, [])

   useEffect(() => {
    if (user?.userInfo?.uid && user?.userInfo?.phone) {
      toast(t('Great! After successfully logging in, please update your contact information to be able to place orders.'), {
        icon: '👏',
        className: "font-ProximaNovaSemiBold",
        position: "top-center",
        duration: 4000
      })

      dispatch(toggleLoginSidebar())
    }
  }, [])


  useEffect(() => {
    // Fetching delivery fees from firestore is pused right now for security rules issues
    // const partnerID = import.meta.env.VITE_PARTNER_ID
    // if (user?.userInfo?.uid) {
    //   DB_GET_DOC('users', partnerID)
    //   .then(partner => {
    //     dispatch(initServices(partner?.services))
    //   })
    // }
    if (user?.userInfo?.uid) {
      dispatch(initServices({ deliveryFees: 3.5 }))
    }
  }, [user?.userInfo?.uid])

  return (
    <>
      <header className="shadow-md w-full fixed left-0 top-0 right-0 h-20 z-10 md:px-5 text-color-1 bg-white px-3">
        <div className="flex justify-between items-center h-full container mx-auto">
          <div className="flex items-center md:gap-5 gap-2">
            <Link to=".">
              <img
                src={LOGO_URL}
                alt="logo"
                className="md:h-14 h-12"
              />
            </Link>
            <Link to=".">
              <h1
                className="font-Beiruti md:text-3xl text-2xl"
              >
                {t("Zack's Eats")}
              </h1>
            </Link>
            <button onClick={handleLocationSidebar} type='button' className='md:flex items-center gap-2 group sidebar-btn hidden'>
              {
                !user?.locations?.city &&
                  <span className='custom-underline relative font-ProximaNovaBold text-sm group-hover:text-color-2'>
                    {t('Select')}
                  </span>
              }
              {
                user?.locations?.city ? <span className='block text-[#686b78] text-sm font-ProximaNovaThin group-hover:text-color-5'>{t(user?.locations?.city)}</span> : <></>
              }
              <span className='text-color-2 text-xl'>
                <IoIosArrowDown />
              </span>
            </button>
            <button
              onClick={handleLocationSidebar}
              className="md:hidden flex gap-1 items-center text-color-1"
            >
              <div className="text-xl">
                <CiLocationOn />
              </div>
              <span className="text-sm font-ProximaNovaThin">{t('Location')}</span>
            </button>
          </div>

          <ul className="font-ProximaNovaMed flex items-center md:gap-5 gap-4">
            {
              user?.trackedOrder?.id &&
              <MdDeliveryDining
                className='text-color-11 text-3xl cursor-pointer'
                onMouseUp={handleOrdderSidebar}
              />
            }
            <button
              onClick={handleLoginSidebar}
              className="flex items-center gap-2 group hover:text-color-2"
            >
              <div>
                <svg
                  className="group-hover:fill-color-2"
                  viewBox="6 0 12 24"
                  height="19"
                  width="18"
                  fill="#686b78"
                >
                  <path d="M11.9923172,11.2463768 C8.81761115,11.2463768 6.24400341,8.72878961 6.24400341,5.62318841 C6.24400341,2.5175872 8.81761115,0 11.9923172,0 C15.1670232,0 17.740631,2.5175872 17.740631,5.62318841 C17.740631,8.72878961 15.1670232,11.2463768 11.9923172,11.2463768 Z M11.9923172,9.27536232 C14.0542397,9.27536232 15.7257581,7.64022836 15.7257581,5.62318841 C15.7257581,3.60614845 14.0542397,1.97101449 11.9923172,1.97101449 C9.93039471,1.97101449 8.25887628,3.60614845 8.25887628,5.62318841 C8.25887628,7.64022836 9.93039471,9.27536232 11.9923172,9.27536232 Z M24,24 L0,24 L1.21786143,19.7101449 L2.38352552,15.6939891 C2.85911209,14.0398226 4.59284263,12.7536232 6.3530098,12.7536232 L17.6316246,12.7536232 C19.3874139,12.7536232 21.1256928,14.0404157 21.6011089,15.6939891 L22.9903494,20.5259906 C23.0204168,20.63057 23.0450458,20.7352884 23.0641579,20.8398867 L24,24 Z M21.1127477,21.3339312 L21.0851024,21.2122487 C21.0772161,21.1630075 21.0658093,21.1120821 21.0507301,21.0596341 L19.6614896,16.2276325 C19.4305871,15.4245164 18.4851476,14.7246377 17.6316246,14.7246377 L6.3530098,14.7246377 C5.4959645,14.7246377 4.55444948,15.4231177 4.32314478,16.2276325 L2.75521062,21.6811594 L2.65068631,22.0289855 L21.3185825,22.0289855 L21.1127477,21.3339312 Z"></path>
                </svg>
              </div>
              {!user?.userInfo ? (
                <span className="md:inline hidden">{t('Sign In')}</span>
              ) : (
                <span className="md:inline hidden">{user?.userInfo?.name}</span>
              )}
            </button>
            <Link
              to="/cart"
              className="flex items-center gap-2 group hover:text-color-2"
            >
              <div className="relative overflow-hidden font-ProximaNovaSemiBold">
                {cartItems.length > 0 ? (
                  <>
                    <svg
                      className="stroke-color-11 fill-color-11 stroke-2 group-hover:stroke-color-11"
                      viewBox="-1 0 37 32"
                      height="20"
                      width="20"
                    >
                      <path d="M4.438 0l-2.598 5.11-1.84 26.124h34.909l-1.906-26.124-2.597-5.11z"></path>
                    </svg>
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-white">
                      {cartItems.length}
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      className="stroke-color-1 fill-white stroke-2 group-hover:stroke-color-2"
                      viewBox="-1 0 37 32"
                      height="20"
                      width="20"
                    >
                      <path d="M4.438 0l-2.598 5.11-1.84 26.124h34.909l-1.906-26.124-2.597-5.11z"></path>
                    </svg>
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm">
                      {cartItems.length}
                    </span>
                  </>
                )}
              </div>
              <span>{t('Cart')}</span>
            </Link>
          </ul>
        </div>
      </header>
    </>
  )
}

export default Header