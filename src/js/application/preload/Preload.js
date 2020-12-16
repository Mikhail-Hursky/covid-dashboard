import ElementBuilder from '../utils/ElementBuilder';

export default class Preload {
  constructor() {
    this.init();
  }

  init() {
    this.container = new ElementBuilder('div', 'preload');
    const img = new ElementBuilder('img');
    // eslint-disable-next-line
    img.element.src =
      'https://cdn.dribbble.com/users/846207/screenshots/5568468/gradient-circle-loading.gif';
    this.container.append(img);
    this.container.appendToBody();
  }

  removePreload() {
    this.container.element.remove();
  }
}
