import {
  numberWithCommas,
  capitalizeFirstLetter,
  findMatches,
  casesPer100k,
} from '../utils/helpers';

const list = [{ country: 'Belarus' }, { country: 'Russia' }, { country: 'Poland' }];

test('Function should return formatted number type of string', () => {
  expect(numberWithCommas(1000000)).toBe('1,000,000');
});

test('Function should return string with the first letter capitalized', () => {
  expect(capitalizeFirstLetter('yulia')).toBe('Yulia');
});

test('Function should return all matches in the array', () => {
  expect(findMatches(list, 'us')).toStrictEqual([{ country: 'Belarus' }, { country: 'Russia' }]);
});

test('Function should return proper number of cases per 100k people', () => {
  expect(casesPer100k(443, 1920000)).toBe(24);
});

it('Check if global covid data api works', async () => {
  const data = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://disease.sh/v3/covid-19/all');
    xhr.onload = () => resolve(xhr.status);
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send();
  });

  expect(data).toEqual(200);
});
