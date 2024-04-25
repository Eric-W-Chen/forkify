import icons from 'url:../../img/icons.svg';

export default class View {
  //parent class for child classes to inherit methods. We are exporting the class itself as we are not going to create any instances with this view. This is only for child views to inherit these methods.
  //NOTE: With Parcel and Babel, inheritance between private fields and methods is not supported. So, we are going to change all of our previously private fields to protected. Please do note this when reading the comments for the methods in this class.
  //With this in mind, we're actually going to change all of our private fields/methods to protected in all of our view files.
  _data;
  //Every view will have a unique parentElement, markup, and view so we define those in our separate views. The data can be shared as we are reassigning the data inside of the render() method.

  /**
   * Rendered the received object to the DOM. (Documented using JSDoc)
   * @param {Object | Object[]} data The data to be rendered (e.g. a recipe)                            //Expect an object or an array of objects for our data parameter
   * @param {boolean} [render=true] If false, create markup string instead of rendering to the DOM      //Render argument is optional, so we surround it in brackets and identify its default value as true
   * @returns {undefined | ''} A markup string is returned if render=false                              //We either return undefined or our markup string if render is set to false
   * @this {Object} View Instance       //The 'this' keyword points to the instance of our View object (more accurately, our child instance) that's invoking this method. Notice we specified the type of View in curly braces
   * @author Eric Chen
   *
   */
  //Notice that if we hover over the function that we wrote JSDoc for, VSCode will show us our documentation that we wrote. This will remain consistent anytime the function is used in our project.

  //We are not creating any constructor for RecipeView, but we can still create a function to render the recipe that is passed in, that can be reused in the same RecipeView object that we export.
  //We accept the recipe data that is passed in and will store the data in the object. Storing it as an object within the class makes it easier to manage and use this data throughout the class methods, and we don't want to rely on the DOM for our data.
  render(data, render = true) {
    //If there's no data or we receive an empty array
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return this.renderError(); //return out of our function while also calling renderError() on whatever child instance is calling the render method. We already specified the _errMessage inside of our child classes, so that will be handled for us when invoking renderError.
    }
    this._data = data; //Recall that our data is the passed in data and it is stored inside of our class now.

    //Now that we've stored the most recent recipe data, we want to display this data on the page.
    const markup = this._generateMarkup(); //this._generateMarkup is unique for each different child class of view, so we need our own _generateMarkup() method inside of our child class in order to call the inherited render() method from our parent class.
    //It has to have the same name so the parent class is able to refer to the _generateMarkup method inside of our child class instance

    if (!render) {
      return markup;
    }
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup); //insert our markup HTML as the first child in the container. This means that the newly added content becomes the first element within that container so that the newly added content will be on top of the previous content, similar to a stack.
  }

  //Only update text attributes in the DOM without re-rendering the entire view
  update(data) {
    //Once we update the data, we want the view's data to become the new data and to also generate some new markUp to reflect this change on the DOM

    //We don't need this check for our update method. We aren't dealing with potential empty arrays or unknown data for our update function as we aren't using it to render fetched data, for example.
    //We know exactly what we're passing into our update function as we are only using it to update text and attributes in a previous _parentElement to an updated _parentElement, which was the reason why we made this function in the first place.
    //So, in our case, it's okay if there's an empty array because we want to account for scenarios such as if there were no search results. Because what if we have a link that we want to go to and just paste that into our URL?
    //There would be no search results, but we don't want to render an error in this case as that would be a completely acceptable scenario.
    // We could just return out of the function in that case as there would be nothing to update.

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return;
    }

    // if (!data || (Array.isArray(data) && data.length === 0)) {
    //   return this.renderError();
    // }
    this._data = data;

    //This newMarkup will be the entire markup as if we wanted to render a new view.
    //However, we are only going to update the text and attributes in the DOM, but we still need to have the entire view in order to do that by essentially comparing the old and new markup against one another
    const newMarkup = this._generateMarkup();
    //So, we are going to create newMarkup but not render it. Instead, we're going to create this new markup and compare this new markup to our previous markup and then only update the text and attributes that have changed from the old version to the new version.

    //First, we'll convert the returned String from the _generateMarkup function to a DOM object to compare with the actual DOM object on the page
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    /* document.createRange(): Creates a new Range object. A Range represents a fragment of a document that can contain nodes and parts of text nodes.
    createContextualFragment(htmlString): This method is called on a Range object. It takes a string of HTML (in this case, newMarkup) and converts it into a DOM fragment.
    This fragment is a full-fledged part of the DOM but exists in memory and isn't part of the actual document's structure until it's inserted somewhere in the document.
    
    Initialization: You create a Range by calling document.createRange(). At this point, the range is conceptually positioned but doesn’t highlight or select anything specific unless you define its start and end points.
    Fragment Creation: When you call createContextualFragment() with an HTML string, the method parses this string as if it were part of the document at the location specified by the Range. This parsing respects the document's structure and formatting rules.
    DOM Fragment: The parsed HTML string becomes a DocumentFragment, which is a lightweight, document-like object that can hold DOM nodes in the same way a full document can, but it does so without being directly part of the main document tree until explicitly inserted.
    Storing in newDOM: The resulting DOM fragment is stored in the variable newDOM. This DOM fragment can now be used for various purposes, such as comparing with the existing DOM on the page or being inserted into the document at a desired location.

    We're essentially preparing a chunk of HTML text to be dynamically manipulated or compared with the current content of the webpage without affecting the visible page until you decide to insert or replace elements.
    This method is particularly useful for updating parts of a webpage with new content without reloading the entire page, allowing for more efficient and smoother user experiences in dynamic web applications. */

    //Now we can select all elements within our new DOM that we created by generating the new markup containing the updated text and attributes. Basically, we are selecting all elements of the DOM with the updated information (the DOM that would have been rendered if we had just called the render() method)
    //Recall that querySelectorAll returns a NodeList, so let's convert this to an array using Array.from
    const newElements = Array.from(newDOM.querySelectorAll('*'));

    //So now we can compare this updated DOM with our current DOM. First, we need to get all the elements of our current DOM (meaning all of the elements within our current _parentElement), and we will update the text and attributes within these elements
    //within our current _parentElement to our new _parentElement

    //Note that this name is a bit misleading as it's actually a NodeList, where each "Node" is actually each of our child elements within the _parentElement. This is because all elements are nodes. However, not all nodes are elements so this can get a bit confusing.
    const currElements = Array.from(this._parentElement.querySelectorAll('*'));

    //Now, let's compare between the elements in our new DOM and our current DOM
    newElements.forEach((newEl, i) => {
      const currEl = currElements[i];

      //There is a method on all nodes that allows us to compare between two nodes called isEqualNode, so we will use that. Note that this is not comparing memory references, this is comparing the actual content of the nodes
      //However this name is a bit misleading as it does compare between the nodes in our _parentElement, but it also compares the child elements within our current and new _parentElement
      if (
        !currEl.isEqualNode(newEl) &&
        currEl.firstChild?.nodeValue.trim() !== ''
      ) {
        //Since we are updating our servings, our text elements will differ in servings as the servings in our state has changed. However, this will be limited to +/- 1 as we also need to update the dataset property (the 'data-*' attribute) within our markup.
        //What's happening is that the value that we pass into our handler (the updateTo value in our RecipeView) +/- 1 due to the button click, but we are not actually re-rendering and saving this updated value anywhere.
        //So, we will do this in our second if block.

        //However, first, we are going to render this new servings value on the DOM.

        //However, note that this also notices in the parent elements that the entire container elements are different due to the underlying nodes of the servings being different, which we will handle later.

        //So, over here we will say that if the current element is different than our new element, we will change the text node of the current element to the text node of the new element
        currEl.textContent = newEl.textContent; //Note that currEl is the DOM element that is currently on the page, so we do want to mutate the text node within this element
        //Note that just doing the above will not work as we would be replacing the text node for every current element that does not equal our new element, including the text node within the parent container.
        //This would cause the entire text node in the parent container to equal the text node of our new element.
        //To avoid this, we need to find a way to determine if the element within our parentElement only contains a text node, without any other children elements, as we know that that's what we're looking to re-render in this case.
        //And that's what would differentiate this element from others within our parentElement in this situation.

        //We can do this by adjusting a node property called nodeValue.
        //The value of nodeValue will be null if the node is an element, amongst many others (you can refer to the doc), but the main point is that if it's a text node, then we can extract that text content value of the text node.
        //So, with this in mind, we should check to ensure that the elements are different, but on top of that, we also only want elements that only contain a child element containing a text node.
        //So, we can take the first child of the element since we know that the only child in the element should contain the text node, so if we check the nodeValue property of this text node, it should return something meaning it should not be an empty string or return null.
        //We can check this on either the currEl or the newEl, it doesn't matter as the indexes are matching. The point is that we find the element containing only the servings text node, and we modify this.
        //We use optional chaining to ensure that it's not null meaning that if the first child doesn't exist, then we just short circuit and returns undefined instead of throwing an error
        //We also trim to filter the elements which don't have a first child element containing a text node because the nodeValue of such elements will be a string consisting of white space, such as ('\n')
        //However, the parent elements with a first child element containing a text node will pass this condition as there will be some content left after trimming white space.

        /* The phenomenon where the first child element appears to be just whitespace is a common occurrence in HTML documents, primarily due to how HTML is formatted by developers for readability.
        When developers create HTML, they often format it with indentations and line breaks to make the code easier to read and manage.
        These formatting choices, while invisible on the rendered page, become part of the DOM as text nodes. */

        //So, we just updated the servings displayed on the DOM based on the new servings

        //Now we want to update the dataset properties:
        if (!currEl.isEqualNode(newEl)) {
          //We can access the attributes property, which all elements have. newEl.attributes, for example, will return an object of all of the attributes that have changed.
          //So, we will convert this object to an array and basically copy all of the attributes from our new element to our current element, updating our DOM

          Array.from(newEl.attributes).forEach(attr => {
            currEl.setAttribute(attr.name, attr.value); //if the elements aren't equal, we take the attributes of the updated parentElement of our DOM and copy them over to the current parentElement of our DOM
            //setAttribute: We are taking the name of our attribute that's updated (in this case, it would be update-to) and we are updating the value tied to this name to the updated value that we get from our new element (parentElement)
          });
        }
        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', newMarkup);
      }
    });
  }

  //Let's create a function to render the spinner when loading the elements in our parent element, which is the container that holds our child elements. We make this reusable by doing this in any parent element that we pass in
  //Note that renderSpinner has nothing to do with the business logic, but is only presentation logic so this goes in the view
  //This will be a public method so that the controller could call this method as it starts fetching the data
  renderSpinner() {
    this._clear(); //Before loading the spinner, let's clear the container (parent element) so that the only thing inside of the container will be the spinner until the data is finished loading

    const markup = `<div class="spinner">
    <svg>
      <use href="${icons}#icon-loader"></use>
    </svg>
  </div>`;

    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  //We create this as a method so that other view classes inherit this method. However, we make this protected as private properties and methods do not get inherited and outside classes (only view classes) do not need access to this method.
  //The protected modifier allows a class member to be accessed within the class itself, by instances of the class, and by any subclass derived from it, but not from the outside world (i.e., not by any code that is not part of the class or its subclasses).
  //However, note that protected is simply a convention in JS. It does not actually limit accessibility. However, we use this convention so that we know that only View classes should use this property (only view classes would have parentElement anyways).

  //We could also make this private if we don't plan to have other classes inherit this method if we aren't accessing this method outside of this class definition. Note that private methods/properties cannot be accessed directly from outside the class, including from instances of the class.
  _clear() {
    this._parentElement.innerHTML = ''; //Before inserting our new recipe into our container, let's clear anything that was previously there. In this case, we are clearing our spinner before adding our new child elements into the container so that the spinner is not constantly on the page.
  }

  renderError(err = this._errMessage) {
    this._clear();

    const markup = `<div class="error">
    <div>
      <svg>
        <use href="${icons}#icon-alert-triangle"></use>
      </svg>
    </div>
    <p>${err}</p>
  </div>`;

    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderMessage(err = this._message) {
    this._clear();

    const markup = `<div class="message">
    <div>
      <svg>
        <use href="${icons}#icon-smile"></use>
      </svg>
    </div>
    <p>${err}</p>
  </div>`;

    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
