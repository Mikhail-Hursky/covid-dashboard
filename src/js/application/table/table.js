import ElementBuilder from '../utils/ElementBuilder';
import { numberWithCommas, casesPer100k } from '../utils/helpers';

export default class Table {
  constructor(instance, api) {
    this.totalCases = new Map([
      ['total cases', 'cases'],
      ['total deaths', 'deaths'],
      ['total recovered', 'recovered'],
    ]);
    this.newCases = new Map([
      ['new cases', 'todayCases'],
      ['new deaths', 'todayDeaths'],
      ['new recovered', 'todayRecovered'],
    ]);
    this.totalCasesPer100k = new Map([
      ['total cases per 100k', 'cases'],
      ['total deaths per 100k', 'deaths'],
      ['total recovered per 100k', 'recovered'],
    ]);
    this.newCasesPer100k = new Map([
      ['new cases per 100k', 'todayCases'],
      ['new deaths per 100k', 'todayDeaths'],
      ['new recovered per 100k', 'todayRecovered'],
    ]);
    this.isNewCases = false;
    this.isPer100k = false;
    this.AppInstance = instance;
    this.api = api;
    this.countries = this.AppInstance.dataCountries[1];
    this.global = this.AppInstance.dataCountries[0];
    this.casesForCountry = null;
    this.cardsContainer = new ElementBuilder('div', 'cards');
    this.tableTitle = new ElementBuilder('div', 'title');
    this.AppInstance.covidMap.table = true;
    this.init();
  }

  init() {
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

    const backBtn = new ElementBuilder('button', 'back-btn');
    backBtn.element.innerText = 'Back to global';

    backBtn.on('click', () => {
      this.pressBackBtn();
      this.AppInstance.covidMap.showWorld();
    });

    this.AppInstance.rightCol.append(this.tableTitle, controls, this.cardsContainer, backBtn);
  }

  pressBackBtn() {
    this.tableTitle.element.innerText = 'global';
    this.createCards(this.getCurrentCategory(), this.global);
    this.AppInstance.countries.displayCountries(this.countries);
    this.AppInstance.countries.input.element.value = '';
  }

  createCards(cardsMap, data) {
    this.cardsContainer.removeChildren();

    cardsMap.forEach((value, key) => {
      const cardElement = new ElementBuilder('div', 'card');

      const { population } = data;
      const cases = this.isPer100k ? casesPer100k(data[value], population) : data[value];

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

    this.casesForCountry = this.countries.find(item => {
      return item.country.toLowerCase() === this.tableTitle.element.innerText.toLowerCase();
    });

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

  preGetSelectedCountry(code) {
    const data = this.countries.find(item => item.countryInfo.iso2 === code);
    if (data) {
      this.getSelectedCountry(data);
      this.AppInstance.countries.input.element.value = data.country;
      this.AppInstance.countries.displayMatches();
    }
  }

  getSelectedCountry(countryObj) {
    this.tableTitle.element.innerText = countryObj.country;
    this.createCards(this.getCurrentCategory(), countryObj);

    this.AppInstance.covidMap.selectCountry(
      this.AppInstance.covidMap.polygonSeries.getPolygonById(countryObj.countryInfo.iso2),
    );
  }

  getCurrentCategory() {
    if (!this.isPer100k) {
      return this.isNewCases ? this.newCases : this.totalCases;
    }
    return this.isNewCases ? this.newCasesPer100k : this.totalCasesPer100k;
  }
}
