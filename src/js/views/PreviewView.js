import View from './View';
import icons from 'url:../../img/icons.svg';

//Since we inherited methods from the parent class, we want to make sure that we name the variables being used within the inherited methods the same.
//We are using this to build our preview element, so we don't need the message variables
class PreviewView extends View {
  _parentElement = ''; //We are not storing this in any container, we are going to return the preview elements to either the BookmarksView or ResultsView to insert into their appropriate containers

  //Note that we aren't using map(), so this will only generate the markup for one preview element. We'll be calling the map() method inside of the views that are going to use this method.
  _generateMarkup() {
    const id = window.location.hash.slice(-1); //We take everything but the first element as it starts with '#'

    return `<li class="preview">
        <a class="preview__link ${
          this._data.id === id ? 'preview__link--active' : ''
        }" href="#${this._data.id}">
          <figure class="preview__fig">
            <img src="${this._data.image}" alt=${this._data.title} />
          </figure>
          <div class="preview__data">
            <h4 class="preview__title">${this._data.title}</h4>
            <p class="preview__publisher">${this._data.publisher}</p>

          <div class="preview__user-generated ${
            this._data.key ? '' : 'hidden'
          }">
          <svg>
            <use href="${icons}#icon-user"></use>
          </svg>
        </div>
        </div>
        </a>
      </li>`;
  }
}

export default new PreviewView(); //We do want to instantiate this child class as we want to directly call its methods rather than having anything inherit these methods from it
