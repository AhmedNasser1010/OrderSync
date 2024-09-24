import { useTranslation } from 'react-i18next'


function StatusBadge({ status }) {
  const { t } = useTranslation()
  return (
    <span className={`mx-2 px-3 py-1 rounded-full text-xs font-medium ${status === 'active' ? 'bg-green-100 text-green-800 hidden' : status === 'busy' ? 'bg-yellow-100 text-yellow-800' : status === 'pause' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>{t(status)}</span>
  )
}

export default StatusBadge