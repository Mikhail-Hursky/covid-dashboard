import Api from './api/Api';
import Countries from './countries/Countries';
import Table from './table/table';
import CovidMap from './covidMap/CovidMap';

export default class App {
  constructor() {
    if (App.exists) return App.instance;
    this.instance = this;
    App.exists = true;
  }

  startApp() {
    this.instance.api = new Api();
    this.instance.countries = new Countries(this.instance, this.instance.api);
    this.instance.table = new Table(this.instance, this.instance.api);
  }
}
