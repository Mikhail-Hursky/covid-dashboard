export default class Api {
  constructor(instance) {
    this.AppInstance = instance;
    this.covidUrl = 'https://api.covid19api.com/';
    this.apiKeyCovid = '5cf9dfd5-3449-485e-b5ae-70a60e997864';
  }

  async getCovidDataByCountries() {
    try {
      const response = await fetch('https://corona.lmao.ninja/v2/countries');
      const data = await response.json();
      if (data.Message === 'Caching in progress') throw new Error('Caching in progress');
      return data;
    } catch (e) {
      this.AppInstance.preload.errorServer();
    }
    return false;
  }

  async getGlobalCovidData() {
    try {
      const response = await fetch('https://disease.sh/v3/covid-19/all');
      const data = await response.json();
      if (data.Message === 'Caching in progress') throw new Error('Caching in progress');
      return data;
    } catch (e) {
      this.AppInstance.preload.errorServer();
    }
    return false;
  }

  async getCoordinates() {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/amcharts/covid-charts/master/data/json/world_timeline.json',
      );
      const data = await response.json();
      return data;
    } catch (e) {
      this.AppInstance.preload.errorServer();
    }
    return false;
  }
}
