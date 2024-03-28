import { useEffect } from 'react';
import { object, string, array, boolean } from 'yup';
import { Formik, Form, Field } from 'formik';
import fromKebabToTitle from '../functions/fromKebabToTitle';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, updateItem } from '../rtk/slices/menuSlice';
import { setSaveToCloudBtnStatus } from '../rtk/slices/conditionalValuesSlice';
import MuiTextField from "./MuiTextField.jsx";
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import PlaylistAddCircleIcon from '@mui/icons-material/PlaylistAddCircle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconedTitle from './IconedTitle';
import MenuItem from '@mui/material/MenuItem';

const validationSchema = object({
	title: string().required('Title is required'),
	description: string(),
	category: string().required('Category is required'),
	price: string().required('Price is required'),
	backgrounds: array().of(string()),
	visibility: boolean(),
})

const AddNewItemDialog = ({ dialogVisibility, handleDialogClose, initialValues }) => {
	const dispatch = useDispatch();
	const categories = useSelector(state => state.menu.categories);

	return (
		<Dialog open={dialogVisibility}>

			<DialogTitle>
				<IconedTitle
					icon={<PlaylistAddCircleIcon sx={{ fontSize: '26px', marginRight: '8px' }} />}
					title={`Add New Item To ${fromKebabToTitle(initialValues?.category)}`}
					variant='h3'
					fontSize='24px'
				/>
			</DialogTitle>
			
				<Formik
					initialValues={initialValues}
					validationSchema={validationSchema}
					onSubmit={values => {
						initialValues.title === '' ? dispatch(addItem(values)) : dispatch(updateItem({ initialValues, values }))
						dispatch(setSaveToCloudBtnStatus('ON_CHANGES'));
						handleDialogClose();
					}}
				>
					{({ isSubmitting, errors, touched, values }) => (

						<DialogContent>
							<Form>

								<Field
									error={errors.title && touched.title && true}
									helperText={errors.title && touched.title && errors.title}
									component={MuiTextField}
									name='title'
									label='Title'
									fullWidth
									sx={{ marginBottom: '10px' }}
								/>
								<Field
									error={errors.description && touched.description && true}
									helperText={errors.description && touched.description && errors.description}
									component={MuiTextField}
									name='description'
									label='Description'
									fullWidth
									sx={{ marginBottom: '10px' }}
								/>
								<Stack direction='row' spacing={1}>
									<Field
										error={errors.category && touched.category && true}
										helperText={errors.category && touched.category && errors.category}
										component={MuiTextField}
										name='category'
										label='Category'
										fullWidth
										select
									>
										{categories.map(category => (

											<MenuItem key={category.title} value={category.title}>{ fromKebabToTitle(category.title) }</MenuItem>

										))}
									</Field>
									<Field
										error={errors.price && touched.price && true}
										helperText={errors.price && touched.price && errors.price}
										component={MuiTextField}
										name='price'
										label='Price'
										fullWidth
									/>
								</Stack>

								<DialogActions>
									<Button onMouseUp={handleDialogClose} color="error" startIcon={<CancelIcon />}>Cancel</Button>
									<Button type="submit" startIcon={<SaveIcon />}>Save</Button>
								</DialogActions>

							</Form>
						</DialogContent>

					)}
				</Formik>


		</Dialog>
	);
}

export default AddNewItemDialog;