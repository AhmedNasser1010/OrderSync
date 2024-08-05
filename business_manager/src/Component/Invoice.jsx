import styled from 'styled-components'
import QRCode from 'qrcode.react'

import Divider from '@mui/material/Divider'

import formatDateFromTimestamp from '../functions/formatDateFromTimestamp'
import formatTimeFromTimestamp from '../functions/formatTimeFromTimestamp'

import '../style/printStyles.css'

const InvoiceWrapper = styled.div`
	max-width: 302.362px;
	min-height: 302.362px;
	font-family: monospace;
	white-space: pre-wrap;
`
const IconContainer = styled.div`
	padding: 20px 20px 40px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`
const Icon = styled.img`
	width: 100px;
	margin-bottom: 15px;
`
const Title = styled.h3`
	font-size: 2rem;
	text-align: center;
`
const Contact = styled.div`
	display: flex;
	flex-direction: column;
	padding: 40px 20px;
`
const ContactTitle = styled.h4`
	font-size: 1.2rem;
	margin-bottom: 20px;
`
const ContactSpan = styled.span`
	margin-bottom: 10px;
`
const MiddleSpan = styled.span`
	display: block;
	padding: 30px;
	width: calc(100% - 60px);
	text-align: center;
`
const QrWrapper = styled.div`
	padding: 0px 25px 25px;
	display: flex;
	align-items: center;
	justify-content: center;
`
const QrBg = styled.div`
	background-color: black;
	padding: 30px;
	display: flex;
	flex-direction: column;
	align-items: center;
	row-gap: 2rem;
`
const QrTitle = styled.h3`
	color: white;
	font-size: 1.2rem;
`

function Invoice({ business, orders }) {
	return (

		<>
			{
				orders.map(order => (
					<InvoiceWrapper key={order.orderData.id}>
						<IconContainer>
							<Icon src={business.business.icon} alt='logo' />
							<Title>{ business.business.name.toUpperCase() }</Title>
						</IconContainer>
						<Divider />
						<MiddleSpan style={{ fontWeight: 'bold', fontSize: '0.8rem', paddingBottom: '0' }}>
							Invoice No :
							<br />
							{ order.orderData.id }
						</MiddleSpan>
						<MiddleSpan style={{ paddingBottom: '0' }}>
							{ formatDateFromTimestamp(order.orderData.timestamp, '/') }
							<br />
							{ formatTimeFromTimestamp(order.orderData.timestamp) }
						</MiddleSpan>
						<Contact>
							<ContactTitle>Contact Info</ContactTitle>
							<ContactSpan>Address : { order.orderData.location.address }</ContactSpan>
							<ContactSpan>Phone   : { order.orderData.user.phone }</ContactSpan>
							<ContactSpan>Name    : { order.orderData.user.name }</ContactSpan>
						</Contact>
						<table
							style={{
								width: '100%',
								borderCollapse: 'collapse'
							}}
						>
							<thead
								style={{
									padding: '10px 10px 0 10px',
									backgroundColor: '#f3f3f3',
									fontWeight: 'bold'
								}}
							>
								<tr style={{ boxShadow: 'rgba(27, 31, 35, 0.15) 0px 1.8px 0px 0px' }}>
									<td style={{ width: '200px', padding: '10px 0 15px 10px' }}>Item</td>
									<td>Qty</td>
									<td>Price</td>
								</tr>
							</thead>
							<tbody style={{ padding: '10px' }}>
								{
									order.selectedMenuItems.map(item => (
										<tr style={{ boxShadow: 'rgba(27, 31, 35, 0.15) 0px 1.8px 0px 0px' }}>
											<td style={{ width: '200px', padding: '10px 0 15px 10px' }}>{ item.title }</td>
											<td>{ item.quantity }</td>
											<td>{ item.price }</td>
										</tr>
									))
								}
								<tr style={{ boxShadow: 'rgba(27, 31, 35, 0.15) 0px 1.8px 0px 0px' }}>
									<td style={{ width: '200px', padding: '10px 0 15px 10px' }}>Delivery Fees</td>
									<td></td>
									<td>{ order.orderData.deliveryFees }</td>
								</tr>
							</tbody>
							<tfoot
								style={{ fontSize: '1rem', fontWeight: 'bold', backgroundColor: '#f3f3f3' }}
							>
								<tr>
									<td style={{ width: '200px', padding: '10px 0 15px 10px' }}>Total</td>
									<td></td>
									<td>{ order.price.total+order.orderData.deliveryFees }LE</td>
								</tr>
								{
									order.price.totalDiscounted !== order.price.total &&
										<tr>
											<td style={{ width: '200px', padding: '10px 0 15px 10px' }}>Discounted To</td>
											<td></td>
											<td>{ order.price.totalDiscounted+order.orderData.deliveryFees }LE</td>
										</tr>
								}
							</tfoot>
						</table>
						<MiddleSpan>
							Thank you for your business  !
						</MiddleSpan>
						<QrWrapper>
							<QrBg>
								<QRCode
									style={{ outline: '12px solid white' }}
									value={
										`Order Now! https://merro.vercel.app\nInvoice No: ${order.orderData.id}*${business.accessToken}\n\nMade with <3 by Ahmed Nasser\n01117073085`
									}
								/>
								<QrTitle>SCAN ME</QrTitle>
							</QrBg>
						</QrWrapper>
						<div className='page-end'></div>
					</InvoiceWrapper>
				))
			}
		</>

	)
}

export default Invoice