import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

const FormikCheckBox = ({ label, handleChange, props }) => {
	return (
		<FormGroup>
			<FormControlLabel control={<Checkbox { ...props } />} label={label} onChange={handleChange} />
		</FormGroup>
	)
}

export default FormikCheckBox;