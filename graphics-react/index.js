import { ThemeProvider, createTheme } from "@mui/material/styles";
import React from "react";
import ReactDOM from "react-dom";
import App from './components/App';
import '@fontsource/rubik'

const theme = createTheme({
    typography: {
        allVariants: {
            fontFamily: "Rubik"
        }
    }
})

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <App/>
    </ThemeProvider>
, document.getElementById("root"));