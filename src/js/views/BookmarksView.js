import View from './View';
import PreviewView from './PreviewView';

//Since we inherited methods from the parent class, we want to make sure that we name the variables being used within the inherited methods the same
class BookmarksView extends View {
  //Our bookmark previews are <li> elements, which needs to be contained in either <ul> or <ol> elements, which fits the .bookmarks__list parent class
  _parentElement = document.querySelector('.bookmarks__list');
  _errMessage = 'No bookmarks yet! Find a nice recipe and bookmark it :)'; //Go back to our default message indicating there are no bookmarks added yet once all bookmarks are removed and our passed in bookmarks array is empty.
  //If the user had previously added bookmarks, overriding our default HTML message, and then removed all bookmarks, this would show as we'd be passing in an empty array to our render() method (which we call when adding/removing bookmarks)
  //When the user either click adds/removes a bookmark, this would call the render() function and we would be trying try to access the passed in bookmarks array, which would be empty (in this case) prompting the error message.
  //Note that we only call update() when adding/removing the --active class attribute to the bookmarks (and search results, and updating the servings. but nothing that should trigger an error message)
  _message = '';

  //However, we don't actually want PreviewView to render the markup as we want our BookmarksView or ResultsView class to ultimately do that inside of their appropraite containers.
  //We only want PreviewView to generate the individual markup for each element that we pass into it. So, we are going to resolve this by having a check in our render function.
  //We'll add a parameter called render which, by default, will be set to true. However, if PreviewView calls this render method, then render will be set to false.
  //When render is set to false, we will simply return the markup for the passed in element.

  //But why not call generateMarkup directly rather than PreviewView.render(element, false)?
  //We still need to set this._data in our render method to the data that's passed in (our bookmark that we want to add as a child to our parentElement in this case)
  //This is so that in PreviewView, we are able to actually generate the markup by accessing the properties inside of the bookmark (or any object) that we pass into the render method.

  //Now, BookmarksView and ResultsView are essentially the same in terms of functionality in generating their markups and so we encapsulated that logic within a child class.
  //We kept what differentiated them, however, by maintaining different messages and a different parentElement (container).
  _generateMarkup() {
    return this._data
      .map(bookmark => PreviewView.render(bookmark, false))
      .join(''); //the render() method in our View parent class will generate the markup using the function in our PreviewView class, and from this parent class we will add each bookmark to our container (parentElement)
  }

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }
}

export default new BookmarksView();
