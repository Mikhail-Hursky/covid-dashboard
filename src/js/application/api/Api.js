export default class Api {
  constructor() {
    this.covidUrl = 'https://api.covid19api.com/';
    this.locationUrl = 'https://api.positionstack.com/v1/forward';
    this.apiKeyPositionstack = 'e157c7336d0add5ad9ecb1214f2a8d72';
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

  // eslint-disable-next-line no-unused-vars
  async getLatLon(country) {}
}
