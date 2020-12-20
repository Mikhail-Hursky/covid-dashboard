export default class Api {
  constructor(instance) {
    this.AppInstance = instance;
    this.covidUrl = 'https://api.covid19api.com/';
    this.apiKeyCovid = '5cf9dfd5-3449-485e-b5ae-70a60e997864';
  }

  // eslint-disable-next-line class-methods-use-this
  getCountryFlag(countryCode) {
    return `https://www.countryflags.io/${countryCode}/flat/32.png`;
  }

  // eslint-disable-next-line consistent-return
  async getCovidData() {
    try {
      const response = await fetch(`${this.covidUrl}summary`, {
        headers: {
          'X-Access-Token': this.apiKeyCovid,
        },
      });
      const data = await response.json();
      if (data.Message === 'Caching in progress') throw new Error('Caching in progress');
      return data;
    } catch (e) {
      this.AppInstance.preload.errorServer();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async getCoordinates() {
    try {
      const responce = await fetch(
        'https://raw.githubusercontent.com/amcharts/covid-charts/master/data/json/world_timeline.json',
      );
      const data = await responce.json();
      return data;
    } catch (e) {
      throw new Error(e);
    }
  }
}
