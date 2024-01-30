import TextField from '@mui/material/TextField';
import { useEffect } from 'react';

const MuiTextField = ({ field, children, ...props }) => {
  return <TextField {...field} {...props} >{ children }</TextField>;
};

export default MuiTextField;