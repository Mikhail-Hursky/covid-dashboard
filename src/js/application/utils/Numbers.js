export default function numberWithCommas(n) {
  if (typeof n !== 'number') return '--';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
