import { useTranslation } from 'react-i18next'
import Info from './Info'

function OrderInfo({ deliveryFees, orderNumber }) {
	const { t } = useTranslation()

	return (

		<div className='order-info text-sm'>
			<hr className='border-1 border-dashed border-b-[#d3d3d3] my-4'></hr>
			<div className='flex flex-col gap-2 px-2'>

				<Info label={t('Delivery Fees')}>
					<span className='egp text-sm'>{ deliveryFees }</span>
				</Info>

				{orderNumber &&
					<Info label={t('Invoice No')}>
						<span>#{orderNumber}</span>
					</Info>
				}

			</div>
			<hr className='border-1 border-dashed border-b-[#d3d3d3] my-4'></hr>
		</div>

	)
}

export default OrderInfo