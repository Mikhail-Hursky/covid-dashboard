import ElementBuilder from '../utils/ElementBuilder';
import CovidMap from '../covidMap/CovidMap';

export default class Countries {
  constructor(instance, api) {
    this.countries = [];
    this.AppInstance = instance;
    this.api = api;
    this.container = new ElementBuilder('div', 'left-col');
    this.container.appendToBody();
    this.countriesList = null;
    this.init();
    this.AppInstance.covidMap = new CovidMap(instance, api);
    this.api.getCovidData().then(data => {
      this.dataCountries = data;
      this.countries.push(...this.dataCountries.Countries);
      this.AppInstance.covidMap.dataCountries = data;
      this.AppInstance.covidMap.createMap();
      this.displayCountries(this.countries, 'TotalConfirmed');
    });
  }

  init() {
    this.createSearchBar();
    this.createSelect();
  }

  createSearchBar() {
    const searchDiv = new ElementBuilder('div', 'search');
    this.input = new ElementBuilder('input', 'search__box', [
      'placeholder',
      'Search country...',
      'type',
      'text',
    ]);
    const icon = new ElementBuilder('i', 'fas fa-search search__icon');

    this.input.element.addEventListener('input', () => {
      this.displayMatches(this.input.element.value);
    });

    searchDiv.append(this.input, icon);
    this.container.append(searchDiv);
  }

  displayCountries(countries, category) {
    this.sortList(category);

    this.countriesList = new ElementBuilder('div', 'countries-list');
    const countryElement = new ElementBuilder('div', 'countries-list__item');

    countries.forEach(country => {
      const countryDiv = new ElementBuilder('div', 'countries-list__item__country');
      const flag = new ElementBuilder('img', 'country__flag');
      const countryName = new ElementBuilder('h4', 'country__name');
      flag.element.src = this.api.getCountryFlag(country.CountryCode);
      countryName.element.textContent = country.Country;

      const data = new ElementBuilder('div', 'countries-list__item__data');
      data.element.textContent = country[category];

      countryDiv.append(flag, countryName);
      countryElement.append(countryDiv, data);
    });

    this.countriesList.append(countryElement);
    this.container.append(this.countriesList);
  }

  sortList(category) {
    this.countries = this.countries.sort((a, b) => b[category] - a[category]);
  }

  createSelect() {
    const options = [
      'total cases',
      'total deaths',
      'total recovered',
      'new cases',
      'new deaths',
      'new recovered',
      'total cases per 100k',
      'total deaths per 100k',
      'total recovered per 100k',
      'new cases per 100k',
      'new deaths per 100k',
      'new recovered per 100k',
    ];

    this.menu = new ElementBuilder('div', 'select-menu');
    const select = new ElementBuilder('select', 'select-menu__select');

    options.forEach(option => {
      const optionElem = new ElementBuilder('option', '', ['value', option]);
      optionElem.element.innerText = option;
      select.append(optionElem);
    });

    const button = new ElementBuilder('button', 'select-menu__button');

    const buttonDiv = new ElementBuilder('div', 'select-menu__button__text-container');
    const current = new ElementBuilder('span', 'select-menu__button__text');
    current.element.innerText = options[0];

    const arrow = new ElementBuilder('i', 'fas fa-angle-right select-menu__button__arrow');

    buttonDiv.append(current);
    button.append(buttonDiv, arrow);
    this.menu.append(select, button);
    this.container.append(this.menu);

    this.menu.element.addEventListener('click', () => {
      this.changeOption(this.menu.element, buttonDiv.element, options);
    });
  }

  changeOption(menu, container, options) {
    if (!menu.classList.contains('change')) {
      const current = container.firstElementChild;

      let index = options.findIndex(value => value === current.innerText.toLowerCase());
      index = index < options.length - 1 ? index + 1 : 0;

      const nextOption = options[index];
      const next = new ElementBuilder('span', 'select-menu__button__text next');
      next.element.innerText = nextOption;
      container.append(next.element);

      menu.classList.add('change');

      setTimeout(() => {
        next.element.classList.remove('next');
        menu.classList.remove('change');
        current.remove();

        this.countriesList.remove();
        this.displayCountries(this.countries, nextOption);
      }, 650);
    }
  }

  displayMatches(value) {
    const matches = this.countries.filter(item => {
      return item.Country.toLowerCase().includes(value.toLowerCase());
    });
    this.countriesList.remove();
    this.displayCountries(matches, 'TotalConfirmed');
  }
}
