import ElementBuilder from '../utils/ElementBuilder';
import CovidMap from '../covidMap/CovidMap';

export default class Countries {
  constructor(instance, api) {
    this.countries = [];
    this.AppInstance = instance;
    this.api = api;
    this.container = new ElementBuilder('div', 'left-col');
    this.container.appendToBody();
    this.init();
    this.AppInstance.covidMap = new CovidMap(instance, api);
    this.api.getCovidData().then(data => {
      this.dataCountries = data;
      this.AppInstance.covidMap.dataCountries = data;
      this.AppInstance.covidMap.createMap();
      // this.createCountriesList();
    });
  }

  init() {
    // this.createSearchBar();
    this.createSelect();
  }

  createSearchBar() {
    this.searchDiv = new ElementBuilder('div', 'search');
    this.input = new ElementBuilder('input', 'search__box', [
      'placeholder',
      'Search country...',
      'type',
      'text',
    ]);
    this.input.element.addEventListener('input', this.displayMatches);
    this.searchDiv.element.addEventListener('mouseleave', this.clearSuggestions);
    this.icon = new ElementBuilder('i', 'fas fa-search search__icon');
    this.suggestions = new ElementBuilder('ul', 'search__suggestions');
    this.container.append(this.searchDiv);
    this.searchDiv.append(this.input, this.icon, this.suggestions);
  }

  createCountriesList() {
    this.countries.push(...this.dataCountries.Countries);
    this.countries.sort((a, b) => b.TotalConfirmed - a.TotalConfirmed);
    this.countriesList = new ElementBuilder('div', 'countries-list');
    const countryElem = new ElementBuilder('div', 'countries-list__item');
    this.countries.forEach(country => {
      const countryInfo = new ElementBuilder('div', 'countries-list__item__country');
      const totalCases = new ElementBuilder('div', 'countries-list__item__data');
      const flag = new ElementBuilder('img', 'country__flag');
      const countryName = new ElementBuilder('h4', 'country__name');
      totalCases.element.textContent = country.TotalConfirmed;
      flag.element.src = this.api.getCountryFlag(country.CountryCode);
      countryName.element.textContent = country.Country;
      countryElem.append(countryInfo, totalCases);
      countryInfo.append(flag, countryName);
    });
    this.countriesList.append(countryElem);
    this.container.append(this.countriesList);
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
      this.changeOption.call(this.menu.element, buttonDiv.element, options);
    });
  }

  changeOption(container, options) {
    if (!this.classList.contains('change')) {
      const current = container.firstElementChild;

      let index = options.findIndex(value => value === current.innerText.toLowerCase());
      index = index < options.length - 1 ? index + 1 : 0;

      const nextOption = options[index];
      const next = new ElementBuilder('span', 'select-menu__button__text next');
      next.element.innerText = nextOption;
      container.append(next.element);

      this.classList.add('change');

      setTimeout(() => {
        next.element.classList.remove('next');
        this.classList.remove('change');
        current.remove();
      }, 650);
    }
  }

  displayMatches() {
    const matches = this.findMatches(this.input.element.textContent, this.arrCountries);
    const html = matches.map(elem => `<li>${elem.Country}</li>`).join('');
    this.suggestions.element.innerHTML = html;
    if (this.input.element.value === '') {
      this.clearSuggestions();
    }
  }

  clearSuggestions() {
    if (this.input.element.value !== '') {
      this.input.element.value = '';
    }
    this.suggestions.element.innerHTML = '';
  }

  // eslint-disable-next-line class-methods-use-this
  findMatches(value, list) {
    return list.filter(item => {
      const regex = new RegExp(value, 'gi');
      return item.Country.match(regex);
    });
  }
}
