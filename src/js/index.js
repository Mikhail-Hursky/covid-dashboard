import '../styles/style.css';

export default class Hee {
  init() {}
}

const countries = [];

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

function findMatches(value, list) {
  return list.filter(item => {
    const regex = new RegExp(value, 'gi');
    return item.Country.match(regex);
  });
}

function displayMatches() {
  const matches = findMatches(this.value, countries);
  console.log(matches);
  const html = matches.map(elem => `<li>${elem.Country}</li>`).join('');
  const suggestions = document.createElement('ul');
  suggestions.classList.add('search__suggestions');
  suggestions.innerHTML = html;
  document.querySelector('.search').append(suggestions);
}

function displaySearchBox() {
  const container = document.createElement('div');
  container.classList.add('search');

  const input = document.createElement('input');
  input.classList.add('search__box');
  input.setAttribute('type', 'text');
  input.setAttribute('placeholder', 'Search country...');

  input.addEventListener('input', displayMatches);

  const icon = document.createElement('i');
  icon.className = 'fas fa-search search__icon';

  container.append(input, icon);
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

getTotalCases().then(data => {
  displaySearchBox();
  countries.push(...data.Countries);
  console.log(countries);
  countries.sort((a, b) => b.TotalConfirmed - a.TotalConfirmed);
  displayCountries(countries);

  console.log(findMatches('Br', countries));
});
