import View from './View';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');
  //The markup that we create is based on the page that we're on

  //Note that because of our render method in our View class, we have access to what we passed in to the render function from our controller using the instance of this object as this._data ('this' referring to the instance of this class that called this method, which would be PaginationView)
  //Recall: PaginationView.render(model.state.search). And since we are following a Singleton pattern, all instances of this class would be referring to the same instance object. This is true for all other View classes, excluding the parent since we didn't instantiate it.
  //All view classes have one object instantiated for them appropriately.
  _generateMarkup() {
    const resultsLength = this._data.results.length;
    const resultsPerPage = this._data.resultsPerPage;
    //In order to know where we stand in terms of the pages, we must know how many pages there are in the first place.
    const numPages = Math.ceil(resultsLength / resultsPerPage); //We may get a decimal, so we want to round this to the highest integer. Not all pages need to be filled with the entire 10 elements.
    const currPage = this._data.page;

    const prevButton = `<button data-goto="${
      currPage - 1
    }"button class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
            </svg>
         <span>Page ${currPage - 1}</span>               
        </button>`;

    const nextButton = `
    <button data-goto="${
      currPage + 1
    }"class="btn--inline pagination__btn--next">
      <span>Page ${currPage + 1}</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-right"></use>
      </svg>
    </button>`;

    //1. If we're on the first page, we don't want to have a back button. Since we'll also be on the first page in the case that there are less than 10 results, we need to consider this as well.
    if (currPage === 1 && numPages > 1) {
      return nextButton;
    }

    //2. If there are less or equal results than results per page then we don't want to have a next button as we only need one page
    //3. Also, if we're on the last page, then we don't want to have a next button either
    if (resultsLength <= resultsPerPage || currPage === numPages) {
      return prevButton;
    }

    //4. If we're on a middle page, we want both buttons
    return `${prevButton}${nextButton}`; //Note that in HTML, spacing and tabs (whitespace characters) do not affect the way the content is rendered in a browser.
    //Whitespace inside HTML tags (between attributes, for example) is not sensitive. You can use spaces or tabs to improve readability without affecting how the tag is processed
    //The main exceptions to this rule in HTML are elements like <pre> and CSS properties that control the rendering of whitespace, which would be specifically designed to alter how whitespace is handled.
  }

  //We're going to use event delegation because there will be two buttons, but we don't want to listen to each of them individually when we could use event delegation instead
  addHandlerClick(handler) {
    //Add event listener to parent element
    this._parentElement.addEventListener('click', function (e) {
      //We do not immediately call the handler because we need to figure out which button was actually clicked
      //So, first we create a btn element to store the closest button element to the clicked target if we click within the button element
      //This is important as we could accidentally click on the span, svg, or use elements within the button element but we want it to register as clicking on the actual button itself.
      //The button element has child elements, and even if we click on the child elements we want it to register as the button element (the parent element that we're selecting)
      //Recall that the closest method is similar to querySelector but instead of searching down the tree for children, it searches up the tree for parents
      const btn = e.target.closest('.btn--inline'); //Notice that the next and prev buttons share this common class.

      //We select the button so that we know if we need to move forward or back a page. We need to establish a connection between the DOM and our code. We can achieve this using custom data attributes.
      //So we will create custom data attributes for each of the buttons which will contain the page that we want to go to
      //Using that, we can read that data and go to that exact page

      if (!btn) return;

      //So, inside of our HTML, before establishing our class we add: data-goto="${currPage+1}". Now, we can actually know what page to go to from the button by reading this property.
      //The use of data-* attributes in HTML is a handy way to store extra data on standard HTML elements, and it's perfectly suited for the kind of dynamic, client-side functionality that we need.
      //We are setting a data-goto attribute to indicate which page a button should navigate to when clicked. This is a great approach for implementing pagination or any kind of stepwise navigation on a web page.
      const goToPage = Number(btn.dataset.goto); //Note that this datasets return a string, so we will have to convert this to a number.

      //However, note that since we set this eventListener on the parent element that the dataset will try to be accessed even if we click outside of the 'button' element, and we won't be able to find any '.btn--inline' parent elements.
      //So, we will have to account for that using the if statement above (guard clause)

      //Now that we have the number of the page, we can pass that number back to the controller by passing it into the handler when we call the handler
      //From the controller, we can pass that number into our getSearchResultsPage() function, which will load the searchResults for the passed in page
      handler(goToPage);
    });
  }
}
export default new PaginationView();
