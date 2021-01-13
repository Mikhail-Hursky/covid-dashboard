import en from './keysLayout';
import ElementBuilder from '../utils/ElementBuilder';
import Key from './key';

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default class Keyboard {
  constructor(page, keysOrder) {
    this.keysOrder = keysOrder;
    this.isCaps = false;
    this.isShift = false;
    this.isKeyboardOpen = false;
    this.isRecording = false;
    this.recognition = null;
    this.textarea = page.input.element;
    this.page = page;
    this.init();
    this.createKeys();
  }

  init() {
    this.keyboardLayout = en;

    this.keysContainer = new ElementBuilder('div', 'keyboard keyboard_hidden');

    this.keysContainer.appendToBody();

    return this;
  }

  createKeys() {
    this.keyButtons = [];
    this.keysOrder.forEach(row => {
      const rowElement = new ElementBuilder('div', 'keyboard__row');
      row.forEach(keyCode => {
        const keyObj = this.keyboardLayout.find(key => key.code === keyCode);
        if (keyObj) {
          const keyButton = new Key(keyObj);
          this.keyButtons.push(keyButton);
          rowElement.append(keyButton.keyContainer);
        }
      });
      this.keysContainer.append(rowElement);
    });

    document.addEventListener('keyup', e => {
      if (this.isKeyboardOpen) this.eventHandler(e);
    });
    document.addEventListener('keydown', e => {
      if (this.isKeyboardOpen) this.eventHandler(e);
    });
    this.keysContainer.on('mousedown', e => this.preEventHandler(e));
    this.keysContainer.on('mouseup', e => this.preEventHandler(e));
  }

  open() {
    this.isKeyboardOpen = true;
    this.keysContainer.element.classList.remove('keyboard_hidden');
  }

  close() {
    this.isKeyboardOpen = false;
    this.keysContainer.element.classList.add('keyboard_hidden');
    this.textarea.blur();
  }

  resetButtonState({
    target: {
      dataset: { code },
    },
  }) {
    const pressedKey = this.keyButtons.find(keyButton => keyButton.code === code);
    pressedKey.keyContainer.element.classList.remove('active');
    pressedKey.keyContainer.element.removeEventListener('mouseleave', this.resetButtonState);
  }

  preEventHandler(event) {
    event.stopPropagation();
    const keyDiv = event.target.closest('.keyboard__key');
    if (!keyDiv) return;
    const {
      dataset: { code },
    } = keyDiv;
    if (!code.match(/CapsLock|Shift/)) {
      keyDiv.addEventListener('mouseleave', e => this.resetButtonState(e));
    }
    this.eventHandler({ code, type: event.type });
  }

  eventHandler(event) {
    if (event.stopPropagation) event.stopPropagation();
    const { code, type } = event;
    const pressedKeyObj = this.keyButtons.find(keyButton => keyButton.code === code);
    if (!pressedKeyObj) return;
    this.textarea.focus();

    if (type.match(/keydown|mousedown/)) {
      if (type.match(/key/)) event.preventDefault();
      pressedKeyObj.keyContainer.element.classList.add('active');

      if (code.match(/Shift/)) {
        switch (type) {
          case 'keydown':
            this.isShift = true;
            break;
          case 'mousedown':
            if (!this.isShift) {
              this.isShift = true;
            } else {
              this.isShift = false;
              pressedKeyObj.keyContainer.element.classList.remove('active');
            }
            break;
        }
        this.switchUpperCase();
      }

      if (code === 'CapsLock') {
        if (!this.isCaps) {
          this.isCaps = true;
        } else {
          this.isCaps = false;
          pressedKeyObj.keyContainer.element.classList.remove('active');
        }
        this.switchUpperCase();
      }

      if (code === 'Enter') {
        this.page.submit(event);
        return;
      }

      if (code === 'Record') {
        this.toggleRecognition();
        return;
      }

      if (!this.isCaps) {
        this.print(pressedKeyObj, this.isShift ? pressedKeyObj.shift : pressedKeyObj.small);
      } else {
        if (this.isShift) {
          this.print(
            pressedKeyObj,
            pressedKeyObj.subst.innerHTML ? pressedKeyObj.shift : pressedKeyObj.small,
          );
        } else if (!this.isShift) {
          this.print(
            pressedKeyObj,
            !pressedKeyObj.subst.innerHTML ? pressedKeyObj.shift : pressedKeyObj.small,
          );
        }
      }
    } else if (type.match(/keyup|mouseup/)) {
      if (!code.match(/CapsLock|Shift/)) {
        pressedKeyObj.keyContainer.element.classList.remove('active');
      }

      if (code.match(/Shift/) && type === 'keyup') {
        this.isShift = false;
        this.switchUpperCase();
        pressedKeyObj.keyContainer.element.classList.remove('active');
      }

      if (code === 'Done') {
        this.close();
      }
    }
  }

  switchUpperCase() {
    const symbolKeyButtons = this.keyButtons.filter(button => button.isFnKey === false);
    symbolKeyButtons.forEach(button => {
      if (button.subst.element.innerHTML) {
        if (this.isShift) {
          button.subst.element.classList.add('sub-active');
          button.letter.element.classList.add('sub-inactive');
        } else {
          button.subst.element.classList.remove('sub-active');
          button.letter.element.classList.remove('sub-inactive');
        }
      } else {
        if (this.isCaps) {
          if (this.isShift) {
            button.letter.element.innerHTML = button.small;
          } else {
            button.letter.element.innerHTML = button.shift;
          }
        } else {
          if (this.isShift) {
            button.letter.element.innerHTML = button.shift;
          } else {
            button.letter.element.innerHTML = button.small;
          }
        }
      }
    });
  }

  print(keyObj, symbol) {
    let carriagePos = this.textarea.selectionStart;
    const leftArea = this.textarea.value.slice(0, carriagePos);
    const rightArea = this.textarea.value.slice(carriagePos);
    const fnBtnHandler = {
      Tab: () => {
        this.textarea.value = `${leftArea}\t${rightArea}`;
        carriagePos += 1;
      },
      Space: () => {
        this.textarea.value = `${leftArea} ${rightArea}`;
        carriagePos += 1;
      },
      Backspace: () => {
        this.textarea.value = `${leftArea.slice(0, -1)}${rightArea}`;
        carriagePos -= 1;
      },
      Delete: () => {
        this.textarea.value = `${leftArea}${rightArea.slice(1)}`;
      },
      ArrowLeft: () => {
        carriagePos = carriagePos - 1 >= 0 ? carriagePos - 1 : 0;
      },
      ArrowRight: () => {
        carriagePos += 1;
      },
      ArrowUp: () => {
        const posFromLineBreak = leftArea.match(/(\n).*$(?!\1)/g) || [[1]];
        carriagePos -= posFromLineBreak[0].length;
      },
      ArrowDown: () => {
        const posFromLineBreak = rightArea.match(/^.*(\n).*(?!\1)/) || [[1]];
        carriagePos += posFromLineBreak[0].length;
      },
      Record: () => {
        this.textarea.value = `${leftArea}${symbol || ''}${rightArea}`;
        carriagePos += symbol.length;
      },
    };

    if (fnBtnHandler[keyObj.code]) fnBtnHandler[keyObj.code]();
    else if (!keyObj.isFnKey) {
      this.textarea.value = `${leftArea}${symbol || ''}${rightArea}`;
      carriagePos += 1;
    }
    this.textarea.setSelectionRange(carriagePos, carriagePos);

    this.page.displayMatches();
  }

  toggleRecognition() {
    this.isRecording = !this.isRecording;

    if (this.isRecording) {
      // eslint-disable-next-line no-undef
      this.recognition = new SpeechRecognition();
      this.recognition.interimResults = false;
      this.recognition.lang = 'en';
      this.recognition.addEventListener('result', e => this.recognizeSpeech(e));
      this.recognition.addEventListener('end', this.recognition.start);
      this.recognition.start();
      document.querySelector('[data-code="Record"]').classList.add('recording');
    } else {
      this.recognition.removeEventListener('result', e => this.recognizeSpeech(e));
      this.recognition.removeEventListener('end', this.recognition.start);
      this.recognition.stop();
      this.recognition = null;
      document.querySelector('[data-code="Record"]').classList.remove('recording');
    }
  }

  recognizeSpeech(e) {
    const recordKey = this.keyButtons.find(keyButton => keyButton.code === 'Record');
    if (!recordKey) return;

    const transcript = `${Array.from(e.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('')} `;

    this.print(recordKey, transcript);
  }
}
