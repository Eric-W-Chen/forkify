import View from './View';

//We actually already have the view that we want to display in our HTML. And so showing this window will be as simple as toggling the hidden class from the window and overlay
class AddRecipeView extends View {
  _parentElement = document.querySelector('.upload'); //Let's make our form our parent element in this case as that's what we want to display.
  //However, we'll still need to be able to select our window and overlay, so we'll manually select those.
  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  //Now we'll need to select the button that will be clicked to open the window as well as the button that will be clicked to close the window.
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');
  _message = 'Recipe was successfully uploaded!';
  //Since this is a child class of View, we need to inherit its properties using the super() keyword
  constructor() {
    super();
    this._addHandlerShowWindow(); //So, we'll run these functions as soon as this class is instantiated to attach our event listeners
    this._addHandlerHideWindow();
    //We don't need addHandlerUpload in our constructor as this will be invoked in our constructor. Having it in our constructor could cause a problem as when it's called from the constructor, we're not passing in any function as an argument so handler will be undefined causing an error
  }

  //This will be a public method as we'll want to be able to call this from the controller because we'll want to hide the window and overlay once we're finished uploading a recipe.
  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }
  //Now we need to listen for events of opening and closing our form. This function has nothing to do with the controller, there is no information that we need from the controller in regards to what should happen when the event happens.
  //All we're doing is hiding or displaying the form through modifying the 'hidden' class. So, we can run this function as soon as our AddRecipeView class is instantiated using a constructor and we can also make this method protected as it's only going to be used
  //within this class. Note, however, that the controller will still need to import this class as then our controller will not invoke the instantiation of this class (will not create this object)
  _addHandlerShowWindow() {
    this._btnOpen.addEventListener('click', this.toggleWindow.bind(this)); //when we click the button, we want to toggle the hidden class from both the overlay and from the window.
    //We create a separate function for this so that we can use the appropriate 'this' keyword inside of the function that we call in the eventListener by manually binding it to the appropriate 'this' keyword, which would be our current instance of AddRecipeView that's invoking this method
    //Because, otherwise, the 'this' keyword would be pointing to the element that the eventListener is attached to, which would be the btn selected in this instance of AddRecipeView (this._btnOpen) in this case
  }

  _addHandlerHideWindow() {
    //We want to be able to close the form by either clicking the 'x' button or by clicking the overlay
    //The _toggleWindow() method modifies properties (_window, _overlay) of the AddRecipeView instance.
    //If you do not bind this to _toggleWindow(), when the event triggers the method, it won't recognize _window and _overlay as properties of the button or the overlay, because this will refer to the HTML elements (like .btn--close-modal or .overlay) rather than the AddRecipeView instance
    this._btnClose.addEventListener('click', this.toggleWindow.bind(this)); //We don't want the 'this' keyword to refer to the _btnClose or _overlay element, but we want it to refer to our current instance of AddRecipeView that's invoking this method
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
  }

  //When clicking the upload button, we want to get all of the data out of the form and 'submit' it. We create a new function to handle form submission.
  addHandlerUpload(handler) {
    //We want to add an event listener to the upload form itself
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault(); //A button that is created like this <button></button> will submit a form by default when the button is inside of a form. This is what refreshes the page, and this is the default behavior that we want to prevent
      //Now, how do we access all of the values in our form? We can use something called formData, which is a modern browser API
      const dataArr = [...new FormData(this)]; //Inside of the constructor, we have to pass in an element that's the form. In this case, that would be our parent element, which would be our 'this' keyword since we're inside of our eventListener function.
      //Remember, the 'this' keyword in this context refers to the element that triggered the event.
      //The FormData object is an interface that allows you to easily construct a set of key/value pairs representing form fields and their values,
      //The spread operator (...) is used here to expand the entries in the FormData object into an array. Each entry in the FormData object is a key/value pair, so this spreads the entries of the FormData object into an array of [key, value] pairs.
      //The spread syntax (...) can be used to convert some kinds of objects into arrays, but it depends on the object having iterable properties.
      //The spread syntax is versatile for working with iterable collections in JavaScript, but when dealing with non-iterable objects like plain object literals, you'll need to use methods like Object.keys(), Object.values(), or Object.entries() to first convert these objects into an array format.

      //when you use the spread syntax with a FormData object in JavaScript, the result is a 2D array where each element of the array is itself a 1D array containing two elements: the key and the corresponding value from the form.
      //Each key-value pair represents one form control (like an input or select field).
      //Using the spread syntax on a FormData object, [...formData], takes each entry from the FormData object and places it into a new array.
      //Each entry itself is an array containing two elements: the name of the form control as the first element (key), and its value as the second element.

      //Before being converted into an array, FormData is an object that encapsulates the data from a form as a series of key-value pairs, but these pairs are not directly accessible like those in a regular JavaScript object or array.
      //FormData is designed to handle and transmit form data in web applications, particularly for AJAX requests, and it has a specific internal structure that supports both simple text fields and file uploads.
      //FormData does implement the iterable protocol, specifically providing entries as [key, value] pairs, which makes it compatible with iteration methods designed for iterables even though you cannot iterate over it directly using typical object iteration methods like for...in loops
      //FormData objects are iterable in the sense that they can be used with constructs and methods that expect iterable values.
      //This iterability is specifically implemented through FormData's entries, which are accessible using the entries() method. By default, when you use FormData with the spread syntax (...), JavaScript uses this entries() iterator.

      //What's going on: The spread syntax implicitly calls the entries() iterator of the FormData object. Each iteration produced by entries() returns a [key, value] pair, much like iterating over a Map object. These [key, value] pairs are then placed into a new array.

      //This returned data is what we want to use to upload our new personal recipe to the API. And the action of uploading the data will be another API call, which happens in the model. So, we need a way of moving this data over to the model.
      //We will do this by creating a controller function called controlAddRecipe which will be the handler for this event (Publisher Subscriber pattern) and by passing the data into our handler function.
      //Once we're able to get the data into our controller, we'll also be able to easily get it into our model as the controller is the medium

      //Note that usually our recipe data is an object rather than an array of entries like this and there's actually a method that we can use to convert entries into a regular JavaScript object, which is what we want.
      const data = Object.fromEntries(dataArr);

      //However, this object is going to be a bit different. It's okay if it's missing some properties as long as we don't add properties that our API isn't expecting.
      //What's most important is that we need to match the format of the values for each appropriate proeprty so we're going to have to take care of that in that our model
      handler(data);
    });
  }

  _generateMarkup() {}
}

export default new AddRecipeView();
