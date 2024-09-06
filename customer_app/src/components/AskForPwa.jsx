import { useEffect, useState } from "react"
import useAskForPwa from '../hooks/useAskForPwa'
import { useTranslation } from "react-i18next"
import { MdInstallMobile } from "react-icons/md";

const AskForPwa = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { askForPwa } = useAskForPwa()
  const { t } = useTranslation()

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
    }
  }, [])

  const handleClick = () => {
    askForPwa()
    console.log('clicked')
  }

  return (
    <div
      className={`flex underline select-none align-center justify-center fixed w-full bottom-0 left-0 font-ProximaNovaBold text-center text-white p-1 bg-color-2 duration-300 translate-y-full opacity-0 ${isOpen ? '-translate-y-0 opacity-100' : 'translate-y-full opacity-0'} delay-[5000ms] cursor-pointer`}
      onMouseUp={handleClick}
      >
        <MdInstallMobile/>
        {t('Add to Home Screen!')}
    </div>
  )
}

export default AskForPwa
