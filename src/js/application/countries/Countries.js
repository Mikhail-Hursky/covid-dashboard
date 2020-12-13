import BuilderElement from '../utils/BuilderElement';
import CovidMap from '../covidMap/CovidMap';

export default class Countries {
  constructor(instance, api) {
    this.arrCountries = [];
    this.AppInstance = instance;
    this.api = api;
    this.container = new BuilderElement('div', 'left-col');
    this.container.append();
    this.init();
    this.AppInstance.covidMap = new CovidMap(instance, api);
    this.api.getTotalCases().then(data => {
      this.dataCountries = data;
      this.AppInstance.covidMap.dataCountries = data;
      this.AppInstance.covidMap.createMap();
      this.createCountriesListDiv();
    });
  }

  init() {
    this.createSearchDiv();
  }

  createSearchDiv() {
    this.searchDiv = new BuilderElement('div', 'search');
    this.input = new BuilderElement('input', 'search__box', [
      'placeholder',
      'Search country...',
      'type',
      'text',
    ]);
    this.input.element.addEventListener('input', this.displayMatches);
    this.searchDiv.element.addEventListener('mouseleave', this.clearSuggestions);
    this.icon = new BuilderElement('i', 'fas fa-search search__icon');
    this.suggestions = new BuilderElement('ul', 'search__suggestions');
    this.container.appendChi(this.searchDiv);
    this.searchDiv.appendChi(this.input, this.icon, this.suggestions);
  }

  createCountriesListDiv() {
    this.arrCountries.push(...this.dataCountries.Countries);
    this.arrCountries.sort((a, b) => b.TotalConfirmed - a.TotalConfirmed);
    this.countriesListDiv = new BuilderElement('div', 'countries-list');
    const div = new BuilderElement('div', 'countries-list__item');
    this.arrCountries.forEach(country => {
      const divCountry = new BuilderElement('div', 'countries-list__item__country');
      const divCases = new BuilderElement('div', 'countries-list__item__cases');
      const imgFlag = new BuilderElement('img', 'country__flag');
      const countryName = new BuilderElement('h4', 'country__name');
      divCases.element.textContent = country.TotalConfirmed;
      imgFlag.element.src = this.api.getCountryFlag(country.CountryCode);
      countryName.element.textContent = country.Country;
      div.appendChi(divCountry, divCases);
      divCountry.appendChi(imgFlag, countryName);
    });
    this.countriesListDiv.appendChi(div);
    this.container.appendChi(this.countriesListDiv);
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
