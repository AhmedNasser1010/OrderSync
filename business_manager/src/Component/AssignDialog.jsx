import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import Dialog from '@mui/material/Dialog'

import DialogTitle from './DialogTitle'

import DB_UPDATE_NESTED_VALUE from '../functions/DB_UPDATE_NESTED_VALUE'


const DialogParent = styled(Dialog)``
const StaffBox = styled.div`
	font-family: Roboto;
	padding: 20px;
	display: flex;
	gap: 1rem;
	flex-wrap: wrap;
	max-width: 700px;
	width: 560px;
`
const Member = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;
	width: calc(50% - 28px);
	padding: 10px;
	background-color: #eee;
	border-radius: 10px;
	cursor: pointer;
`
const MemberFirst = styled.div``
const MemberMiddle = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
	font-size: 14px;
	width: 100%;
`
const MemberLast = styled.div``
const Img = styled.img`
	width: 80px;
`
const Span = styled.span``
const Dot = styled.span`
	display: block;
	width: 10px;
	height: 10px;
	background-color: ${({ $online }) => $online ? 'green' : 'red'};
	border-radius: 50px;
	margin-right: 10px;
`

function AssignDialog({ isOpen, handleOpenClose, currentOrder }) {
	const orders = useSelector(state => state.orders.open)
	const staff = useSelector(state => state.staff)
	const accessToken = useSelector(state => state.business.accessToken)

	const readyToAssignStaff = useMemo(() => {
		return staff.filter(member => {
			if (currentOrder.status === 'RECEIVED' || currentOrder.status === 'ON_GOING') {
				return member.userInfo.role === 'ORDER_CAPTAIN'
			} else if (currentOrder.status === 'IN_DELIVERY') {
				return member.userInfo.role === 'DELIVERY_CAPTAIN'
			}
		})
	}, [staff, currentOrder])

	const handleAssignMember = (uid) => {

		const convertAssign = (status) => {
			return [
				...orders.map(order => {
					if (order.id === currentOrder.id) {
						return {
							...order,
							assign: { to: uid, status: status }
						}
					}
					return order
				})
			]
		}

		const trigger = async (data) => {
			DB_UPDATE_NESTED_VALUE('orders', accessToken, `open`, data)
			.then(res => res)
			.catch(err => err)
		}

		if (currentOrder.status === 'ON_GOING' && currentOrder.assign.status === 'pickup') {
			trigger(convertAssign('on-going'))
		} else if (currentOrder.status === 'IN_DELIVERY' && currentOrder.assign.status === 'on-going') {
			trigger(convertAssign('on-delivery'))
		}
	}

	return (

		<DialogParent open={isOpen}>
			<DialogTitle
				title='Assign'
				bodyTitle='Change current order assign'
				closeCallback={handleOpenClose}
			/>
			<StaffBox>
				{
					readyToAssignStaff?.map(member => (
						<Member onMouseUp={() => handleAssignMember(member.userInfo.uid)}>
							<MemberFirst>
								<Img src={member.userInfo.avatar || 'https://i.imgur.com/0vpif1n.png'} />
							</MemberFirst>
							<MemberMiddle>
								<Span>{ member.userInfo.name }</Span>
								<Span>{ member.userInfo.phone }</Span>
							</MemberMiddle>
							<MemberLast>
								<Dot $online={member.online || true} />
							</MemberLast>
						</Member>
					))
				}
			</StaffBox>
		</DialogParent>

	)
}

export default AssignDialog