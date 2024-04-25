import View from './View';
import PreviewView from './PreviewView';
//Since we inherited methods from the parent class, we want to make sure that we name the variables being used within the inherited methods the same
class ResultsView extends View {
  //The parent element depends on where you want to add new results.
  //That <ul class="results"> element is the closest parent that contains all results. Later in the course, we'll implement results as <li> elements, which needs to be contained in either <ul> or <ol> elements, which fits the .results parent class
  _parentElement = document.querySelector('.results');
  _errMessage = 'No recipes found for your query! Please try again';
  _message = '';

  // _generateMarkup() {
  //   //We want to add the 'preview__link--active' CSS class to the recipe that we select to visually show that this recipe is currently selected
  //   //So, we do this by checking to see if result.id is the same as the current ID in our URL, which would be our hash (window.location.hash), and if they are the same then we want to add the CSS class to the markup for that recipe.
  //   //Next, we need to update the resultsView by re-rendering only this changed attribute in our controller. We could re-render the page; however, that would be inefficient and we can use our update function in our View parent class to achieve this

  //   const id = window.location.hash.slice(-1); //We take everything but the first element as it starts with '#'

  //   //this._data is an array of objects containing our results as it's our model.state.search.results. So, we want to loop through our array and return a string for each of the elements
  //   //When you use the # symbol in an href attribute of an <a> tag in HTML, the browser understands it as a directive to navigate to an anchor point within the current document with the given id
  //   return this._data.map(result => {
  //     return `<li class="preview">
  //       <a class="preview__link ${
  //         result.id === id ? 'preview__link--active' : ''
  //       }" href="#${result.id}">
  //         <figure class="preview__fig">
  //           <img src="${result.image}" alt=${result.title} />
  //         </figure>
  //         <div class="preview__data">
  //           <h4 class="preview__title">${result.title}</h4>
  //           <p class="preview__publisher">${result.publisher}</p>
  //         </div>
  //       </a>
  //     </li>`;
  //   });
  // }

  _generateMarkup() {
    return this._data.map(result => PreviewView.render(result, false)).join(''); //the render() method in our View parent class will generate the markup using the function in our PreviewView class, and from this parent class we will add each result to our container (parentElement)
  }
}

export default new ResultsView();
