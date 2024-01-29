import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

const FormikCheckBox = ({ name, label, props }) => {
	return (

		<FormGroup>
			<FormControlLabel control={<Checkbox name={name} { ...props } />} label={label} />
		</FormGroup>

	)
}

export default FormikCheckBox;