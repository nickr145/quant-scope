import { AppBar, Toolbar, Typography, Button } from '@mui/material'
import { Link } from 'react-router-dom'

export default function NavBar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          QuantScope
        </Typography>
        <Button color="inherit" component={Link} to="/screener">Screener</Button>
        <Button color="inherit" component={Link} to="/strategy">Strategy</Button>
        <Button color="inherit" component={Link} to="/backtest">Backtest</Button>
      </Toolbar>
    </AppBar>
  )
}