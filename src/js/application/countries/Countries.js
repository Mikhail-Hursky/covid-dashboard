import ElementBuilder from '../utils/ElementBuilder';
import { numberWithCommas, findMatches, casesPer100k } from '../utils/helpers';
import Keyboard from '../virtual-keyboard/keyboard';
import keysOrder from '../virtual-keyboard/keysOrder';

const countryNotFound = `
  <h2>Country not found!</h2>
  <div class="virus covid1"></div>
  <div class="virus covid2"></div>
  <div class="virus covid3"></div>
  <div class="virus covid4"></div>
  `;

export default class Countries {
  constructor(instance, api) {
    this.matches = null;
    this.params = new Map([
      ['total cases', 'cases'],
      ['total deaths', 'deaths'],
      ['total recovered', 'recovered'],
      ['new cases', 'todayCases'],
      ['new deaths', 'todayDeaths'],
      ['new recovered', 'todayRecovered'],
      ['total cases per 100k', 'cases'],
      ['total deaths per 100k', 'deaths'],
      ['total recovered per 100k', 'recovered'],
      ['new cases per 100k', 'todayCases'],
      ['new deaths per 100k', 'todayDeaths'],
      ['new recovered per 100k', 'todayRecovered'],
    ]);
    this.keys = [...this.params.keys()];
    this.currentIndex = 0;
    this.currentCategory = this.params.get(this.keys[this.currentIndex]);
    this.AppInstance = instance;
    this.api = api;
    this.countries = this.AppInstance.dataCountries[1];
    this.container = this.AppInstance.leftCol;
    this.countriesList = new ElementBuilder('div', 'countries-list');
    this.input = new ElementBuilder('input', 'search__box', [
      'placeholder',
      'Search country...',
      'type',
      'text',
    ]);
    this.keyboard = new Keyboard(this, keysOrder);
    this.init();
  }

  init() {
    this.createSearchBar();
    this.createSelect();
    this.displayCountries(this.countries);
    this.container.append(this.countriesList);

    this.countriesList.on('click', e => {
      const countryElem = e.target.closest('.countries-list__item');

      if (!countryElem) return;

      const selectedCountry = countryElem.children[0].children[1].innerText;

      this.input.element.value = selectedCountry;
      this.displayMatches();

      const countryData = this.getCountryData(selectedCountry);

      this.AppInstance.table.getSelectedCountry(countryData);
    });
  }

  createSearchBar() {
    const search = new ElementBuilder('form', 'search');
    const submitBtn = new ElementBuilder('button', 'search__submit', ['type', 'submit']);
    const icon = new ElementBuilder('i', 'fas fa-search search__icon');

    this.input.on('focus', () => {
      if (!this.keyboard.isKeyboardOpen) {
        this.keyboard.open();
      }
    });

    search.on('submit', e => {
      this.submit(e);
    });

    submitBtn.append(icon);
    search.append(this.input, submitBtn);
    this.container.append(search);
  }

  createSelect() {
    const menu = new ElementBuilder('div', 'select-menu');

    const select = new ElementBuilder('select', 'select-menu__select');
    const button = new ElementBuilder('button', 'select-menu__button');

    const buttonTextDiv = new ElementBuilder('div', 'select-menu__button__text-container');
    const current = new ElementBuilder('span', 'select-menu__button__text');
    current.element.innerText = this.keys[this.currentIndex];

    const arrow = new ElementBuilder('i', 'fas fa-angle-right select-menu__button__arrow');

    buttonTextDiv.append(current);
    button.append(buttonTextDiv, arrow);
    menu.append(select, button);
    this.container.append(menu);

    menu.on('click', () => {
      this.changeOption(menu.element, buttonTextDiv.element);
    });
  }

  displayCountries(countries) {
    this.countriesList.removeChildren();

    const color = this.chooseColor();

    this.sortList(countries);

    countries.forEach(item => {
      const countryElement = new ElementBuilder('div', 'countries-list__item');
      const countryDiv = new ElementBuilder('div', 'countries-list__item__country');

      const flag = new ElementBuilder('img', 'country__flag');
      const countryName = new ElementBuilder('h4', 'country__name');

      flag.element.src = item.countryInfo.flag;
      countryName.element.innerText = item.country;

      const data = new ElementBuilder('div', 'countries-list__item__data');
      data.element.classList.add(color);

      let numOfCases = item[this.currentCategory];
      if (this.currentIndex >= this.keys.length / 2) {
        const { population } = item;
        numOfCases = casesPer100k(numOfCases, population);
      }
      data.element.textContent = numberWithCommas(numOfCases);

      countryDiv.append(flag, countryName);
      countryElement.append(countryDiv, data);

      this.countriesList.append(countryElement);
    });
  }

  sortList(countries) {
    return countries.sort((a, b) => b[this.currentCategory] - a[this.currentCategory]);
  }

  chooseColor() {
    const casesRegex = new RegExp('cases', 'gi');
    const deathsRegex = new RegExp('deaths', 'gi');

    if (this.currentCategory.match(casesRegex)) {
      return 'blue';
    }
    if (this.currentCategory.match(deathsRegex)) {
      return 'red';
    }
    return 'green';
  }

  changeOption(menu, container) {
    if (!menu.classList.contains('change')) {
      const current = container.firstElementChild;

      let index = this.keys.findIndex(value => value === current.innerText.toLowerCase());
      index = index < this.keys.length - 1 ? index + 1 : 0;
      this.currentIndex = index;
      this.currentCategory = this.params.get(this.keys[this.currentIndex]);

      const nextOption = this.keys[index];
      const next = new ElementBuilder('span', 'select-menu__button__text next');
      next.element.innerText = nextOption;
      container.append(next.element);

      menu.classList.add('change');

      setTimeout(() => {
        next.element.classList.remove('next');
        menu.classList.remove('change');
        current.remove();

        if (this.input.element.value) {
          this.displayCountries(this.matches);
        } else {
          this.displayCountries(this.countries);
        }
      }, 650);
    }
  }

  submit(event) {
    event.preventDefault();

    let country;

    if (event.target.tagName === 'INPUT') {
      country = event.target.value.toLowerCase();
    } else {
      country = event.target.children[0].value.toLowerCase();
    }

    const countryData = this.getCountryData(country);

    if (!countryData) {
      return;
    }
    this.AppInstance.table.getSelectedCountry(countryData);
  }

  displayMatches() {
    const { value } = this.input.element;

    this.matches = findMatches(this.countries, value);

    if (this.matches.length) {
      this.displayCountries(this.matches);
    } else {
      this.countriesList.element.innerHTML = countryNotFound;
    }
  }

  getCountryData(countryName) {
    return this.countries.find(item => item.country.toLowerCase() === countryName.toLowerCase());
  }
}
