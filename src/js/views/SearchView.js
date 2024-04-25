// Class to get the query and to also handle the click event on the button
class SearchView {
  _parentElement = document.querySelector('.search'); //in the HTML, the search class is our parent element which contains the text box as well as the button
  _inputField = this._parentElement.querySelector('.search__field');

  //We don't make this private as our controller needs access to this function
  getQuery() {
    //First get the query
    const query = this._inputField.value; //we need to have the 'this' keyword, because the only time we can run this function is by accessing it through an instance of the class object, which the 'this' would be referring to
    //Clear the input field
    this._clearInputField();
    //Return the query
    return query;
  }

  //We can make this private because we won't be trying to access it outside of just this class. We're calling addHandlerSearch from our controller, and private properties/methods can only be accessed within the same class where they are defined.
  //They cannot be accessed directly from outside the class, including from instances of the class.
  _clearInputField() {
    this._inputField.value = '';
  }

  addHandlerSearch(handler) {
    //We set the event listeners on the parent element rather than just the button as we also want to listen in case the user presses the 'enter' on their keyboard.
    //So, we want to listen for a submit event in the context of the entire search element (the text box and the button)
    this._parentElement.addEventListener('submit', function (e) {
      //we cannot pass in the handler immediately as when we submit a form (which you can see the search element is in the HTML), there is a default action of reloading the page. So, we need to prevent this default action.
      //This is the function that the callback function will call when the submit event is 'heard' on the search element.
      //If we didn't prevent the default behavior, the page would reload and our controlSearchResults function (the handler) would be trying to get the data.
      //Whether it succeeds in time before the page reloads or not is irrelevant as the reload will clear out either this action or the returned data
      e.preventDefault();
      handler();
      //We don't want to call clearInputField() in here as the 'this' keyword would now be referring the DOM element to which the event listener is attached (#parentElement), which would not have access to the method
      //We also just don't need to clearInputField() here, as we already do so inside of our getQuery() function, which is called inside of our handler.
    });
  }
}
export default new SearchView();
