export default class Api {
  constructor() {
    this.covidUrl = 'https://api.covid19api.com/';
  }

  // eslint-disable-next-line class-methods-use-this
  getCountryFlag(countryCode) {
    return `https://www.countryflags.io/${countryCode}/flat/32.png`;
  }

  async getTotalCases() {
    try {
      const response = await fetch(`${this.covidUrl}summary`);
      const data = await response.json();
      return data;
    } catch (e) {
      throw new Error(e);
    }
  }
}
