import ElementBuilder from '../utils/ElementBuilder';

export default class Countries {
  constructor(instance, api) {
    this.global = {};
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
      ['total cases per 100k'],
      ['total deaths per 100k'],
      ['total recovered per 100k'],
    ]);
    this.newCasesPer100k = new Map([
      ['new cases per 100k'],
      ['new deaths per 100k'],
      ['new recovered per 100k'],
    ]);
    this.isNewCases = false;
    this.isPer100k = false;
    this.AppInstance = instance;
    this.api = api;
    this.container = new ElementBuilder('div', 'right-col');
    this.container.appendToBody();
    this.cardsContainer = new ElementBuilder('div', 'cards');
    this.api.getCovidData().then(data => {
      this.global = data.Global;
      this.init();
    });
  }

  init() {
    this.tableTitle = new ElementBuilder('div', 'title');
    this.tableTitle.element.innerText = 'Global';

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

    this.container.append(this.tableTitle, controls, this.cardsContainer);
  }

  createCards(cardsMap, data) {
    cardsMap.forEach((value, key) => {
      const cardElement = new ElementBuilder('div', 'card');
      cardElement.element.insertAdjacentHTML(
        'afterbegin',
        `
        <h3 class="card__value">${data[value]}</h3>
        <p class="card__title">${key}</p>
        `,
      );
      this.cardsContainer.append(cardElement);
    });
  }

  modifyTable(attr) {
    let cardsMap;
    const cases = this.global;

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

    this.cardsContainer.element.innerHTML = '';
    this.createCards(this[cardsMap], cases);
  }
}
