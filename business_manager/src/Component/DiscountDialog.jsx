import { useRef, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import * as Yup from 'yup'
import { Formik, Form, Field } from 'formik';
import MuiTextField from "./MuiTextField"
import DiscountCodeGenerator from '../functions/DiscountCodeGenerator'
import { addMenu } from '../rtk/slices/menuSlice'
import { setDiscountDialog } from '../rtk/slices/conditionalValuesSlice'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import _addDoc from '../functions/_addDoc'

// Yup validation schema
const validationSchema = Yup.object().shape({
	value: Yup.number()
		.required('Discount value is required')
		.min(1, 'Discount value must be at least 1'),
	type: Yup.string()
		.required('Discount type is required')
		.oneOf(['P', 'FIXED'], 'Invalid discount type'),
	msg: Yup.string()
		.required('Message is required')
		.max(255, 'Message must be less than 255 characters')
});

function DiscountDialog({ id, type }) {
	const dispatch = useDispatch()
	const options = useRef(["P", "FIXED"])
	const menu = useSelector(state => state.menu)
	const accessToken = useSelector(state => state.business.accessToken)

	const item = useMemo(() => {
		return menu.items.filter(menuItem => {
			return id === menuItem.id
		})[0]
	}, [menu])

	const currentItemDiscount = item?.discount || null

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

	return (
		<Formik
			enableReinitialize
			initialValues={{
				value: Number(currentItemDiscount?.code.split('-')[1]) || "",
				type: currentItemDiscount?.code.split('-')[0] || options.current[0],
				msg: currentItemDiscount?.message || ""
			}}
			validationSchema={validationSchema}
			onSubmit={(values, { setErrors }) => {
				if (values.type === 'P' && values.value > 100) {
					setErrors({
						value: 'Discount value cannot exceed 100%'
					})
					return
				}

				const convertedValues = DiscountCodeGenerator(values)

				const currentDiscountJSON = JSON.stringify({ discount: { code: currentItemDiscount?.code, message: currentItemDiscount?.message } })
				const newDiscountJSON = JSON.stringify(convertedValues)

				if (currentDiscountJSON !== newDiscountJSON) {

					const finalMenu = {
						...menu,
						items: menu.items.map(item => {
							if (item.id === id) {
								return {
									...item,
									discount: convertedValues.discount
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
			}}
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
									error={errors.type && touched.type && true}
									helperText={errors.type && touched.type && errors.type}
									name='type'
									label='Type'
									value={values.type}
									onChange={(e) => setFieldValue('type', e.target.value)}
								>
									{options.current.map(opt => (
										<MenuItem key={opt} value={opt}>{opt}</MenuItem>
									))}
								</Select>
							</Stack>
							<Field
								component={MuiTextField}
								error={errors.msg && touched.msg && true}
								helperText={errors.msg && touched.msg && errors.msg}
								name='msg'
								label="Message"
							/>
						</Stack>
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
