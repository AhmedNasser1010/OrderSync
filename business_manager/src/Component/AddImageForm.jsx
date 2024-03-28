import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Formik, Form, Field } from 'formik';
import { object, string, array } from 'yup';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MuiTextField from "./MuiTextField.jsx";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CancelIcon from '@mui/icons-material/Cancel';
import Typography from '@mui/material/Typography';
import { setDisableMenuDnD } from '../rtk/slices/conditionalValuesSlice.js';
import fromKebabToTitle from '../functions/fromKebabToTitle.js';
import IconedTitle from './IconedTitle';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

// Validation schema
const linksValidationSchema = array().of(string().required("link are required"));


const AddImageForm = ({ item, handleDialogClose, submitFunc, dialogVisibility }) => {
	const [lastInput, setLastInput] = useState(0);
	const [morelinkDisable, setMorelinkDisable] = useState(false);
	const itemName = fromKebabToTitle(item?.title);

	useEffect(() => {
		item?.backgrounds.map((background, index) => {
			background === '' ? false : setLastInput(index);
		})
	}, [])

	const handleMoreLink = () => {
		const inputNode = document.querySelectorAll('.link-input');

		// plus 1 to start from 1 instead of 0 to match the length
		// plus 1 to make the number next to the last input
		// plus 1 to to active the event before start make errors
		lastInput + 3 > item.backgrounds.length && setMorelinkDisable(true);
		inputNode[lastInput+1].style.display = 'block';
		setLastInput(lastInput+1);
	}

	const btnStyle = {
		borderStyle: 'dotted',
		borderWidth: '2px',
		fontSize: '12px',
		'&:hover': {
			borderStyle: 'dotted',
			borderWidth: '2px'
		}
	}

	return (

		<Dialog open={dialogVisibility}>

			<DialogTitle>
				<IconedTitle
					icon={<AddPhotoAlternateIcon sx={{ fontSize: '26px', marginRight: '8px' }} />}
					title={`Add Images To ${itemName}`}
					variant='h3'
					fontSize='24px'
				/>
			</DialogTitle>

			<DialogContent>
				<Formik
					enableReinitialize
					initialValues={item?.backgrounds}
					// validationSchema={linksValidationSchema}
					onSubmit={values => {
						submitFunc(values);
					}}
				>
					{({ isSubmitting, errors, touched, values }) => (

						<Form>
							<Stack>
								{values.map((value, index) => (
									<Field
										key={index}
										className={`link-input i-${index}`}
										style={{ marginBottom: '10px', display: value === '' && index !== 0 && 'none' }}
										error={errors[index] && touched[index] && true}
										helperText={errors[index] && touched[index] && errors[index]}
										component={MuiTextField}
										name={`[${index}]`}
										label={`#${index+1}'s Link`}
										fullWidth
									/>
								))}
							</Stack>

							<Button
								disabled={morelinkDisable}
								onMouseUp={handleMoreLink}
								startIcon={<AddCircleOutlineIcon />}
								sx={btnStyle}
								variant="outlined"
							>
								More Link
							</Button>
							
							<DialogActions>
								<Button onMouseUp={handleDialogClose} color="error" startIcon={<CancelIcon />}>Cancel</Button>
								<Button onMouseUp={handleDialogClose} type="submit" startIcon={<DoneAllIcon />}>Add</Button>
							</DialogActions>
						</Form>

					)}
				</Formik>
			</DialogContent>

		</Dialog>

	);
}

export default AddImageForm;