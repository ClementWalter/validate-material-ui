import React, { Component } from 'react';
import validate from 'validate.js';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import logo from './logo.svg';
import './App.css';

const constraints = {
  ["input-field-1"]: {
    presence: true,
    numericality: true,
  },
  ["select-field-1"]: {
    presence: {
      allowEmpty: false,
    },
  },
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      data: {
        ["input-field-1"]: '',
        ["select-field-1"]: '',
      },
      dataValidation: {
        ["input-field-1"]: '',
        ["select-field-1"]: '',
      },
    }
  }

  handleFieldChange = (field) => (event, value, selectedKey) => {
    const data = { ...this.state.data };
    let formattedValue;
    switch (field) {
      case "input-field-1":
        formattedValue = value;
        break;
      case "select-field-1":
        formattedValue = selectedKey;
        break;
      default:
        break;
    }
    data[field] = formattedValue;
    this.setState({ data })
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState((prevState) => ({
        dataValidation: validate(prevState.data, constraints) || {},
    }));
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className="App-container">
          <form onSubmit={this.handleSubmit}>
            <TextField
              id="text-field-1"
              floatingLabelText="Input TextField"
              value={this.state.data["input-field-1"]}
              errorText={this.state.dataValidation["input-field-1"]}
              onChange={this.handleFieldChange("input-field-1")}
            />
            <SelectField
              id="select-field-1"
              floatingLabelText="Input SelectField"
              value={this.state.data["select-field-1"]}
              errorText={this.state.dataValidation["select-field-1"]}
              onChange={this.handleFieldChange("select-field-1")}>
              <MenuItem key="menu-item-value-1" value="menu-item-value-1" primaryText="menu-item-value-1"/>
              <MenuItem key="menu-item-value-2" value="menu-item-value-2" primaryText="menu-item-value-2"/>
              <MenuItem key="menu-item-value-3" value="menu-item-value-3" primaryText="menu-item-value-3"/>
            </SelectField>
            <button title="Submit" />
          </form>
        </div>
      </div>
    );
  }
}

export default App;
