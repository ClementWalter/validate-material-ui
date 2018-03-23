# Enhance your React forms with material-ui and validate.js

Forms are as old as the web. A lot of libraries have been built to optimize the fit between the
React framework and HTML forms. Amongst them one has:
 - [Redux-Form](https://redux-form.com/7.3.0/) which lets you build your form in the Redux Store
 - [React-Form](https://react-form.js.org/#/) which provides a comprehensive API for building and
 validating forms
 
Also HTML 5 has enhanced the `<form />` with new features such as type checking, autocomplete and other
features (css pseudo-classes for displaying error-success for instance).
 
Unfortunately, it is possible that your specific problem does not fit well into theses frameworks. 
Or they do not address your main pain-point. For instance placing the form data into the
Redux store does not help when it comes to data validation or nested forms.
As a matter of fact the web is full of
blog posts about [placing or not the state in the store](https://goshakkk.name/should-i-put-form-state-into-redux/).
Indeed, the [perfect form library is probably the one you will write for your application](https://medium.com/@steida/why-validation-libraries-suck-b63b5ff70df5).

From my experience I have distinguished two main sources of problems:
 - input validation
 - data validation
 - nested forms
 
Input validation means that one wants to disable some characters or values from a single input.
Data validation means that one needs to validate the form object as a whole, with for example
relationships between input values.

Nested forms means that you may have a random number of subforms into the main one. Each subform
could be the same, etc. You can imagine the personal income tax form.

Unfortunately, no one of the above-mentioned solutions satisfies easily these three conditions. Futhermore
you don't have access to the root `<input />` fields if you use Material-Ui.

In this post, I want to share my experience on the development of **heavy nested forms** with React using
[Material-Ui components](http://material-ui.com/) and [validate.js](validatejs.org) for the data validation.
The framework of this article does not rely specifically on Material-Ui and can be used with any
input fields.
 
## React guidelines

There is an [official React documentation](https://reactjs.org/docs/forms.html) on forms. It gives
the basis of a simple form with some inputs directly in the component. The main things to
know from it is:
 - the data of the form should be stored somewhere in the state of the component (or in the Redux
 store). There is one object for the whole form ([single source of truth](https://reactjs.org/docs/lifting-state-up.html)),
 ie that there is not one variable per input but inputs are keys of the same data object.
 - you can have either [_controlled_ or _uncontrolled component_](https://reactjs.org/docs/uncontrolled-components.html):
    - _controlled_ means that the data displayed to the user is the data that you pass to the
    component. In this setting you have to handle each input so that you update the data and the user
    still has the feeling that he is actually filling the input.
    - _uncontrolled_ means that the data displayed is the data typed by the user. You can still
    display a default value at mount but there is no way of _enforcing_ the display of a value when
    the user starts typing
    
If you choose to use controlled component, you don't really need to place your inputs inside a
`<form>` tag because you already get the data, at any time.
With uncontrolled component, you can either handle data changes or use a `<form>` tag to handle
data on submit.

As far as your form only contains few inputs all in the same component, this works well and is
rather easy, a little bit wordy though.

## Nested forms

### Main form

In essence, nested forms do not change a thing to what have been done so far. But you have to be
cautious to carefully apply the framework to avoid unexpected changes in data.

In this context we consider that each component stands for a _data unit_. It can be either a simple
input or a whole subform. It means that the component's structure should match the data
structure. For instance, say that you have a data:

```javascript
const data = {
  key1: 'key1',
  key2: {...},
  key3: [{...}, {...}],
}
```

At the top level, `key1`, `key2` and `key3` are _data units_ of your data. So you should have in
the main render three components, one for each of these keys. For instance:

```javascript
render() {
  return (
    <input type='text' value={this.state.key1}>
    <SubFormComponentForKey2DataType value={this.state.key2} />
    <ArrayOfSubFormComponentsforKey3DataType value={this.state.key3} />
  );
}
```

In this latter case one might be tempted to use directly a `map`:

```javascript
render() {
  return (
    <input type='text' value={this.state.key1}>
    <SubFormComponentForKey2DataType value={this.state.key2} />
    {this.state.key3.map((subform) =>
      <SubFormComponentforKey3DataType key={subform.key} value={subform} />
    }
  )
}
```

This practice is discouraged by the fact that one has to handle changes of each component
according to their index. By doing so we break the similarity with the other _fields_. In case of heavy
forms, it is necessary to really think small, _divide and conquer_. In other words, don't ask too much to your
component, keep it simple and split your logic.

In the main component, one defines the method to handle changes like that:

```javascript
handleFieldChange = (field) => (event, value, selectedKey) => {
  // make a copy of the object first to avoid changes by reference
  // especially if the data is received from props
  // you can also use lodash/cloneDeep here to make sure you handle a copy of the object
  let data = { ...this.state.data };
  // use here event or value of selectedKey depending on your field's component event
  // in this latter case use a switch (field) { ... } structure
  data[field] = value;
  this.setState({ data });
}
```

Keep it simple means that as for a very simple form, the method only has to be able to handle
`key1`, `key2` or `key3` on the whole. You don't want to make it aware of a change in `key2.subkey1`
or in a change of a subfield of a data of `key3` in any way. Then this method should be passed to
you components in the render:

```javascript
render() {
  return (
    <input type='text' value={this.state.key1} onChange={this.handleFieldChange('key1')}>
    <SubFormComponentForKey2DataType value={this.state.key2} onChange={this.handleFieldChange('key2')} />
    <ArrayOfSubFormComponentsforKey3DataType value={this.state.key3} onChange={this.handleFieldChange('key3')} />
  )
}
```

### Nested form as an object

Now let's have a look at what should be inside `<SubFormComponentForKey2DataType />`.
Remember that there is only one `state` for the whole form. This means that the subforms receive
their _part_ in `props` and called their parent's method on change. Thus the `handleFieldChange` is:

```javascript
handleFieldChamge = (field) => (event, value, selectedKey) => {
  let data = { ...this.props.value };
  data[field] = value;
  this.props.onChange(event, data);
}
```

### Array of nested forms

Let us finally consider the case of a `map` as in `<ArrayOfSubFormComponentsforKey3DataType />`. This
component should be able to handle a change only at the first level, ie. an array of objects.
Precisely, it should have a method:

```javascript
handleFieldChange = (index) => (event, value, selectedKey) => {
  let data = [...this.props.value];
  data[index] = value;
  this.props.onChange(event, data);
}
```

so that in its render one can write:

```javascript
render() {
  return (
    {this.props.value.map((subform, index) =>
      <SubFormComponentforKey3DataType key={subform.key} value={subform} onChange={this.handleFieldChange(index)} />
    }
  )
}
```

By doing so, changes are propagated near by near and you never have to think about what is
going on outside your component nor where you are in your data.
This setting is as simple as dumb: you only treat in a component the changes in its first level
values. The component can handle a change and then calls a parent's method meaning "my job is
done, do what you want with it".

## Data validation

### Forms validator

HTML5 provides easy data validators directly in the basic `<input>` components. For instance,
specifying `type="number"` or `required` will directly prevent the user from typing anything else
than numbers or from submitting an empty field. Read the [documentation](https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation)
for a comprehensive list of what is possible with HTML5 built-in validation.
However if your project is based on `material-ui`, that theses validators are not available.

Furthermore in some cases you want not only an input validation but also a data validation, for
example `field1 + field2 < threshold`.

Because of these reasons we will rely on the [`validate.js`](https://validatejs.org/)
package for data validation. It provides a comprehensive list of validators and an easy declarative
definition of the desired constraints
on an object.
It is possible to define several constraints for a single field with different error
messages and custom validators.

Most of the times your `data` object is self-validating. It means that looking only at the data you
are able to determine if it is valid or not.

But because we don't want to think about data validation outside of a form we define the
`formValidator` together with its constraints in the same `.js` file:

```javascript
import validate from 'validate.js';

const constraints = {
  key1: {
    presence: {
      allowEmpty: false,
      message: 'some custom or intl error message',
    },
    numericality: true,
  },
};

export const form1Validator = (data) => validate(data, constraints);

export const Form1 extends Component {
  ...
}
```
Here we specify that the `data.key1` field should not be empty and should be a number. If the form
has nested subforms such as in the first example the task of validating them is delegated to their
 own form validator:

```javascript
export const form1Validator = (data) => {
  let validation = validate(data, constraints);
    if (data.key2) {
    validation = {
      ...validation,
      key2: subform2Validator(data.key2),
    };
    if (data.key3) {
      validation = {
        ...validation,
        key3: data.key3.map((d) => subform3Validator(d)),
      };
    }
  }
  return validation;
}
```

All together it means that the constraints defined on the `*form` file only concern the _true_
inputs of the component while the validation of the more complex object is delegated to their own
validator.

 ### Display errors
`validate.js` function returns an object with the same keys as the argument containing either
`undefined` if there were no error or an object with the error messages if appropriate.

Say that you have placed your data in the state of the component, then you could add:
```javascript
constructor(props) {
  super(props);
  this.state = {
    data: {},
    dataValidation: {},
  }
}
```

Validate.js returns an error message or undefined preserving the keys of the `data` validated.
Then you can pass the `dataValidation` to your component so that they receive undefined or the
error message(s):

```javascript
render() {
  return (
    <TextField
      value={this.state.data.key1}
      errorText={this.state.dataValidation.key1}
      onChange={this.handleFieldChange('key1')}
     >
    <SubFormComponentForKey2DataType
      value={this.state.data.key2}
      errorTexts={this.state.dataValidation.key2}
      onChange={this.handleFieldChange('key2')}
    />
    <ArrayOfSubFormComponentsforKey3DataType
      value={this.state.data.key3}
      errorTexts={this.state.dataValidation.key3}
      onChange={this.handleFieldChange('key3')}
    />
  )
}
```

### Validation on submit
As it seems to be the case for most of the form, validation is performed only on submit. It means that
before sending the full object the (nested) validation is done using the previously defined validators.

The previous consideration leads to two point of attention:
 - the data validation computed at the main component should be propagated to the children components.
 - the `dataValidation` object is more complex than just being defined of `undefined`  since the keys
 might be defined but containing only undefined values etc.
 
The first point means that one has to pass in _props_ each validation together with the original value.

The second point can be tackled with a function that performs a deep search for `undefined`: it searches
iteratively to make sure that if keys are defined, they only lead to `undefined` values.

```javascript
export const deepUndefinedSearch = (obj) => (
    obj instanceof Object && obj.constructor === Object ? Object.keys(obj)
      .map(
        (key) => obj[key] instanceof Array ?
                 obj[key].map((o) => deepUndefinedSearch(o)).filter((o) => !o).length === 0 :
                 obj[key] === undefined
      )
      .filter((o) => !o)
      .length === 0 :
    obj === undefined
  );
```

With this function, you can then call in your `handleSubmit` method of your main component:

```javascript
handleSubmit = () => {
  const dataValidation = validate(this.stata.data, constraints) || {};
  if (deepUndefinedSearch(dataValidation)) {
    // submit the form
  }
  this.setState({ dataValidation })
}
```
Note that with the `deepUndefinedSearch` util we can directly pass `validate` or `{}` to the
`dataValidation` object to handle data with no error. In this latter case `dataValidation` would be
`undefined` and the render with the `errorText=this.state.dataValidation.key` would throw errors.

## Limit of the current implementation

### Validation

As long as the object are _self validating_ the current implementation, while somehow wordy, works.
However they are some cases where the fields were defined on purpose depending on some
logic implemented in the component but not accessible from the object itself.

In this context it means that each instance of the same component can lead to different validators.
Then, each component should validate its data itself and send back the result to the parent component.
The more probable is that the render embeds the logic that one does not want to copy. In a 
sense one has to validate only the data that the user can fill.

The [ref attribute](https://reactjs.org/docs/refs-and-the-dom.html) can be used to determine what is
present in the render. The `constraints` object should then be filtered with the
present inputs and the results of the validation lifted-up until the main component.
In this latter case it is not possible to perform validation on submit only.


```javascript
render() {
  this.fields = {};
  return (
    <input
      type='text'
      value={this.state.key1}
      onChange={this.handleFieldChange('key1')}
      ref={(el) => this.fields.key1 = el}
     >
    <SubFormComponentForKey2DataType
      value={this.state.key2}
      onChange={this.handleFieldChange('key2')}
      ref={(el) => this.fields.key2 = el}
    />
    <ArrayOfSubFormComponentsforKey3DataType
      value={this.state.key3}
      onChange={this.handleFieldChange('key3')}
      ref={(el) => this.fields.key3 = el}
    />
  )
}
```

### Factorisation

This framework is pure React and not complicated to implement. However it is quickly cumbersome.
Especially one types for all components the same things with only a `key` variation. To circumvent
this limitation, React provides [Higher Order Component (HOC)](https://reactjs.org/docs/higher-order-components.html) or
[children props](https://reactjs.org/docs/composition-vs-inheritance.html) that might be used to pass
factorize the props. In this content one would pass only the key to the inputs and the HOC would
distribute the right props.
