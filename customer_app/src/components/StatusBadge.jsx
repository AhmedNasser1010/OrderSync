import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'


function StatusBadge({ availability, isBusy, temporaryPause }) {
  const { t } = useTranslation()
  const [status, setStatus] = useState('Online')

  useEffect(() => {
    if (availability) {
      if (temporaryPause) {
        setStatus('Paused')
        return
      }
      if (isBusy) {
        setStatus('Busy')
        return
      }
      setStatus('Online')
      return
    } else {
      setStatus('Offline')
      return
    }
  }, [availability, isBusy, temporaryPause])


  return (
    <span className={`mx-2 px-3 py-1 rounded-full text-xs font-medium ${status === 'Online' ? 'bg-green-100 text-green-800 hidden' : status === 'Busy' ? 'bg-yellow-100 text-yellow-800' : status === 'Paused' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>{t(status)}</span>
  )
}

export default StatusBadge