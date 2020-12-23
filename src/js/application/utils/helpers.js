export function numberWithCommas(n) {
  if (typeof n !== 'number') return '--';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function findMatches(list, wordToMatch) {
  return list.filter(value => {
    const regex = new RegExp(wordToMatch, 'gi');
    return value.country.match(regex);
  });
}

export function casesPer100k(cases, population) {
  return Math.ceil((cases / population) * 100000);
}
