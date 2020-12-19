import ElementBuilder from '../utils/ElementBuilder';
import numberWithCommas from '../utils/Numbers';

export default class Table {
  constructor(instance, api) {
    this.totalCases = new Map([
      ['total cases', 'TotalConfirmed'],
      ['total deaths', 'TotalDeaths'],
      ['total recovered', 'TotalRecovered'],
    ]);
    this.newCases = new Map([
      ['new cases', 'NewConfirmed'],
      ['new deaths', 'NewDeaths'],
      ['new recovered', 'NewRecovered'],
    ]);
    this.totalCasesPer100k = new Map([
      ['total cases per 100k', 'TotalConfirmed'],
      ['total deaths per 100k', 'TotalDeaths'],
      ['total recovered per 100k', 'TotalRecovered'],
    ]);
    this.newCasesPer100k = new Map([
      ['new cases per 100k', 'NewConfirmed'],
      ['new deaths per 100k', 'NewDeaths'],
      ['new recovered per 100k', 'NewRecovered'],
    ]);
    this.isNewCases = false;
    this.isPer100k = false;
    this.AppInstance = instance;
    this.api = api;
    this.countries = this.AppInstance.dataCountries.Countries;
    this.global = this.AppInstance.dataCountries.Global;
    this.casesForCountry = null;
    this.cardsContainer = new ElementBuilder('div', 'cards');
    this.tableTitle = new ElementBuilder('div', 'title');
    this.init();
  }

  init() {
    const tableContainer = new ElementBuilder('div', 'right-col');

    this.tableTitle.element.innerText = 'global';

    const controls = new ElementBuilder('div', 'controls');

    controls.element.insertAdjacentHTML(
      'afterbegin',
      `
        <div class="control">
          <input type="radio" name="period" value="totalCases" id="total" checked />
          <label for="total">Total</label>
          <input type="radio" name="period" value="newCases" id="newly" />
          <label for="newly">Newly</label>
          <span class="switch"></span>
        </div>
        <div class="control">
          <input type="radio" name="values" value="Cases" id="absolute" checked />
          <label for="absolute">Absolute</label>
          <input type="radio" name="values" value="CasesPer100k" id="per100k" />
          <label for="per100k">Per 100k</label>
          <span class="switch"></span>
        </div>
    `,
    );

    controls.element.addEventListener('change', event => {
      this.modifyTable(event.target.value);
    });

    this.createCards(this.totalCases, this.global);

    tableContainer.append(this.tableTitle, controls, this.cardsContainer);
    tableContainer.appendToBody();
  }

  createCards(cardsMap, data) {
    this.cardsContainer.removeChildren();

    cardsMap.forEach((value, key) => {
      let cases;
      const cardElement = new ElementBuilder('div', 'card');

      if (this.isGlobal()) {
        cases = this.isPer100k ? '' : data[value];
      } else {
        const per100k = 100000 / data.Premium.CountryStats.Population;
        cases = this.isPer100k ? Math.round(data[value] * per100k) : data[value];
      }

      cardElement.element.insertAdjacentHTML(
        'afterbegin',
        `
        <h3 class="card__value">${numberWithCommas(cases)}</h3>
        <p class="card__title">${key}</p>
        `,
      );

      this.cardsContainer.append(cardElement);
    });
  }

  modifyTable(attr) {
    let cardsMap;

    const cases = this.isGlobal() ? this.global : this.casesForCountry;

    switch (attr) {
      case 'totalCases':
      case 'newCases':
        this.isNewCases = !this.isNewCases;
        cardsMap = this.isPer100k ? `${attr}Per100k` : attr;
        break;
      case 'Cases':
      case 'CasesPer100k':
        this.isPer100k = !this.isPer100k;
        cardsMap = this.isNewCases ? `new${attr}` : `total${attr}`;
        break;
      // no default
    }

    this.createCards(this[cardsMap], cases);
  }

  isGlobal() {
    return this.tableTitle.element.innerText.toLowerCase() === 'global';
  }

  getSelectedCountry(country) {
    this.casesForCountry = this.countries.find(item => {
      return item.Country.toLowerCase() === country;
    });

    this.tableTitle.element.innerText = country;
    this.createCards(this.getCurrentCategory(), this.casesForCountry);
  }

  getCurrentCategory() {
    if (!this.isPer100k) {
      return this.isNewCases ? this.newCases : this.totalCases;
    }
    return this.isNewCases ? this.newCasesPer100k : this.totalCasesPer100k;
  }
}
