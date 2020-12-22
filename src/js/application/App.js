import Api from './api/Api';
import Countries from './countries/Countries';
import Table from './table/table';
import CovidMap from './covidMap/CovidMap';
import Preload from './preload/Preload';
import ElementBuilder from './utils/ElementBuilder';

export default class App {
  constructor() {
    if (App.exists) return App.instance;
    this.instance = this;
    this.instance.api = new Api(this.instance);
    this.preload = new Preload();
    App.exists = true;
    this.p1 = this.instance.api.getGlobalCovidData();
    this.p2 = this.instance.api.getCovidDataByCountries();
    this.init();
  }

  init() {
    Promise.all([this.p1, this.p2]).then(data => {
      console.log(data);
      this.dataCountries = data;
      this.renderPage();
      this.preload.removePreload();
      this.startApp();
    });
  }

  startApp() {
    this.instance.countries = new Countries(this.instance, this.instance.api);
    this.instance.covidMap = new CovidMap(this.instance);
    this.instance.table = new Table(this.instance, this.instance.api);
  }

  renderPage() {
    const header = new ElementBuilder('header');
    const main = new ElementBuilder('main');
    const footer = new ElementBuilder('footer');

    const lastUpdate = new Date(this.dataCountries[0].updated);
    const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    this.leftCol = new ElementBuilder('div', 'left-col');
    this.centerCol = new ElementBuilder('div', 'center-col');
    this.rightCol = new ElementBuilder('div', 'right-col');

    header.element.insertAdjacentHTML(
      'afterbegin',
      `
      <h1>Covid-19</h1>
      <span>Last update: ${dateTimeFormat.format(lastUpdate)}</span>
      `,
    );

    main.append(this.leftCol, this.centerCol, this.rightCol);

    footer.element.insertAdjacentHTML(
      'afterbegin',
      `
    <div class="footer__author">
        Made by
        <a href="https://github.com/Mikhail-Hursky" class="footer__author-link">@Mikhail-Hursky</a>
        <a href="https://github.com/yulia-kri" class="footer__author-link">@yulia-kri</a>
        2020
      </div>
      <a href="https://rs.school/js/" class="footer__school-link">
        <img src="https://rs.school/images/rs_school_js.svg" alt="" class="school-link__icon" />
        <span>Courses from The Rolling Scopes</span>
      </a>
    `,
    );

    header.appendToBody();
    main.appendToBody();
    footer.appendToBody();

    return this;
  }
}
