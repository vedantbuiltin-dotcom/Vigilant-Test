import { List, ListItem, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

const Instructions = ({ items }) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
      Instructions
    </Typography>
    <List dense disablePadding>
      {items.map((text, idx) => (
        <ListItem key={idx} disableGutters sx={{ py: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <CheckCircleRoundedIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText primary={text} />
        </ListItem>
      ))}
    </List>
  </Paper>
);

export default Instructions;
