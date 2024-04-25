import * as model from './model';
//We can immediately import the views as we are exporting a singular instance of the class object already (singleton pattern), one benefit is that we don't have to instantiate the object ourselves.
import RecipeView from './views/RecipeView';
import SearchView from './views/SearchView';
import ResultsView from './views/ResultsView';
import PaginationView from './views/PaginationView';
import BookmarksView from './views/BookmarksView';
import AddRecipeView from './views/AddRecipeView';

//One big module for all the controllers

//To ensure that the paths to your assets remain correct after bundling, you should import them in your JavaScript or TypeScript files. This allows the bundler to resolve the paths correctly and to include the assets in the output dist folder.
//If you don't import your assets explicitly in your JavaScript or CSS files when using a module bundler, the bundler typically won't include those assets in the output dist directory.
//This is because most module bundlers are not aware of these assets unless they are explicitly referenced in the code.
// Module bundlers like Webpack, Rollup, and Parcel work by creating a dependency graph of all the modules that your application uses. This graph is built based on the explicit import and require statements in your code.
//If an asset is not imported or required somewhere in your code, the bundler doesn't know about its existence and consequently doesn't include it in the bundle.
//Automatically including every file from the source directories without checking for explicit references would lead to bloated and inefficient bundles, containing potentially unused assets.
//Importing assets gives developers control over which assets are included in the build and how they are handled.

//What Happens If You Don't Import Assets?
//Assets that are not imported remain untouched in their original directories. They won't be processed or moved to the dist directory, nor will they be optimized or hashed for cache busting.
//If you want these assets to be available in the dist directory without importing them, you would need to manually copy them or configure your bundler to include specific directories or files.

//To ensure that all your assets are handled correctly by the bundler, always prefer to import them directly in your code where you use them.
//This not only ensures they are included in the output but also lets you take advantage of the bundler's features for handling them efficiently.

//Now, icons will be the path to the new icons file in the 'dist' folder. Everytime we referred to the previous icons path, we will now use the icons variable instead which contains the path of our new icons file

//Polyfilling to ensure that most old browsers are supported by our application. We could pick which features we want to polyfill, and only import those specific features but let's just polyfill everything.
import 'core-js/stable'; //Polyfilling all other features except async/await.
import 'regenerator-runtime'; //Polyfilling async/await
import BookmarksView from './views/BookmarksView';
import { MODAL_CLOSE_SEC } from './config';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

//This is coming from parcel. This enables the hot module replacement, which reloads the modules that changed without refreshing the whole website. This is helpful in development as this sets up the module to accept changes dynamically without reloading the entire page
// if (module.hot) {
//   module.hot.accept();
// }

//Since we are now in a controller, instead of naming this function showRecipe we name it controlRecipe as it's more of an accurate name as to what it's doing now
const controlRecipes = async function () {
  try {
    //Loading Recipe

    //We want to dynamically get the recipe ID from our hash. Note that getting the ID is more about application logic rather than business logic so we leave this in the controller.
    const id = window.location.hash.slice(1); //window.location gets our current URL and .hash grabs the '#...' portion of the URL, which contains our recipe ID. But we don't want the '#' char, we want everything after it so we use the slice method

    //if id is an empty string, we want to leave this function so that way we're not rendering the spinner and trying to render a recipe that doesn't exist
    if (!id) return;

    RecipeView.renderSpinner(); //Indicate that we're loading the recipe by rendering the spinner first

    //0. Update results view to mark selected search result when loading the recipe as well as our bookmarks view to display which bookmark (if any) we're actively on if we choose to activate the 'hover' class on the bookmarks button on the nav-bar
    ResultsView.update(model.getSearchResultsPage()); //We want to pass in our current 'page' on our search results as we want to pass in the same data that we used to render our search results.
    //However, note that the update function only updates the text and attributes that have changed.
    //In the case of loading a new recipe, we would be adding a class attribute to the selected recipe to indicate that it is the current recipe we are on by adding the '--active' class attribute and removing the '--active' class attribute from the previous recipe.
    //This is evaluated through our logic when generating each individual markup for our individual search results.
    //Re-rendering the entire search results would work as well; however, it would be inefficient as we only need to update one attribute when clicking on a recipe from the search result.

    //1. Updating Bookmarks View
    BookmarksView.update(model.state.bookmarks); //Update our bookmarks view when loading a recipe to show that we are currently on this recipe by updating the --active class attribute appropriately (which is the same as what we did above for our ResultsView)
    //This is due to our logic when deciding whether to add the --active class when generating the markup, similarly to how we did with our search results
    //We are going to create a child class for BookmarksView and ResultsView named previewView (since both of them share the preview class in common) to help create each separate list option (PreviewView)
    //with the BookmarksView or ResultsView being the parent in order to encapsulate the generateMarkup functionality, which both classes have in common

    //2. Loading Recipe
    //Recall that loadRecipe is an async function, which means that it is going to return a Promise. So we have to await that Promise so that we are actually working with the data in the next code rather than an unfulfilled Promise with an undefined value.
    await model.loadRecipe(id);

    //3. Rendering Recipe
    RecipeView.render(model.state.recipe);
  } catch (err) {
    console.log('here');
    RecipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    //Load spinner when searching for a recipe
    ResultsView.renderSpinner(); //ResultsView doesn't have renderSpinner directly inside of it, though it extends the View class meaning that it inherits the methods from the View parent class

    //1. Get search query
    const query = SearchView.getQuery();

    if (!query) return;

    //2. Load search results
    //We don't need to store the result anywhere. Just like with the loadRecipe function above, we are not returning a value and we don't need to store the undefined value anywhere. All we're doing with this function is manipulating state
    await model.loadSearchResults(query);

    //3. Render results
    // ResultsView.render(model.state.search.results); //We no longer want all of the results. We only want to display the results based on the page.
    ResultsView.render(model.getSearchResultsPage());

    //4. Render initial pagination buttons
    //While displaying the search results, we also want to display the pagination buttons to browse through the search results
    PaginationView.render(model.state.search);
  } catch (err) {
    ResultsView.renderError();
  }
};
//Our PaginationView.addHandlerClick (callback function) calls this function and passes in the goToPage
const controlPagination = function (goToPage) {
  //Our result is already loaded since we've called controlSearchResults to load our searches and controlRecipe to load our recipe. Now we are just accessing the 'pages' which are basically just the different parts of the results array in our state (different range of indexes)
  //So, once we are on the page we need to render our new search results as well as our new buttons
  ResultsView.render(model.getSearchResultsPage(goToPage)); //This call on render again will overwrite the markup that was previously there as render calls this._clear. We are passing in the appropriate elements on our 'page' to be rendered.
  PaginationView.render(model.state.search); //This will also overwrite the previous markup that was previously there due to the this._clear call and will add in our new markup based on our currPage (logic written in PaginationView)
  //Keep in mind that before any new HTML is inserted in the page, the appropriate _parentElement in the instance that's calling the method is first cleared so then the render overwrites everything that was previously there by putting the new content in the same place
  // as it's the same instance calling this chain of methods
};

//Implement feature of updating recipe servings
//Our RecipeView.addHandlerUpdateServing (callback function) calls this function and passes in the servings
const controlServings = function (newServings) {
  //Update the recipe servings (in state). Basically, updating the underlying data with the passed in amount of servings.
  model.updateServings(newServings);
  //Update the RecipeView (the view that's impacted by updating the servings). There's no need to create a ServingsView because the buttons to modify servings as well as the updated recipe is all within the RecipeView.
  //All we have to do is re-render the recipe view with the new servings and new quantites. However, this does cause a bit of a visual problem as every time that we update the servings,
  //the things on our page that would take longer to load would have to reload each time which is inefficient and not visually pleasing.

  //However, in order to resolve this, we could develop an algorithm that will update (re-render) the text and attributes in the DOM and leaving everything else the same, basically meaning we wouldn't have to re-render everything else.
  //We will be doing this inside of an update method in our View as we want our other View's to have this method as well.
  // RecipeView.render(model.state.recipe);
  RecipeView.update(model.state.recipe);
};

//Whenever a new bookmark is added, we want to render our BookmarksView with all of the bookmarks (from our bookmarks array). This is activated when we click the button to add/remove a bookmark.
//Do not mistake this with the Bookmarks button on the nav__btn, which is toggled using the --hover style attribute between the HTML and CSS.
const controlToggleBookmark = function () {
  //Add/Remove bookmark
  //If this recipe is not already bookmarked and we click on the bookmark icon, then we want to add this recipe to our bookmarks array and set this recipe to bookmarked
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe); //add the current recipe on our page to our bookmarks
  }
  //Else, this recipe is already bookmarked and we want to remove this recipe from our bookmarks array and set this recipe as not bookmarked
  else {
    model.deleteBookmark(model.state.recipe.id);
  }

  //Update RecipeView
  RecipeView.update(model.state.recipe); //update recipe view on our page so that the added attribute to fill in the bookmark icon is added. When we click the bookmark icon, it's href attribute changes which the update() method will notice and change the value of the href attribute to add the '-fill' CSS attribute

  //Render Bookmarks. Though we can't actively see the BookmarksView as the CSS is not currently displaying the information, we are still rendering the data for if/when we do want to see it.
  //Note that the hover event is handled in the sass/_preview.scss file where we have enabled the styling for hover for our markup, which does have class="preview"
  //Similarly to how when you render the search results data, you aren't displaying it all at once, you only display the search result that you click on due to how the CSS is set up.
  //The search results also have class="preview", which is why these two have such similar behavior.
  BookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  BookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //Let's first display a loading spinner to show that we're currently waiting to complete the interactions between our program and the API to upload the data.
    //Remember, these interactions being that we send our new recipe object to the API to actually upload it, we receive back our uploaded recipe with our key, we save our recipe in our state, display it on our page, and save it to our bookmarks
    AddRecipeView.renderSpinner(); //display the spinner in our form (parentElement)

    //Upload new recipe data. Since we're going to be calling an asynchronous function, we're going to have to await for the value of the returned Promise.
    //Since uploadRecipe is an async function and if you call it without await, it returns a Promise immediately, which is not yet resolved.
    //Without await, JavaScript will not wait for uploadRecipe to resolve or reject, and the try-catch block won't catch errors that occur asynchronously after the initial call unless you have another try-catch inside of uploadRecipe.

    //This is because JavaScript uses an event-driven, non-blocking I/O model. This means it will continue executing other scripts while waiting for asynchronous operations (like network requests, timers, I/O operations) to complete.
    //Without await, the Promise executes independently of the synchronous control flow. The async function does not pause. It continues to the next line of code immediately after starting the Promise.
    //If the Promise rejects, the rejection occurs outside the current synchronous control flow of the async function. The error is thrown in the Promise's context, not in the context where the try-catch block exists.
    //Since the error is not thrown within the try-catch block but in an asynchronous callback managed by the Promise, it becomes an uncaught Promise rejection unless specifically caught with a catch() handler inside of the async function (uploadRecipe in this case)

    //The error inside the Promise is not caught by the try-catch block because the error occurs outside the synchronous control flow of the controlAddRecipe function.
    //The Promise rejection happens asynchronously after the controlAddRecipe function has already executed its try-catch block.
    //Therefore, to handle errors from asynchronous operations correctly, you must use await within a try-catch block, or you must attach a catch() handler directly to the Promise.
    //If you actually want to use the value of the Promise, you'll need to await for that Promise to finish settling, however.
    await model.uploadRecipe(newRecipe);
    //Render recipe
    RecipeView.render(model.state.recipe); //Let's render our new uploaded recipe onto our page (remember that we store it in our state so that it'll be ready to be rendered as it's our current relevant recipe)

    //Success Message. Let's first display a nice success message and then hide the form and overlay.
    AddRecipeView.renderMessage(); //Recall that in our View, the renderMessage function defaults it's argument to this._message, which will be AddRecipeView's ._message property
    //Our success message will be replacing the previous content from our _upload parentElement from AddRecipeView.
    //Note that our _upload parentElement is the form that we're displaying, so we'd clear out our previous HTML content for our success message. Our form element would now hold our new markup (success message).
    //Replacing the inner content of a <form> element with new markup that doesn't contain form-related elements (like input, select, textarea, button, etc.) would mean the <form> no longer contains interactive form fields

    //Also note that our overlay and windows are both div, meaning they hold sections of our HTML page. Toggling between hiding and displaying these will either hide or display everything within that section.
    //We manipulate this by using the 'hidden' class to toggle between actually displaying our window and overlay or hiding it.
    //Our window would include our parent_element (container), so we would be able to toggle between displaying and hiding the contents within this container.
    //The window would be in the section that displayed/stylized our form, our success message, etc and the overlay would be in the section that displayed/stylized our background.

    //Remember that we also need to update our URL to point to our new uploaded recipe's ID so that if we reload the page, we will remain on the newly uploaded recipe's page
    window.history.pushState(null, '', `#${model.state.recipe.id}`); //We use the history API in our browser and use the pushState method which allows us to change our URL without reloading the page
    //History API allows manipulation of the browser session history, meaning the pages visited in the tab or frame that the current page is loaded in

    /* 
    window.history.pushState(state, title, url)
    state is an object associated with the new history entry created by pushState(). When the user navigates to this new state, a popstate event is fired, and the state object can be accessed within the event handler through event.state. This is a way to keep track of the state of the app without having to rely on the server or hidden form fields.
    title is currently ignored by most browsers and can be set to an empty string (""). It is intended to be the title of the new history entry.
    url is the new URL you want to add to the browser history. The URL provided to window.history.pushState() completely replaces the current URL displayed in the browser's address bar, except for the protocol, hostname, and port number which must remain the same due to the same-origin policy.

    For example, if your current URL is http://yourdomain.com/new-page.html and your url passed into the argument is "/old-page.html", the browser's address bar will update to http://yourdomain.com/old-page.html.
    This happens without a page reload, and the browser history will have a new entry, enabling the user to press the back button to go back to http://yourdomain.com/new-page.html.
    Note that the new URL must be of the same origin as the current URL; otherwise, pushState() will throw an exception. This parameter is optional; if omitted, it defaults to the current URL. */

    //We also need to re-render our BookmarksView with our new uploaded recipe
    BookmarksView.render(model.state.bookmarks); //Remember we updated our state.model.bookmarks array in uploadRecipe(). We must use render() rather than update() as we're adding a new bookmark element to our container. Update doesn't work for adding or removing, only modifying.

    //Finally, remember that we need to mark our uploaded recipe with our key to mark this submitted recipe as our own. Also, we need to make sure that only we can access our own recipes.
    //We'll do this by attaching our key to our API queries, so that the recipes that we receive from our API will also include those associated with our key.
    //We need to do this in our model by attaching our key inside of the AJAX calls when fetching our data from our API.
    //This will enable us to load all of our recipes including the ones that contain our own key (remember that the API stores our key inside of our uploaded recipes)

    //We want to visually show which recipes are our own and also have our icon show for our own recipes
    //We're going to do that in our PreviewView, so that our search results and bookmarks display our icon for our own recipes (remember that ResultsView and BookmarksView generates its individual markups using PreviewView).
    //We're also going to do that in our RecipeView so that we display our icon if our current recipe has the key property, which would indicate that we're displaying our own recipe

    //You can see the logic implementing this when generating the markup for these views (basically, if we have the key property inside of our current recipe, then we don't hide our icon. Otherwise, we hide it)
    //Lastly, we make sure that when creating the SearchResult objects in our model for our results array, we make sure to maintain the key property in our objects if it already has one (meaning it's a recipe that we uploaded)
    //so that our view knows to display it as ours in the search results

    //We don't have to do this for bookmarks as we just push the entire recipe object into our bookmarks array if we want to add it as a bookmark, or it will automatically be done if it's our own recipe.
    //We needed to do that for our search results because we needed to display all of the recipes that matched our search query. With bookmarks, we're just pushing whatever recipe is either ours or ones that we want to bookmark.

    //Close form window
    setTimeout(function () {
      AddRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000); //Multiply 1000 to convert our seconds to milliseconds (which setTimeOut expects)
  } catch (err) {
    console.error(err);
    //We could actually just pass in our errMessage as we accounted for that ability in the renderError function in our View. By default, the errMessage would be from this._errorMessage, but we could also specify in our own message
    //So, that's we're going to do in this case as we want to display different error messages based on the error that was thrown
    AddRecipeView.renderError(err.message);
  }
};

//Notice the naming convention of 'addHandler...'
const init = function () {
  model.restoreBookmarks();

  //We ensure that the BookmarksView is rendered as soon as the page loads.
  //The issue to look out for was that our currDOM on the page was not yet rendered with the populated bookmarks array from localStorage in our BookmarksView
  //And when we'd try to update the currDOM with the newDOM, which contained the new populated bookmarks array, this would cause an error.
  //The newDOM would contain the new populated bookmarks array because we'd be calling _generateMarkup to create our new markup, which would generate a markup based on the current data from our state which would include the bookmarks array from localStorage.
  //However, our currDOM would remain as whatever we'd currently have on the page upon immediately loading which, at the time, hadn't generated any updated markups for our BookmarksView with the bookmarks array from localStorage yet, let alone inserted them into the DOM,
  //which would be necessary as our update() method compares what's currently on our DOM right now with the updated markup that's going to be inserted into the DOM so that it knows what to "update".

  //Since our newDOM would have the previously populated bookmark list which the currDOM doesn't have, this would cause an error as we'd be trying to set the text property of an element that hasn't been created yet on our current DOM
  //Making sure that the BookmarksView is immediately rendered with the new populated bookmarks array as soon as the page loads resolves the issue that the update method unsuccessfully tries to set the text content of a non-existent element at the time the page loads.
  //Note that we call the update() method inside of controlRecipes, which is also called once the page loads which is why this it is essential that we first render the BookmarksView immediately once the page loads (even before controlRecipes is called)
  //So that when we do call the update() method to provide stylization for the current --active bookmark, we have the same amount of elements in our current bookmark as our new bookmark and we won't run into the same issue.

  //Adding and removing bookmarks works completely fine as we use the render() function to perform those, not the update().
  //We only called the update() on the BookmarksView for the functionality of keeping the '--active' (CSS style to display current bookmark selected) functionality working appropriately.
  BookmarksView.addHandlerRender(controlBookmarks);

  RecipeView.addHandlerRender(controlRecipes); //we set up our event listeners. controlRecipes is our subscriber as it knows how to react when the events happen. addHandlerRender is our publisher as it knows when the events happen
  RecipeView.addHandlerUpdateServings(controlServings);
  //Note that with below, we still need to make sure the bookmarked flag persists in our view. Because everytime we re-render a recipe, we are getting the recipe from our API rather than from our state.
  //To resolve this issue, we will use our state to mark each recipe as bookmarked if it's in our bookmarks array. And our View will see whether our current recipe on display has the bookmarked property set to true or false (by default).
  //We resolve this in loadRecipe in our model.
  RecipeView.addHandlerToggleBookmark(controlToggleBookmark);
  SearchView.addHandlerSearch(controlSearchResults);
  PaginationView.addHandlerClick(controlPagination);
  AddRecipeView.addHandlerUpload(controlAddRecipe);
};

init(); //initialize everything that needs to be initialized when starting our program
