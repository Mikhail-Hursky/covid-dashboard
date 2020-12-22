export default class ElementBuilder {
  constructor(tagName, classes, ...dataAttr) {
    this.element = document.createElement(tagName);
    if (classes) this.element.classList.add(...classes.split(' '));
    if (dataAttr.length) {
      dataAttr.forEach(([attrName, attrValue]) => {
        if (attrName.match(/value|id|type|placeholder|cols|rows|autocorrect|spellcheck|name/)) {
          this.element.setAttribute(attrName, attrValue);
        } else {
          this.element.dataset[attrName] = attrValue;
        }
      });
    }
  }

  append(...el) {
    if (el.length) {
      el.forEach(x => {
        this.element.append(x.element);
      });
    }
  }

  appendToBody() {
    document.body.append(this.element);
  }

  remove() {
    this.element.remove();
  }

  removeChildren() {
    this.element.innerHTML = '';
  }

  on(event, callback) {
    this.element.addEventListener(event, callback);
  }
}
