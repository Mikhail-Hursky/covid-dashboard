export default class Api {
  constructor() {
    this.covidURL = 'https://api.covid19api.com/';
    this.KEY = '5cf9dfd5-3449-485e-b5ae-70a60e997864';
  }

  // eslint-disable-next-line class-methods-use-this
  getCountryFlag(countryCode) {
    return `https://www.countryflags.io/${countryCode}/flat/32.png`;
  }

  async getCovidData() {
    try {
      const response = await fetch(`${this.covidURL}summary`, {
        headers: {
          'X-Access-Token': this.KEY,
        },
      });
      const data = await response.json();
      return data;
    } catch (e) {
      throw new Error(e);
    }
  }

  async getAllData() {
    // Promise.all
  }
}
