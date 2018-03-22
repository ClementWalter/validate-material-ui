import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
// Use Material UI
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#7584a4',
    primary2Color: '#f2b6b7',
    pickerHeaderColor: '#000000',
    textColor: '#374760',
    // border Color impacts all material fields/table borders
    // BUT ALSO the color of selected rows in Tables..
    borderColor: '#a41d19',
  },
  fontFamily: 'Roboto, sans-serif',
  paper: {
    zDepthShadows: 'none',
  },
});

ReactDOM.render(<MuiThemeProvider muiTheme={muiTheme}><App /></MuiThemeProvider>, document.getElementById('root'));
registerServiceWorker();
