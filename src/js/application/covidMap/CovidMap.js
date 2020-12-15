import L from 'leaflet';
import ElementBuilder from '../utils/ElementBuilder';

export default class CovidMap {
  constructor(instance, api) {
    this.AppInstance = instance;
    this.api = api;
    this.mapOptions = {
      center: [0, 0],
      zoom: 2,
    };
    this.container = new ElementBuilder('div', 'center-col');
    this.container.appendToBody();
    this.init();
  }

  init() {
    this.covidMaps = new ElementBuilder('div', 'center-col__map');
    this.container.append(this.covidMaps);
  }

  createMap() {
    // eslint-disable-next-line new-cap
    this.map = new L.map(this.covidMaps.element, this.mapOptions);
    this.layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    this.map.addLayer(this.layer);
    const circleCenter = [17.385044, 78.486671];
    this.circleOptions = {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
    };
    const circle = L.circle(circleCenter, 900000, this.circleOptions);
    circle.addTo(this.map);
    console.log(this.AppInstance.countries.dataCountries.Countries[1]);
  }
}