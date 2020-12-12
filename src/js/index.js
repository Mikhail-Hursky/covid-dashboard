import '../styles/style.css';
import Api from './application/api/Api';

const countries = [];
const api = new Api();

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

function clearSuggestions() {
  const input = document.querySelector('.search__box');
  if (input.value !== '') {
    input.value = '';
  }
  document.querySelector('.search__suggestions').innerHTML = '';
}

function findMatches(value, list) {
  return list.filter(item => {
    const regex = new RegExp(value, 'gi');
    return item.Country.match(regex);
  });
}

function displayMatches() {
  const matches = findMatches(this.value, countries);
  const html = matches.map(elem => `<li>${elem.Country}</li>`).join('');

  document.querySelector('.search__suggestions').innerHTML = html;

  if (this.value === '') {
    clearSuggestions();
  }
}

function displaySearchBox() {
  const container = document.createElement('div');
  container.classList.add('search');

  const input = document.createElement('input');
  input.classList.add('search__box');
  input.setAttribute('type', 'text');
  input.setAttribute('placeholder', 'Search country...');

  input.addEventListener('input', displayMatches);
  container.addEventListener('mouseleave', clearSuggestions);

  const icon = document.createElement('i');
  icon.className = 'fas fa-search search__icon';

  const suggestions = document.createElement('ul');
  suggestions.classList.add('search__suggestions');

  container.append(input, icon, suggestions);
  document.querySelector('.left-col').append(container);
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

api.getTotalCases().then(r => console.log(r));

getTotalCases().then(data => {
  displaySearchBox();
  console.log(data);
  countries.push(...data.Countries);
  console.log(countries);
  countries.sort((a, b) => b.TotalConfirmed - a.TotalConfirmed);
  displayCountries(countries);
});
