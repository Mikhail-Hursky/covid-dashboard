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
