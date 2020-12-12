import Api from './api/Api';

export default class App {
  constructor() {
    if (App.exists) return App.instance;
    App.instance = this;
    App.exists = true;

    App.api = new Api(App.instance);
  }
}
