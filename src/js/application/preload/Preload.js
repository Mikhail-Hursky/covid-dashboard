import ElementBuilder from '../utils/ElementBuilder';

export default class Preload {
  constructor() {
    this.init();
  }

  init() {
    this.container = new ElementBuilder('div', 'preload');
    this.img = new ElementBuilder('img');
    // eslint-disable-next-line
    this.img.element.src =
      'https://cdn.dribbble.com/users/846207/screenshots/5568468/gradient-circle-loading.gif';
    this.container.append(this.img);
    this.container.appendToBody();
  }

  removePreload() {
    this.container.element.remove();
  }

  errorServer() {
    this.img.remove();
    this.h1 = new ElementBuilder('h1');
    this.h1.element.textContent = 'Fill the server with new data. Come back later.';
  }
}
