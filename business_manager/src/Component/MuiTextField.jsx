import TextField from '@mui/material/TextField';

const MuiTextField = ({ field, children, ...props }) => {
  return <TextField {...field} {...props} >{ children }</TextField>;
};

export default MuiTextField;