import { object, string, array } from 'yup';
import { Formik, Form, Field } from 'formik';
import { useDispatch } from 'react-redux';
import { addCategory, updateCategory } from '../rtk/slices/menuSlice';
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

const validationSchema = object({
	title: string().required('Title is required'),
	description: string(),
})

const AddNewCategoryDialog = ({ dialogVisibility, handleDialogClose, initialValues = { title: '', description: '', backgrounds: ['', '', '', '', ''], visibility: false } }) => {
	const dispatch = useDispatch();

	return (
		<Dialog open={dialogVisibility}>

			<DialogTitle>
				<IconedTitle
					icon={<PlaylistAddCircleIcon sx={{ fontSize: '26px', marginRight: '8px' }} />}
					title='Add New Category'
					variant='h3'
					fontSize='24px'
				/>
			</DialogTitle>
			
				<Formik
					initialValues={initialValues}
					validationSchema={validationSchema}
					onSubmit={values => {
						initialValues.title === '' ? dispatch(addCategory(values)) : dispatch(updateCategory({ initialValues, values }));
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
								/>
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

export default AddNewCategoryDialog;