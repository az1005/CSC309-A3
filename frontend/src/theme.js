import { createTheme } from '@mui/material/styles';

// create a theme instance
const theme = createTheme({
    cssVariables: true,
    palette: {
        mode: 'light'
    },
    components: {
        // MuiCardContent: {
        //     styleOverrides: {
        //         root: {
        //             // Some CSS
        //             fontSize: '1rem',
        //             padding: '0px !important', 
        //         },
        //     },
        // },
        MuiAccordionDetails: {
            styleOverrides: {
                root: {
                    paddingBottom: '2px'
                }
            }
        },
        MuiAccordionSummary: {
            styleOverrides: {
                content: {
                    margin: '0px !important'
                },
                root: {
                    '&.Mui-expanded': {
                        minHeight: '48px'
                    }
                }
            }
        },
    },
});

export default theme;