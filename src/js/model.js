//One big module for all the models
import { API_KEY, API_URL, RES_PER_PAGE } from './config';
import { AJAX } from './helpers';

//State contains all of the data that we need to build our application
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1, //set the page to 1 by default
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

//Receive the recipe from the API and convert it into our own object that we'll use throughout our application, where we'll have the property names match ours.
const createRecipeObject = function (data) {
  const { recipe } = data.data;

  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
    /* This way we only populate the key property if there already exists one. So, if recipe.key is a falsy value, then this operation short-circuits.
    However, recipe.key is a truthy value (meaning it exists), then we create an object that has the key property tied to our recipe.key and return it. Lastly, we use the spread operator extract the enumerable data (key: recipe.key) out of the object.
    Essentially, doing the same as key: recipe.key, only if recipe.key existed in the first place.

    The && operator returns the first falsy value, or the last one (if the first one is truthy). In this case: recipe.key && {key: recipe.key}. We ask "Does the recipe.key exists"? If so, return this object {key: recipe.key}.
    So, we're really destructuring this object {key: recipe.key} in another object
    const recipe = {
      id: 'some id',
      ...{ key: 'some key' }
    };
    And, destructuring will just add the "key" property to the recipe object.
    const recipe = {
      id: 'some id',
      key: 'some key'
    }; 
    
    When you upload a recipe, you also send your API key in the url:
    const data = await sendJSON(`${API_URL}?search=${recipe.title}&key=${API_KEY}`, recipe);
    When the API saves your recipe, it also includes that API key, so when you receive that recipe later, it returns your object which has that API key stored as a property (recipe.key).
    So, only uploaded recipes will have this recipe.key property. 
    
    Generally, when the spread syntax is used in an object, it looks for enumerable (iterable) properties and adds them to the original object (where the spread syntax was used).
    It makes sense even for primitive types, like string or number because they have their object wrappers (that's why we can call methods on strings, numbers, booleans, etc.)
    This doesn't apply to spreading values outside of objects because the spread syntax outside of an object requires the value be iterable, so things like arrays, maps, sets and strings can be spread because they are iterables,
    but normal objects, numbers, boolean values, undefined and null can't be spread because they're not iterable.
    
    Ex of this being used: 

    Creating a shallow copy:
    const originalObject = { a: 1, b: 2 };
    const copiedObject = { ...originalObject };
    console.log(copiedObject); // { a: 1, b: 2 }

    Property Overriding:
    const originalObject = { a: 1, b: 2 };
    datedObject = { ...originalObject, b: 3 };
    console.log(updatedObject); // { a: 1, b: 3 }

    Merging Objects:
    const object1 = { a: 1, b: 2 };
    const object2 = { b: 3, c: 4 };
    const mergedObject = { ...object1, ...object2 };
    console.log(mergedObject); // { a: 1, b: 3, c: 4 }

    Note that the spread operator works only with objects' own enumerable properties. It does not copy non-enumerable properties, methods, or inherited properties (it's only a shallow copy).
    This meaning that the new object is not related to the original object in terms of memory address at all, we would be extracting the enumerable data out of the original object (first step using spread operator)
    and populating them in an entirely new object, if we decide to (storing the results in a new object). */
  };
};
//Fetch recipe data from Forkify API. This function will not return anything, it will change our state object which will contain the recipe property which the controller will have access to.
//This works because the export and imports have a live connection between one another, so any changes in here will be reflected also inside of the controller which imports the state object
//In this case, loadRecipe is not be a pure function due to this side effect, but for the sake of learning we will not overcomplicate things
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);

    //Let's create a new object based on our returned data object with more readable variable names. Basically, let's reformat our object.
    // const recipe = data.data.recipe;
    // const { recipe } = data.data; //destructuring because our variable name will be the same as the property name

    //Currently recipe is linked to data.data.recipe, and now we are refactoring our property names. We are reassigning properties from an existing object (recipe) to a new object, which creates a new object that includes only the properties you specify.
    //The pattern of newPropName: oldObject.oldPropName is particularly useful when you want to rename properties while transferring them to a new object.
    //It may seem redundant when we're choosing the same name as the original property, but we still need to specify which properties we want our new object to have.
    //This sets a clear structure for the new recipe object and can be easily extended for transformations, filtering, or renaming without affecting the original data structure.
    //It also enhances the predictability and maintainability of the code, making it clearer what the expected properties of the recipe object are in the scope where it is used.

    //You're constructing a completely new object. This new object is distinct from the original recipe object referenced earlier.
    //Any modifications to this new object will not affect the original recipe object or data.data.recipe

    //While creating this new object, you're still accessing the properties of the original recipe object.
    //This is possible because in the expression that creates the new object, the right-hand side of each property assignment (e.g., recipe.id, recipe.title) evaluates first.
    //During this evaluation, recipe still refers to the original object, allowing you to retrieve the existing values.

    //Once the new object is created and initialized with values from the original recipe object, you assign this new object back to the recipe variable.
    //At this point, recipe now points to the new object, and the link to the original object is replaced only in this local scope. The original object, data.data.recipe, remains unchanged elsewhere in your program.

    //This approach is particularly useful when you want to ensure immutability or when you need to work with a subset of the properties from an object, possibly transforming or filtering them in the process.
    //By reassigning recipe to a new object, you essentially "decouple" it from the original data structure, allowing safer manipulation without side effects on the original data, thereby promoting safer and more predictable code behavior, especially in larger, more complex applications.

    // state.recipe = {
    //   id: recipe.id,
    //   title: recipe.title,
    //   publisher: recipe.publisher,
    //   sourceUrl: recipe.source_url,
    //   image: recipe.image_url,
    //   servings: recipe.servings,
    //   cookingTime: recipe.cooking_time,
    //   ingredients: recipe.ingredients,
    // };

    state.recipe = createRecipeObject(data); //We set the recipe that we just fetched from the API to our current recipe that we'll load onto our page

    //if we have any element in our bookmarks array that has the same id as the current id that we're loading, then we want to mark the current recipe that we're loading as bookmarked for our view
    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    }
  } catch (err) {
    throw err; //We need our controller to handle the error, so we throw this error back up
  }
};

export const loadSearchResults = async function (query) {
  try {
    //Store the query alongside the results in our state
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`); //we already have a parameter ('?'), so we use '&' for our key. Search and key.

    //change property names for each object inside of our array of objects fetched from the API and we store this new array in our state
    state.search.results = data.data.recipes.map(recipe => {
      //Note that the objects maintain the same order, it just renames the properties to what you specify in here and stores those values.
      //This new object only has the properties that we give it, it will not contain all properties of the object we're mapping to unless we assign all of them.
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
        ...(recipe.key && { key: recipe.key }), //In our search results, if any of the recipes in our current 'page' has the key property, then we want to make sure that this property is copied over so that the ResultsView knows to display our icon on that recipe, indicating that it's our own recipe.
      };
    });
    state.search.page = 1; //When loading a new search result, we want to reset the page to 1
  } catch (err) {
    throw err;
  }
};

//Reach into the state and get the data for the page being requested
//By default we set the page to whatever is saved in our page property just in case we do not receive any arguments for this function.
//Even if it's unlikely, we want to avoid running into any potential errors due to page being set to undefined from not having any argument passed in for it.
export const getSearchResultsPage = function (page = state.search.page) {
  //Let's say for page 1, we want to receive results 0 to 9. And for page 2, results 10 to 19. And so on. Keep in mind that we want 10 results per page. And let's say for page 1 we named 0 as start and 9 as end.
  //To calculate this, we take the page, subtract 1, and then multiply this value by the number of results we want on the page. And for the end, we simply do page * number of results
  //So, page 1. Start = (1 - 1) * 10 = 0. End = 1 * 10 = 10. Page 2. Start = (2-1) * 10 = 10. End = 2 * 10 = 20. Page 3. Start = (3-1) * 10 = 20. End = 3 * 10 = 30.
  //End would be where we are starting off from, we wouldn't need to add one because remember that the second parameter in slice is exclusive.

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  //Let's save our page number
  state.search.page = page;
  return state.search.results.slice(start, end);
};

//To update the servings, we need to reach into our state and change the quantity of each of the recipe ingredients
export const updateServings = function (newServings) {
  //We could use map to create a new array and override our current state.recipe.ingredients to the clone, but let's just mutate the underlying array.
  //Our API gives us a quantity within each ingredient object within recipe.ingredients array, so this is what we want to modify
  state.recipe.ingredients.forEach(ing => {
    //The formula to calculate the new quantity for our new serving is newQuantity = (oldQuantity * newServings)/oldServings. For example, if we need 2 tablespoon of salt for 1 serving, and we increase the serving to 2 we calculate this by 1 * (2/1) = 2
    //Multiplication of oldQuantity and newServings: Here, you are scaling the quantity of the ingredient directly in proportion to the increase in servings. If the number of servings doubles, the quantity of each ingredient also doubles.
    //Division by oldServings: This step adjusts the scaled quantity to ensure it is in proportion to the original serving size. If your original recipe quantity was calculated for a certain number of servings, dividing by this number aligns the scaled quantity correctly. In this example, since the original servings (oldServings) is 1, dividing by 1 does not change the number.
    //By dividing by the old serving size, you're adjusting the multiplication factor to reflect the base from which you are scaling up or down. This keeps the ingredient proportions exactly aligned with the increase or decrease in servings.
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  //Update the servings in the state. We do this at the end as we needed our oldServings to calculate the quantity of each ingredient for our newServings
  state.recipe.servings = newServings;
};

//Persist bookmarks data across different page loads using local storage. We will want to update our localStorage everytime we add/remove a bookmark.
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
  //However, note that just because the data is stored in our localStorage that doesn't mean that we'll still have that persist in our bookmarks array.
  //So, basically, when the page is loaded, we want to transfer the data stored in the localStorage, if there is any, to our bookmarks array and render it.
  //We will write this logic in our init function.
};

/* Add a recipe that we want to bookmark (add into our bookmark array in our state) and mark it as bookmarked */
export const addBookmark = function (recipe) {
  //Add bookmark
  state.bookmarks.push(recipe);

  //Mark current recipe as bookmarked. This will create the bookmarked property on state.recipe for us if it doesn't already exist.
  //When evaluating this bookmarked property in the view (or anywhere else), if we haven't set this property to true yet then it will evaluate to undefined, which is a falsy value.
  state.recipe.bookmarked = true;
  persistBookmarks();
};

//When we add something, we receive the entire data to add the data. However, when we delete something, we only need the ID. We don't want to pass in unnecessary data as this will lower the runtime and efficiency of our function.
//So, using only the ID, we will delete the recipe that has this ID from the bookmarks array
export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(recipe => id === recipe.id); //find the element in the bookmarks array that has the same id as the passed in id

  //JS passes by value, meaning if you pass in an object or a primitive value, actually trying to change what the identifier is pointing to will not persist. However, with objects, the properties of the object is passed by reference.
  //So modifying the bookmarked property in this object inside of the bookmarked array will actually modify that property in the object.
  //unlike primitive values, which are passed by value in JS meaning copies of the value are passed.
  state.bookmarks[index].bookmarked = false; //set the bookmarked property to false for this recipe.
  state.bookmarks.splice(index, 1); //remove this recipe from our bookmarked array. we only want to delete 1 element starting from this index

  persistBookmarks();
};

//Once the page is initially loaded, we want to grab the data from localStorage, store it in our bookmarks array, and re-render this data. We will run this inside of our init() function.
export const restoreBookmarks = function () {
  const storage = localStorage.getItem('bookmarks'); //We don't directly store this in our state as this data might not even be defined at all (undefined) if we haven't added or removed any bookmarks.
  //We want to make sure that this is defined. We'll also make sure that if it's empty, then we'll just keep our initial empty array.
  if (storage?.length > 0) state.bookmarks = JSON.parse(storage); //Parse converts the string back to an object, which we will store in our state
};

//Send our custom personal recipe to our API. This function will make a request to the API (so it will be async as we'll need to await this request).
export const uploadRecipe = async function (newRecipe) {
  //First, we'll need to take the raw data that we've pulled from the form and transform it into the same format as the data that we grab out of the API.
  //We notice that the ingredients property in our received data from the API is an array that stores an array of ingredient objects. However, from our form, we simply receive a string in the specified format to store this information.
  //So, we're going to have to first convert this by taking our newRecipe object, extract the ingredients data, and store them in a new array.

  //So, let's convert the object that contain the data that was passed into the form into an array

  //Asynchronous functions in JavaScript return promises, and these promises can either resolve successfully or reject due to an error.
  //When an async function throws an error, it returns a Promise that gets rejected with that error.

  //A try-catch block allows you to catch errors that occur during the asynchronous operations performed within the async function
  //We could have our higher-level function (controlAddRecipe) handle the error with our rejected Promise as the error thrown will propagate up naturally.
  //However, we are going to utilize localized error handling rather than relying on higher-level handling as a design choice.
  //We want to throw different personalized Error objects based on the error that rejects the Promise, which localized error handling is useful for.
  try {
    //First, we filter through the entries that are ingredients and have a value (entries are a key/value pair), and then we use map() to create an object storing the ingredients so that we could ultimately return our object into our newly created array
    const ingredients = Object.entries(newRecipe)
      .filter(
        entry => {
          // console.log(entry);
          return entry[0].startsWith('ingredient-') && entry[1];
        } //the key should start with 'ingredient-' and the value should not be an empty string. Ex: [ingredient-1, '1,gram,salt']
      )
      .map(ingredient => {
        // const ingArray = ingredient[1].replaceAll(' ', '').split(','); //Now, we take the data out of the values of our ingredient- keys and destructure them.
        //However, we want to consider if an ingredient has a whitespace in it, such as 'tomato sauce', which replaceAll() is not allowing
        const ingArray = ingredient[1].split(',').map(str => str.trim()); //Instead, we will split the string into multiple parts which will return an array, and then we can loop over this array and just trim each of the elements
        //For example, if we have '1,gram,tomato sauce', then it will convert to [1,gram,tomato sauce], and then it will trim each of these elements to remove whitespace from the beginning and end of the string.
        //So, now 'tomato sauce' would retain its whitespace between tomato and sauce.

        //We also don't want unit and description to ever be undefined in the case of an empty string. We should always receive 3 commas, as specified for the format.
        if (ingArray.length !== 3) {
          throw new Error(
            'Wrong ingredient format! Please use the correct format.'
          ); //We have converted our strings into an array, separated by the inputted commas by the user. Therefore, there should be exactly 3 elements in our array.
        }
        //We create variables named quantity, unit, and description and assign quantity to ingArray[0], unit to ingArray[1], and description to ingArray[2]
        const [quantity, unit, description] = ingArray;

        //One thing to note in our API is that when quantity is empty, we want it to be stored as null to match the API. Also, quantity should be stored as a Number.
        //We return an object with the quantity, unit, and description properties holding the values that we just assigned to them previously that we're returning into our ingredients array using map(). Remember {unit} is the same as {unit: unit}.
        return { quantity: '' ? null : Number(quantity), unit, description }; //we return the quantity, unit, and description of each ingredient stored in an object and store this in our array
      }); //First, we convert our array into a string with ',' as the separator between elements while trimming out any whitespace from the string. In the case of ['  1  , gram , salt  '], we want to trim the whitespace between the separators and from the beginning and end.
    //We do this by using the replaceAll() function to ensure all the white spaces are removed because trim would only remove the whitespace from the very beginning and very end of the string.

    //Now it's time to create the object that we will use to pass into our API. We're matching the properties of our new recipe to the properties of objects created by our API.
    const recipe = {
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      cooking_time: Number(newRecipe.cookingTime),
      servings: Number(newRecipe.servings),
      ingredients, //This is the same as ingredients: ingredients
    };

    //Now we can send over our recipe to our API
    const data = await AJAX(
      `${API_URL}?search=${recipe.title}&key=${API_KEY}`,
      recipe
    ); //refer to documentation to know what url path to use for our POST request as well as to generate our own unique key
    //Remember that our API sends our recipe back to us so we're going to await for that. Note that the uploaded recipe will automatically have an ID generated for it from the API and will have it stored as the recipe.id property.

    //Now that we've uploaded our new recipe, it would make sense to now render this new recipe to our user interface after closing the window.
    //So, we will now convert this returned recipe to the format that we've been using for our application. Which will be the same as what we did in loadRecipe, so we'll create a reusable function (createRecipeObject) for this.
    state.recipe = createRecipeObject(data); //We set the current recipe that we're looking at to the recipe that we just uploaded

    //We also want to be sure to bookmark our uploaded recipe and also tie our uploaded recipe to our API_KEY

    //First, we'll mark our uploaded recipe as a bookmark and store our bookmarks in localStorage
    addBookmark(state.recipe);
    persistBookmarks();
    //Finally, we'll add our API_KEY to our object. We could do that manually; however, we'll do that in our createRecipeObject() function.
  } catch (err) {
    throw err;
    //Rethrow our error because we want our higher-level function that's invoking this function to know that this Promise has been rejected with the appropriate error object as the value.
    //Otherwise, our Promise would be considered 'fulfilled' since we'd be catching the error and handling it internally, so we need to rethrow the error
  }
};

/* Note that when you use import * from 'module' in JavaScript to import everything from a module, you are not only importing the exported parts but also running any top-level code that is executed in that module.
This includes any function calls, variable assignments, or other operations that happen at the top level when the module is first evaluated.

Module Evaluation: When a module is imported for the first time, JavaScript evaluates the module from top to bottom. This evaluation includes running any top-level code.
Exports Gathering: After evaluating, JavaScript collects any exports defined in the module, which are then available to be imported by other modules.
Code Reuse: If the same module is imported elsewhere (even using import * or any other form), the module is not evaluated again. Instead, the already evaluated state is reused. This means that the top-level code is executed only once, the first time the module is loaded.

This behavior highlights the importance of being cautious with what you place at the top level in your modules, especially operations with side effects, since they will be executed on module load. */
