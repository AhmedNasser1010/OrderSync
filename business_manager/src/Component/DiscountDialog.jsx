import { useMemo, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import * as Yup from 'yup'
import { Formik, Form, Field } from 'formik';
import MuiTextField from "./MuiTextField"
import generateDiscountCode from '../functions/generateDiscountCode'
import { addMenu } from '../rtk/slices/menuSlice'
import { setDiscountDialog } from '../rtk/slices/conditionalValuesSlice'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import _addDoc from '../functions/_addDoc'
import { IoIosAdd } from "react-icons/io"
import generateDiscountObj from '../functions/generateDiscountObj'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'

const options = ["P", "FIXED"]
const optTitles = {
	P: 'Percentage',
	FIXED: 'Fixed Number'
}
const conditionsOptions = [
	'FIRSTBUY',
	'TOTALSPENT',
	'TOTALITEMS',
	'TOTALORDERS'
]
const conditionsOptTitles = {
	FIRSTBUY: 'First buy',
	TOTALSPENT: 'Total user spent',
	TOTALITEMS: 'Total user buy items',
	TOTALORDERS: 'Total placed orders'
}

// Yup validation schema
const validationSchema = Yup.object().shape({
  value: Yup.number()
  	.typeError('Discount value must be a number')
    .required('Discount value is required')
    .min(1, 'Discount value must be one or a positive number'),
  type: Yup.string()
    .required('Discount type is required')
    .oneOf(options, 'Invalid discount type'),
  msg: Yup.string()
    .required('Message is required')
    .max(255, 'Message must be less than 255 characters'),
  conditions: Yup.array().of(
    Yup.object().shape({
      value: Yup.number()
      	.typeError('Condition value must be a number')
        .required('Condition value is required')
        .min(0, 'Discount value must be zero or a positive number'),
      type: Yup.string()
        .required('Condition type is required')
        .oneOf(conditionsOptions, 'Invalid condition type'),
    })
  )
})

function DiscountDialog({ id, type }) {
	const dispatch = useDispatch()
	const menu = useSelector(state => state.menu)
	const accessToken = useSelector(state => state.business.accessToken)
	const [withConditions, setWithConditions] = useState(false)
	const [initialState, setInitialState] = useState({
		value: '',
		type: options[0],
		msg: '',
		conditions: [{
			value: '',
			type: conditionsOptions[1]
		}]
	})

	const item = useMemo(() => {
		return menu.items.filter(menuItem => {
			return id === menuItem.id
		})[0]
	}, [menu])

	const currentItemDiscount = item?.discount || null

	useEffect(() => {
		if (currentItemDiscount) {
			const hasConditions = currentItemDiscount.code.split('_')[1]
			if (hasConditions) {
				setWithConditions(true)
			}
			setInitialState(generateDiscountObj(currentItemDiscount))
		}
	}, [currentItemDiscount])

	const handleDiscountRemove = () => {
		if (currentItemDiscount) {
			const finalMenu = {
				...menu,
				items: menu.items.map(item => {
					if (item.id === id) {
						const { discount, ...rest } = item
      			return rest
					}
					return item
				})
			}

			_addDoc('menus', finalMenu, accessToken)
			.then(res => {
				if (res) {
					dispatch(addMenu(finalMenu))
					dispatch(setDiscountDialog({ id: '', isOpen: false, type: '' }))
				} else {
					console.log('Error cannot update you menu')
				}
			})
		}
	}

	const handleSubmit = (values, setErrors) => {
		if (values.type === 'P' && values.value > 100) {
			setErrors({
				value: 'Discount value cannot exceed 100%'
			})
			return
		}

		const convertedValues = generateDiscountCode(values, withConditions)

		const currentDiscountJSON = JSON.stringify(currentItemDiscount)
		const newDiscountJSON = JSON.stringify(convertedValues)

		if (currentDiscountJSON !== newDiscountJSON) {

			const finalMenu = {
				...menu,
				items: menu.items.map(item => {
					if (item.id === id) {
						return {
							...item,
							discount: convertedValues
						}
					}
					return item
				})
			}

			_addDoc('menus', finalMenu, accessToken)
			.then(res => {
				if (res) {
					dispatch(addMenu(finalMenu))
					dispatch(setDiscountDialog({ id: '', isOpen: false, type: '' }))
				} else {
					console.log('Error cannot update you menu')
				}
			})
		}
	}

	return (
		<Formik
			enableReinitialize
			initialValues={initialState}
			// initialValues={currentItemDiscount ? { ...generateDiscountObj(currentItemDiscount), conditions: [{ value: '', type: conditionsOptions[1] }]} : {value: '', type: options[0], msg: '', conditions: [{value: '', type: conditionsOptions[1]}]}}
			// initialValues={() => {
			// 	console.log(currentItemDiscount)
			// 	if (currentItemDiscount) {
			// 		const values = generateDiscountObj(currentItemDiscount)
			// 		return {
			// 			value: values.value || '',
			// 			type: values.type || options[0],
			// 			msg: values.msg || '',
			// 			conditions: [{
			// 				value: values.conditions[0].value || '',
			// 				type: values.conditions[0].type || conditionsOptions[1]
			// 			}]
			// 		}
			// 	}
			// }}
			validationSchema={validationSchema}
			onSubmit={(values, { setErrors }) => handleSubmit(values, setErrors)}
		>
			{({ errors, touched, values, setFieldValue }) => (
				<Form>
					<Stack direction="column" spacing={2} style={{ minWidth: '550px', padding: '20px' }}>
						<Stack direction="column" spacing={2}>
							<Stack direction="row" spacing={2}>
								<Field
									component={MuiTextField}
									error={errors.value && touched.value && true}
									helperText={errors.value && touched.value && errors.value}
									name='value'
									label="Discount Value"
									fullWidth
								/>
								<Select
									sx={{ minWidth: '200px' }}
									error={errors.type && touched.type && true}
									helperText={errors.type && touched.type && errors.type}
									name='type'
									label='Discount Type'
									value={values.type}
									onChange={(e) => setFieldValue('type', e.target.value)}
								>
									{options.map(opt => (
										<MenuItem key={opt} value={opt}>{optTitles[opt]}</MenuItem>
									))}
								</Select>
							</Stack>
							{
								withConditions &&
								<Stack
									direction="row"
									spacing={2}
									sx={{
										paddingLeft: '20px',
										position: 'relative'
									}}
								>
									<span
										className='vertical-line'
										style={{
									    width: '1px',
    									height: '75%',
    									position: 'absolute',
    									backgroundColor: '#c4c4c4',
    									left: '0',
    									top: '0',
    									transform: 'translate(10px, -16px)'
										}}
									></span>
									<span
										className='horizontal-line'
										style={{
											width: '25px',
    									height: '1px',
    									backgroundColor: '#c4c4c4',
    									position: 'absolute',
    									left: '0px',
    									top: '50%',
    									transform: 'translate(-5px, -2px)'
										}}
									></span>
									<Field
										fullWidth
										component={MuiTextField}
										error={errors?.conditions && errors.conditions[0]?.value && touched?.conditions && touched.conditions[0].value && true}
										helperText={errors?.conditions && errors.conditions[0].value && touched?.conditions && touched.conditions[0].value && errors.conditions[0].value}
										name='conditions[0].value'
										label="Condition Value"
										disabled={values?.conditions?.length && values.conditions[0].type === 'FIRSTBUY'}
									/>
									<Select
										sx={{ minWidth: '200px' }}
										error={errors?.conditions && errors.conditions[0].type && touched?.conditions && touched.conditions[0].type && true}
										helperText={errors?.conditions && errors.conditions[0].type && touched?.conditions && touched.conditions[0].type && errors.conditions[0].type}
										name='conditions[0].type'
										label='Condition Type'
										value={values?.conditions?.length && values.conditions[0].type}
										onChange={(e) => setFieldValue('conditions[0].type', e.target.value)}
									>
										{conditionsOptions.map(opt => (
											<MenuItem key={opt} value={opt}>{conditionsOptTitles[opt]}</MenuItem>
										))}
									</Select>
								</Stack>
							}
							<Field
								component={MuiTextField}
								error={errors.msg && touched.msg && true}
								helperText={errors.msg && touched.msg && errors.msg}
								name='msg'
								label="Message"
							/>
						</Stack>
						<FormControlLabel
							label='Add Conditions'
							control={<Checkbox checked={withConditions} onChange={() => setWithConditions(withConditions => !withConditions)} />}
						/>
						<Stack direction="row" spacing={2} justifyContent="flex-end">
							<Button onMouseUp={handleDiscountRemove} color='error' variant="text" startIcon={<DeleteOutlineIcon />}>Remove</Button>
							<Button variant="text" type="submit" startIcon={<LocalOfferIcon />}>Save</Button>
						</Stack>
					</Stack>
				</Form>
			)}
		</Formik>
	);
}

export default DiscountDialog;
