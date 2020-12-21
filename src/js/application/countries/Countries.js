import ElementBuilder from '../utils/ElementBuilder';
import numberWithCommas from '../utils/Numbers';
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
    this.countries = [];
    this.matches = null;
    this.params = new Map([
      ['total cases', 'TotalConfirmed'],
      ['total deaths', 'TotalDeaths'],
      ['total recovered', 'TotalRecovered'],
      ['new cases', 'NewConfirmed'],
      ['new deaths', 'NewDeaths'],
      ['new recovered', 'NewRecovered'],
      ['total cases per 100k', 'TotalConfirmed'],
      ['total deaths per 100k', 'TotalDeaths'],
      ['total recovered per 100k', 'TotalRecovered'],
      ['new cases per 100k', 'NewConfirmed'],
      ['new deaths per 100k', 'NewDeaths'],
      ['new recovered per 100k', 'NewRecovered'],
    ]);
    this.keys = [...this.params.keys()];
    this.currentIndex = 0;
    this.currentCategory = this.params.get(this.keys[this.currentIndex]);
    this.AppInstance = instance;
    this.api = api;
    this.dataCountries = this.AppInstance.dataCountries;
    this.container = new ElementBuilder('div', 'left-col');
    this.countriesList = new ElementBuilder('div', 'countries-list');
    this.input = new ElementBuilder('input', 'search__box', [
      'placeholder',
      'Search country...',
      'type',
      'text',
    ]);
    this.keyboard = new Keyboard(this, keysOrder);
    this.countries.push(...this.dataCountries.Countries);
    this.init();
  }

  init() {
    this.container.appendToBody();
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

      this.AppInstance.table.getSelectedCountry(selectedCountry.toLowerCase());
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
    const color = this.chooseColor();

    this.sortList(countries);

    countries.forEach(country => {
      const countryElement = new ElementBuilder('div', 'countries-list__item');
      const countryDiv = new ElementBuilder('div', 'countries-list__item__country');

      const flag = new ElementBuilder('img', 'country__flag');
      const countryName = new ElementBuilder('h4', 'country__name');

      flag.element.src = this.api.getCountryFlag(country.CountryCode);
      countryName.element.textContent = country.Country;

      const data = new ElementBuilder('div', 'countries-list__item__data');
      data.element.classList.add(color);

      let numOfCases = country[this.currentCategory];
      if (this.currentIndex >= this.keys.length / 2) {
        const per100k = 100000 / country.Premium.CountryStats.Population;
        numOfCases = Math.round(numOfCases * per100k);
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
    if (this.currentCategory.includes('Confirmed')) {
      return 'blue';
    }
    if (this.currentCategory.includes('Deaths')) {
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

        this.countriesList.removeChildren();

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

    const countryData = this.countries.find(item => item.Country.toLowerCase() === country);

    if (!countryData) {
      return;
    }

    this.AppInstance.table.getSelectedCountry(country, countryData);
  }

  displayMatches() {
    const { value } = this.input.element;
    this.matches = this.countries.filter(item => {
      return item.Country.toLowerCase().includes(value.toLowerCase());
    });

    this.countriesList.removeChildren();

    if (this.matches.length) {
      this.displayCountries(this.matches);
    } else {
      this.countriesList.element.innerHTML = countryNotFound;
    }
  }
}
