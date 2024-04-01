import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const CustomTabPanel = ({ children, tabValue, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={tabValue !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {tabValue === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default CustomTabPanel;