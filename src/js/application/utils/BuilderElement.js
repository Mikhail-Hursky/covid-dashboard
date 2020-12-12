export default class BuilderElement {
  constructor(tagName, classes, ...dataAttr) {
    this.element = document.createElement(tagName);
    if (classes) this.element.classList.add(...classes.split(' '));
    if (dataAttr.length) {
      dataAttr.forEach(([attrName, attrValue]) => {
        if (attrName.match(/value|id|type|placeholder|cols|rows|autocorrect|spellcheck/)) {
          this.element.setAttribute(attrName, attrValue);
        } else {
          this.element.dataset[attrName] = attrValue;
        }
      });
    }
  }

  appendChi(...el) {
    if (el.length) {
      el.forEach(x => {
        this.element.appendChild(x.element);
      });
    }
  }

  append() {
    document.body.append(this.element);
  }
}
