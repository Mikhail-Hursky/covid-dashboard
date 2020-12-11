import '../styles/style.css';

export default class Hee {
  init() {}
}

function getCountryFlag(countryCode) {
  return `https://www.countryflags.io/${countryCode}/flat/32.png`;
}

async function getTotalCases() {
  const URL = 'https://api.covid19api.com/summary';
  try {
    const response = await fetch(URL);
    const data = await response.json();
    return data;
  } catch (e) {
    throw new Error(e);
  }
}

function displayCountries(countriesList) {
  const container = document.createElement('div');
  container.classList.add('countries-list');
  countriesList.forEach(elem => {
    container.insertAdjacentHTML(
      'beforeend',
      `<div class="countries-list__item">
      <div class="countries-list__item__country">
        <img src="${getCountryFlag(elem.CountryCode)}" alt="" class="country__flag" />
        <h4 class="country__name">${elem.Country}</h4>
      </div>
      <div class="countries-list__item__cases">${elem.TotalConfirmed}</div>
    </div>`,
    );
  });
  document.querySelector('.left-col').append(container);
}

getTotalCases().then(data => {
  const countries = data.Countries;
  countries.sort((a, b) => b.TotalConfirmed - a.TotalConfirmed);
  displayCountries(countries);
});
