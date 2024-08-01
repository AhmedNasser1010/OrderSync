import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { setSettingsSaveToCloudeStatus } from './rtk/slices/conditionalValuesSlice'
import { initBusiness } from './rtk/slices/businessSlice'
import _addDoc from './functions/_addDoc'

import Button from '@mui/material/Button';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutorenewSharpIcon from '@mui/icons-material/AutorenewSharp';
import ErrorOutlineSharpIcon from '@mui/icons-material/ErrorOutlineSharp';
import Switch from '@mui/material/Switch';

import useLogout from './hooks/useLogout'

import ShopControl from './Component/ShopControl'
import WidgetTitle from './Component/WidgetTitle'
import WidgetOption from './Component/WidgetOption'

const Page = styled.section`
	padding: 40px 10px;
`
const PageTitle = styled.h1`
	font-weight: bolder;
	font-size: 2rem;
	position: relative;
	width: fit-content;
	margin-bottom: 30px;

	&::before {
		content: '';
		position: absolute;
		bottom: -5px;
		left: 0;
		width: 100%;
		height: 4px;
		background-color: #ebebeb;
	}
	&::after {
		content: '';
		position: absolute;
		bottom: -5px;
		left: 0;
		width: 30%;
		height: 4px;
		background-color: #454545;
	}
`
const Widgets = styled.div`
	display: flex;
	gap: 1rem;
	flex-wrap: wrap;
`
const Widget = styled.div`
	background-color: white;
	border-radius: 8px;
	padding: 20px;
	width: 100%;
`
// width: calc(50% - 40px - 0.5rem);

const WidgetOptionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

	& div h4 {
		margin-bottom: 5px;
	}
	& div p {
		font-size: 14px;
		color: #00000099;
	}
	& div button.btn {
		all: unset;
		background-color: #EF4444;
    color: white;
    padding: 5px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: small;
	}
`

function Settings() {
	const logout = useLogout()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const accessToken = useSelector(state => state.user.accessToken)
	const business = useSelector(state => state.business)
	const businessSettings = useSelector(state => state.business?.settings)
	const settingsSaveToCloude = useSelector(state => state.conditionalValues.settingsSaveToCloude);
	const [saveBtnStyles, setSaveBtnStyles] = useState({})
	const [businessValuesSnapshot, setBusinessValuesSnapshot] = useState(business)
	const [siteControl, setSiteControl] = useState({})
	const [orderManagement, setOrderManagement] = useState(business.settings.orderManagement)

	const handleSetSiteControl = data => setSiteControl(data)

	// initail values
	useEffect(() => {
		setSiteControl(businessSettings?.siteControl)
		setBusinessValuesSnapshot(business)
	}, [businessSettings, business])

	useEffect(() => {
		handleSettingsBtnStart()
	}, [settingsSaveToCloude])

	useEffect(() => {
		let thereIsChanges = false

		if (business?.accessToken) {
			if (siteControl?.closeMsg) {
				if (JSON.stringify(siteControl) !== JSON.stringify(business.settings.siteControl)) thereIsChanges = true
			}
			if (orderManagement) {
				if (JSON.stringify(orderManagement) !== JSON.stringify(business.settings.orderManagement)) thereIsChanges = true
			}
		}

		thereIsChanges ? dispatch(setSettingsSaveToCloudeStatus('ON_CHANGES')) : dispatch(setSettingsSaveToCloudeStatus('ON_SAVED'))
	}, [business, siteControl, orderManagement])

	const handleSettingsBtnStart = () => {
		switch (settingsSaveToCloude) {
			case 'ON_SAVED':
				setSaveBtnStyles({
					label: 'saved',
					variant: 'contained',
					startIcon: <ChecklistRtlIcon />,
					disabled: true
				});
				break;
			case 'ON_CHANGES':
				setSaveBtnStyles({
					label: 'save to the cloud',
					variant: 'contained',
					startIcon: <CloudUploadIcon />,
					disabled: false
				});
				break;
			case 'ON_LOADING':
				setSaveBtnStyles({
					label: 'save to the cloud',
					variant: 'outlined',
					startIcon: <AutorenewSharpIcon sx={{ animation: 'spin 1s ease-in-out infinite' }} />,
					disabled: true,
				});
				break;
			case 'ON_ERROR':
				setSaveBtnStyles({
					label: 'error, try again',
					variant: 'contained',
					startIcon: <ErrorOutlineSharpIcon />,
					disabled: false,
					color: "error"
				});
				break;
		}
	}

	const handleSettingsBtnSave = () => {
		if (settingsSaveToCloude === 'ON_CHANGES' || 'ON_ERROR') {

			dispatch(setSettingsSaveToCloudeStatus('ON_LOADING'))

			const finalChanges = {
				...business,
				settings: {
					...business.settings,
					siteControl: siteControl,
					orderManagement: orderManagement
				}
			}

			_addDoc('businesses', finalChanges, accessToken).then(res => {
				if (res === true) {
					dispatch(setSettingsSaveToCloudeStatus('ON_SAVED'))
					dispatch(initBusiness(finalChanges))
				}
				res === undefined && dispatch(setSettingsSaveToCloudeStatus('ON_ERROR'))
			})

		}
	}

	const handleAssignChange = (e) => {
		const value = e.target.checked
		const name = e.target.name

		setOrderManagement(orderManagement => {return { ...orderManagement, assign: { ...orderManagement.assign, [name]: value} } })
	}

	return (

		<Page>
			<PageTitle>Settings</PageTitle>
			<Button
				sx={{ marginBottom: '10px', fontSize: '11px', transition: '0.3s' }}
				onMouseUp={handleSettingsBtnSave}
				{...saveBtnStyles}
			>
				{ saveBtnStyles?.label }
			</Button>
			<Widgets>
				<Widget>
					<ShopControl values={siteControl} handleSetSiteControl={handleSetSiteControl} />
				</Widget>
				<Widget>
					<WidgetTitle
						title="User"
						description="User settings and informations"
					/>
					<WidgetOptionTitle>
						<div>
							<h4>Logout</h4>
							<p>Logout from your account</p>
						</div>
						<div>
							<button onMouseUp={logout} className='btn'>LOGOUT</button>
						</div>
					</WidgetOptionTitle>
				</Widget>
				<Widget>
					<WidgetTitle
						title="Order Management"
						description="Order management settings"
					/>
					<WidgetOption
						title='Cooks assign'
						description='enable/disable assign feature for cooks'
					>
						<Switch onChange={handleAssignChange} name='forCooks' checked={orderManagement.assign.forCooks} />
					</WidgetOption>
					<WidgetOption
						title='Delivery assign'
						description='enable/disable assign feature for delivery workers'
					>
						<Switch onChange={handleAssignChange} name='forDeliveryWorkers' checked={orderManagement.assign.forDeliveryWorkers} />
					</WidgetOption>
					<WidgetOption
						title='Closed orders'
						description='Browse previous closed orders day by day'
					>
						<Button onMouseUp={() => navigate('/closed-orders')}>Browse</Button>
					</WidgetOption>
				</Widget>
			</Widgets>
		</Page>

	)
}

export default Settings