import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            {/* use CssBaseline to reset CSS */}
            <CssBaseline />
            <App />
        </ThemeProvider>
    </StrictMode>,
)
