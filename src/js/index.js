export default class Hee {
  init() {}
}

function getCountryFlag(countryCode) {
  return `https://www.countryflags.io/${countryCode}/flat/32.png`;
}

async function getListOfCountries() {
  const URL = 'https://api.covid19api.com/countries';
  try {
    const response = await fetch(URL);
    const data = await response.json();
    return data;
  } catch (e) {
    throw new Error(e);
  }
}

/**
 * @param {string} country
 * @param {string} date
 *
 * @example
 *   'belarus'
 *   '2020-12-08T00:00:00Z'
 *   '2020-12-09T00:00:00Z'
 */

async function getTotalCasesByCountry(country, startDate, endDate) {
  const URL = `https://api.covid19api.com/total/country/${country}/status/confirmed?from=${startDate}&to=${endDate}`;
  try {
    const response = await fetch(URL);
    const data = await response.json();
    return data[data.length - 1]['Cases'];
  } catch (e) {
    throw new Error(e);
  }
}

getTotalCasesByCountry('belarus', '2020-12-08T00:00:00Z', '2020-12-10T00:00:00Z').then(cases => {
  console.log(cases);
  console.log(getCountryFlag('BS'));
});
getListOfCountries(); // 248 countries
