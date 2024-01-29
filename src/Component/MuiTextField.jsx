import TextField from '@mui/material/TextField';

const MuiTextField = ({ field, form, ...props }) => {
  return <TextField {...field} {...props} />;
};

export default MuiTextField;