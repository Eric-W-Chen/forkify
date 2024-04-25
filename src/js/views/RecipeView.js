// One class for each of the different views. We do this because we are going to have a parent class named View which will contain a few methods that all the views will inherit. However, we also want each view to have its own private methods and properties.
//With these in mind, classes seems best due to our need of inheritance as well as encapsulation

import View from './View'; //we need to import what we're extending
//In this case, icons.svg has a default export so we can use any name. You can experiment this if documentation and configurations are helpful through trial and error:
//Attempt a Default Import: Try importing without braces and see if it works without errors.
//Attempt Named Imports: Try importing with specific names within braces. If this fails but the default import works, it’s likely a default export.
import icons from 'url:../../img/icons.svg'; //In Parcel v2, we need to have url: in front of the file path for any static asset.  It makes the intention clear that you are using the URL of the asset, rather than the asset itself.
//If you need to interact with the actual content of the file rather than just its URL, you should import it without the url: prefix.
import fracty from 'fracty'; //Library we installed in NPM to change decimals to fractions in our UI. Note that with libraries we don't need to specify a path. We could see from logging Fraction that this would give us a Fraction object containing another object, so we are going to destructure this object immediately
/* API gave us: var Fraction = require('fractiona').Fraction;
Object with Properties: The expression require('fractional').Fraction implies that fractional exports an object which includes Fraction as one of its properties. This is a common pattern in JavaScript modules where a module exports multiple functionalities (such as classes, functions, or constants) grouped within a single object.
Named Export Access: By accessing .Fraction immediately after requiring the module, you're using dot notation to access a property of the returned object. This style suggests that fractiona does not use a default export that directly exposes Fraction but rather an object that groups multiple exports, with Fraction being one of them. */
class RecipeView extends View {
  _parentElement = document.querySelector('.recipe'); //We set our container as private property. By making the parent element a private property of the RecipeView class, you restrict access to it from outside the class.
  //Only the view classes would need access to the parent element, providing unnecessary access could lead to issues in our code.
  //If any modifications need to be made to the #parentElement, they can be controlled through methods defined within RecipeView.
  //This ensures that all changes go through a "gatekeeper" function, which can manage things like cleaning up event listeners, preventing memory leaks, or ensuring the DOM is in a valid state before and after updates.
  //The concept of not making the #parentElement "protected" in JavaScript arises from a key aspect of the language: JavaScript does not natively support the protected access modifier as seen in other object-oriented languages like Java or C++.
  _errMessage = 'We could not find that recipe. Please try another one!';
  _message = '';

  //Not a private method as this method needs to be part of the public API so that we can call it in the controller. Remember that we want to set these event listeners right when we start out application, which we will do through the init function in our controller.
  //This is the publisher, and the handler is the subscriber. Meaning that the publisher knows when to react, and the subscriber knows how to react.
  //This function is called addHandlerRendler because we are passing in the handler function (function that handles the event) and we are adding these event listeners for this handler in this function, which is initialized in init() in the controller
  //And the functionality of the handler that we are passing in is to load the data and, ultimately, render our data (recipe). We call the function that we pass in our handler because it's our event handler that will be executed whenever the specified event happens in the specified element on the DOM.
  addHandlerRender(handler) {
    //If our hash (in the URL, the #...) changes, which means that the user clicked on a new recipe, we want to listen for this event so that we can update our recipe page with the new recipe.
    // window.addEventListener('hashchange', controlRecipes);
    //We set this on the window as we are globally listening for a hashchanger or load event

    //We also need to listen for a load event in case the user loads the link to a recipe in their URL. The hash isn't changing if the user directly types in the link, so we need to also listen for the load event
    // window.addEventListener('load', controlRecipes);

    //However, what we did above is using duplicate code. So, instead we could do this to add the event listener to each of the individual events:
    ['hashchange', 'load'].forEach(
      event => window.addEventListener(event, handler) //We pass in our subscriber so now we know how to react, and so we connect the logic of both the publisher and subscriber by knowing when the events happen and what to do when these events happen
      //We want this to be done in our view as we are performing an action based on how the user is interacting with the global window. However, the logic is inside of the controller and the view cannot import from the controller if we want to correctly follow MVC architecture, which we do.
      //So, we use the pub/sub relationship when starting the program through the init() function in the controller and sending over information on what should be done when these events do happen in the view.
    );
  }

  addHandlerUpdateServings(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--update-servings'); //both the minus and addition buttons share this class in common. though notice that they have child elements in them, such as the svg child element used to display the image of the + and -
      //We use this class over btn--tiny because btn--tiny is a class that we use more for styling with btn--update-servings is a class that we created for functionality, which is more appropraite for this case even though we could technically use both.
      //We want to separate the logic if possible.
      if (!btn) return; //If we aren't clicking any area where our + and - buttons are found as a parent element, then we aren't clicking anywhere inside of the button and we don't want to proceed
      //We will again need to use our dataset to dynamically receive our new updated servings value from our DOM by adding that we want to store this value in our dataset in our markup below
      const updateTo = Number(btn.dataset.updateTo); //Remember that our dataset automatically returns a string, so we have to convert this to a Number so that we could calculate the new quantities in our model when we pass in our updated servings to it
      //Notice in our HTML, we named our custom 'data-*' attribute 'update-to'. However, when accessing this attribute using the dataset property in JavaScript, we use camelCase in the place of the '-'
      //In that case, we can even use destructuring to make our code even cleaner:

      // const { updateTo } = Number(btn.dataset); //This is equivalent to the above as our variable name is the same as the variable name used to access the dataset property.
      //However, this actually doesn't work in this case because btn.dataset will first be converted to a number and then we would be using that converted number to try to access the .updateTo property of that number, which would result in undefined.
      //We'd basically be trying to destructure properties from a Number object. We'd be trying to convert the entire dataset object to a number and then access the updateTo property within this number.

      //Note that we don't want zero or negative servings, as that'd be either pointless or invalid, so we want to add a check here so that we're not going to modify or re-render the page for a negative serving
      //(basically, we won't call the handler in this case, which would be the controlServings function in our controller in this case)
      if (updateTo > 0) handler(updateTo);
    });
  }

  addHandlerToggleBookmark(handler) {
    //Event delegation is necessary here as the bookmark button is not loaded until we load a recipe, but we still need an element to attach our eventListener to which will be our parentElement.
    //We put this inside of the RecipeView as it's dealing with an element within the same parentElement.
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--bookmark'); //the user might click on the svg element within the button
      if (!btn) return; //if there's no .btn--bookmark element as the parent, we didn't click within the button
      handler();
    });
  }

  //This is private as this markup is going to be unique for our class. By using a function rather than a property, we ensure that our HTML markup reflects the most recently passed in recipe data every time that we render a recipe.
  //Note that we use 'this._data' to refer to the model.state object as we don't have connection between the view and model. Only from the model to controller and view to controller. We receive the data from the controller when we render the data in our parent View class
  //and we are able to manipulate the UI using this received data. The '_this' refers to whatever we pass in to the RecipeView as the data; however, it's important to keep this consistent as we will be using the sane generateMarkup function for several different uses in this case.
  //For example, this markup will be used for bookmarking, updating servings, and just rendering the entire recipe in general so we want to keep the passed in data consistent to keep the references in the template literals consistent.

  //You don't want prettier to be modifying HTML whitespace in JS code
  //In HTML and JavaScript templates, especially when using template literals in JavaScript to dynamically generate or modify HTML content, whitespace can sometimes have unintended consequences.
  //This is particularly true when dealing with attribute values or any syntax-sensitive parts of HTML.
  //For example, whitespace (including line breaks and spaces) that's introduced into the href attribute's value due to the formatting of the template literal across multiple lines will not be ignored by the HTML parser; instead, it becomes part of the attribute value.
  //This can lead to the browser interpreting the URL incorrectly, because URLs should not contain unencoded spaces or line breaks.

  //This issue of whitespace affecting HTML attribute values is primarily a concern when dynamically generating HTML using JavaScript, especially with template literals or when constructing HTML strings.
  //The same problems generally do not occur in static .html files because template literals include all content inside of them while HTML files generally ignore whitespace around elements or within tags while parsing and attributes in HTML are parsed to ignore whitespace around their values
  //However, even in static HTML files, unnecessary spaces inside the attribute value within the "" may lead to incorrect URLs or broken links.

  // prettier-ignore
  _generateMarkup() {
    //There will be one list element for each ingredient. We will have to loop over the ingredients array and create a list element for each ingredient in the array, and then return a string of our array so that we could print it in our HTML in a formattable way
    //Recall that join has a default separator of a comma
    return `<figure class="recipe__fig">
        <img src="${this._data.image}" alt="${this._data.title}" class="recipe__img" />
        <h1 class="recipe__title">
          <span>${this._data.title}</span>
        </h1>
      </figure>

      <div class="recipe__details">
        <div class="recipe__info">
          <svg class="recipe__info-icon">
            <use href="${icons}#icon-clock"></use>
          </svg>
          <span class="recipe__info-data recipe__info-data--minutes">${this._data.cookingTime}</span>
          <span class="recipe__info-text">minutes</span>
        </div>
        <div class="recipe__info">
          <svg class="recipe__info-icon">
            <use href="${icons}#icon-users"></use>
          </svg>
          <span class="recipe__info-data recipe__info-data--people">${this._data.servings}</span>
          <span class="recipe__info-text">servings</span>

          <div class="recipe__info-buttons">
            <button data-update-to="${this._data.servings - 1}" class="btn--tiny btn--update-servings">
              <svg>
                <use href="${icons}#icon-minus-circle"></use>
              </svg>
            </button>
            <button data-update-to="${this._data.servings + 1}" class="btn--tiny btn--update-servings">
              <svg>
                <use href="${icons}#icon-plus-circle"></use>
              </svg>
            </button>
          </div>
        </div>

      <div class="recipe__user-generated ${this._data.key ? '' : 'hidden'}">
        <svg>
          <use href="${icons}#icon-user"></use>
        </svg>
      </div>

        </div>
        <button class="btn--round btn--bookmark">
          <svg class="">
            <use href="${icons}#icon-bookmark${this._data.bookmarked ? '-fill' : ''}"></use>
          </svg>
        </button>
      </div>

      <div class="recipe__ingredients">
        <h2 class="heading--2">Recipe ingredients</h2>
        <ul class="recipe__ingredient-list">
        ${this._data.ingredients.map(this._generateMarkupIngredients).join('')}
      </div>

      <div class="recipe__directions">
        <h2 class="heading--2">How to cook it</h2>
        <p class="recipe__directions-text">
          This recipe was carefully designed and tested by
          <span class="recipe__publisher">${this._data.publisher}</span>. Please check out
          directions at their website.
        </p>
        <a
          class="btn--small recipe__btn"
          href="${this._data.sourceUrl}"
          target="_blank"
        >
          <span>Directions</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </a>
      </div>`;
  }

  _generateMarkupIngredients(el) {
    return `<li class="recipe__ingredient">
            <svg class="recipe__icon">
              <use href="${icons}#icon-check"></use>
            </svg>
            <div class="recipe__quantity">${
              el.quantity ? fracty(el.quantity).toString() : ''
            }</div>
            <div class="recipe__description">
              <span class="recipe__unit">${el.unit}</span>
              ${el.description}
            </div>
          </li>`;
  }
}

/* Instantiation: new RecipeView() creates a new instance of the RecipeView class.
  Exporting: By exporting the instance directly, the module ensures that any import of this module gets exactly the same instance. This is the core of the Singleton pattern applied through modules.
  
  Single Instance: Anywhere this module is imported, the same instance of RecipeView is reused. This is useful when you need a consistent state across different parts of your application, such as a UI component that manages how a recipe is displayed.
  
  No Constructor Needed: As mentioned in the comment, since the instance is created directly in the module file and exported, there is no need to expose a constructor or create multiple instances elsewhere.
  This can simplify usage and prevent misuse, like inadvertently creating multiple instances where a single shared instance is intended.
  
  No Data Passing on Construction: If the RecipeView class does not require any dynamic initialization data, or if it can initialize itself without external inputs, this approach works well.
  It encapsulates all initialization within the RecipeView itself, potentially fetching its own data or setting up its state independently.
  
  The Singleton pattern ensures that a class has only one instance and provides a global point of access to it. */
export default new RecipeView();
