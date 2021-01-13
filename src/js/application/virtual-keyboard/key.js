import ElementBuilder from '../utils/ElementBuilder';

export default class Key {
  constructor({ small, shift, code }) {
    this.small = small;
    this.shift = shift;
    this.code = code;
    this.isFnKey = Boolean(this.small.match(/Shift|Caps|Alt|Tab|Backspace|Del|Enter|fas/));

    this.subst = new ElementBuilder('div', 'sub');
    if (this.shift && this.shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/)) {
      this.subst.element.innerHTML = this.shift;
    }
    this.letter = new ElementBuilder('div', 'letter');
    this.letter.element.innerHTML = this.small;

    this.keyContainer = new ElementBuilder(
      'div',
      'keyboard__key',
      ['code', this.code],
      this.isFnKey ? ['fn', 'true'] : ['fn', 'false'],
    );
    this.keyContainer.append(this.subst, this.letter);
  }
}
