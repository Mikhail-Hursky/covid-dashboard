import ElementBuilder from '../utils/ElementBuilder';

export default class Countries {
  constructor(instance, api) {
    this.global = {};
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
          <input type="radio" name="period" value="total" id="total" checked />
          <label for="total">Total</label>
          <input type="radio" name="period" value="new" id="newly" />
          <label for="newly">Newly</label>
          <span class="switch"></span>
        </div>
        <div class="control">
          <input type="radio" name="values" value="absolute" id="absolute" checked />
          <label for="absolute">Absolute</label>
          <input type="radio" name="values" value="per100k" id="per100k" />
          <label for="per100k">Per 100k</label>
          <span class="switch"></span>
        </div>
    `,
    );

    this.cards = [
      {
        title: 'Total cases',
        value: this.global.TotalConfirmed,
      },
      {
        title: 'Total deaths',
        value: this.global.TotalDeaths,
      },
      {
        title: 'Total recovered',
        value: this.global.TotalRecovered,
      },
    ];

    this.cards.forEach(card => this.createCard(card));

    this.container.append(this.tableTitle, controls, this.cardsContainer);
  }

  createCard(card) {
    const cardElement = new ElementBuilder('div', 'card');
    cardElement.element.insertAdjacentHTML(
      'afterbegin',
      `
    <h3 class="card__value">${card.value}</h3>
    <p class="card__title">${card.title}</p>
    `,
    );
    this.cardsContainer.append(cardElement);
  }
}
