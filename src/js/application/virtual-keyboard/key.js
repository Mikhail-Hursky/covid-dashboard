import ElementBuilder from '../utils/ElementBuilder';

export default class Key {
  constructor({ small, shift, code }) {
    this.small = small;
    this.shift = shift;
    this.code = code;
    this.isFnKey = Boolean(small.match(/Shift|Caps|Alt|Tab|Backspace|Del|Enter|fas/));

    if (shift && shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/)) {
      this.subst = new ElementBuilder('div', 'sub');
      this.subst.element.innerHTML = shift;
    } else {
      this.subst = new ElementBuilder('div', 'sub');
    }
    this.letter = new ElementBuilder('div', 'letter');
    this.letter.element.innerHTML = small;

    this.keyContainer = new ElementBuilder(
      'div',
      'keyboard__key',
      ['code', code],
      this.isFnKey ? ['fn', 'true'] : ['fn', 'false'],
    );
    this.keyContainer.append(this.subst, this.letter);
  }
}
