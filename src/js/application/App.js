import Api from './api/Api';
import Countries from './countries/Countries';
import Table from './table/table';
import CovidMap from './covidMap/CovidMap';
import Preload from './preload/Preload';

export default class App {
  constructor() {
    if (App.exists) return App.instance;
    this.instance = this;
    this.instance.api = new Api(this.instance);
    this.preload = new Preload();
    App.exists = true;
    this.instance.api.getCovidData().then(data => {
      this.dataCountries = data;
      this.preload.removePreload();
      this.startApp();
    });
  }

  startApp() {
    this.instance.countries = new Countries(this.instance, this.instance.api);
    this.instance.covidMap = new CovidMap(this.instance);
    this.instance.table = new Table(this.instance, this.instance.api);
  }
}
