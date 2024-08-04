import { useTranslation } from 'react-i18next'
import Info from './Info'

function OrderInfo({ deliveryFees }) {
	const { t } = useTranslation()

	return (

		<div className='order-info text-sm'>
			<div className='divider !my-3'></div>
			<div className='flex flex-col gap-2 px-2'>

				<Info label={t('Delivery Fees')}>
					<span className='egp text-sm'>{ deliveryFees }</span>
				</Info>

			</div>
			<div className='divider !my-3'></div>
		</div>

	)
}

export default OrderInfo