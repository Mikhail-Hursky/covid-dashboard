export default class Api {
  constructor() {
    this.covidUrl = 'https://api.covid19api.com/';
  }

  getCountryFlag(countryCode) {
    return `https://www.countryflags.io/${countryCode}/flat/32.png`;
  }

  async getTotalCases() {
    try {
      const response = await fetch(`${this.covidUrl}summary`);
      const data = await response.json();
      this.data = data;
    } catch (e) {
      throw new Error(e);
    }
  }
}
