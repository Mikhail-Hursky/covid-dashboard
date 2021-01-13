import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4GeoDataWorldLow from '@amcharts/amcharts4-geodata/worldLow';
import am4ThemesAnimated from '@amcharts/amcharts4/themes/animated';
import { capitalizeFirstLetter } from '../utils/helpers';
import {
  activeColor, activeCountryColor,
  backgroundColor, black, buttonStrokeColor,
  confirmedColor,
  countryColor, countryHoverColor,
  countryStrokeColor,
  deathsColor,
  recoveredColor, white,
} from './colors';

export default class CovidMap {
  constructor(instance) {
    this.AppInstance = instance;
    this.covidData = instance.dataCordinat.slice();
    this.table = false;
    this.createMap();
    this.worldIndex = 0;
    this.sliderCurrent = 1;
  }

  // eslint-disable-next-line class-methods-use-this
  createMap() {
    const arrCountries = this.AppInstance.dataCountries[1];
    let world = 0;
    let str = '';

    arrCountries.forEach(el => {
      world += el.population;
      str += `"${el.countryInfo.iso2}":${el.population},`;
    });

    str += `"world":${world},`;
    this.population = JSON.parse(`{${str.substring(0, str.length - 1)}}`);

    for (let i = 0; i < this.covidData.length; i++) {
      const worldCases = {
        active: 0,
        confirmed: 0,
        deaths: 0,
        id: 'World',
        recovered: 0,
      };

      for (let j = 0; j < this.covidData[i].list.length; j++) {
        worldCases.active += this.covidData[i].list[j].active;
        worldCases.confirmed += this.covidData[i].list[j].confirmed;
        worldCases.deaths += this.covidData[i].list[j].deaths;
        worldCases.recovered += this.covidData[i].list[j].recovered;
      }

      this.covidData[i].list.push(worldCases);
    }

    am4core.useTheme(am4ThemesAnimated);

    am4core.ready(() => {
      this.prepareDta();
      this.indexCountryMap();
      this.calculatedActiveCases();
      this.slideData = this.getSlideData();
      this.mapData = JSON.parse(JSON.stringify(this.slideData.list));
      this.removeItemsWithZeroValue();
      this.max = { confirmed: 0, recovered: 0, deaths: 0 };
      this.maxPC = { confirmed: 0, recovered: 0, deaths: 0, active: 0 };
      this.theLastDayMost();
      this.createMainContainer();
      this.createMapChart();
      this.createPolygonSeries();
      this.createPolygonTemplate();
      this.createBubbleSeries();
      this.createImageTemplate();
      this.addCircleInsideImage();
      this.createBtnAndChartContainer();
      this.createChartAnSliderContainer();
      this.createBottomChart();
      this.createDateAxis();
      this.createCursorAndLegend();
      this.createActiveSeries();
      this.createLabel();
      this.createBtn();
      this.mapContainer.events.on('layoutvalidated', () => {
        this.dateAxis.tooltip.hide();
        this.lineChart.cursor.hide();
        this.updateTotals(this.currentIndex);
      });

      this.updateCountryName();
      this.changeDataType('active');
      this.updateSeriesTooltip();
      this.showWorld();
      this.AppInstance.addFullSreenToggle(this.AppInstance.centerCol);
    });
  }

  prepareDta() {
    this.numberFormatter = new am4core.NumberFormatter();

    this.backgroundColor = am4core.color(backgroundColor);
    this.activeColor = am4core.color(activeColor);
    this.confirmedColor = am4core.color(confirmedColor);
    this.recoveredColor = am4core.color(recoveredColor);
    this.deathsColor = am4core.color(deathsColor);
    this.countryColor = am4core.color(countryColor);
    this.countryStrokeColor = am4core.color(countryStrokeColor);
    this.buttonStrokeColor = am4core.color(buttonStrokeColor);
    this.countryHoverColor = am4core.color(countryHoverColor);
    this.activeCountryColor = am4core.color(activeCountryColor);

    this.colors = {
      active: this.activeColor,
      confirmed: this.confirmedColor,
      recovered: this.recoveredColor,
      deaths: this.deathsColor,
    };

    this.currentCountry = 'World';
    this.lastDate = new Date(this.covidData[this.covidData.length - 1].date);
    this.currentDate = new Date(this.covidData[this.covidData.length - 1].date);
    this.perCapita = false;

    this.buttonsKey = ['active', 'confirmed', 'recovered', 'deaths'];
  }

  indexCountryMap() {
    this.countryIndexMap = {};
    const list = this.covidData[this.covidData.length - 1].list;
    list.forEach((country, index) => {
      this.countryIndexMap[country.id] = index;
    });
  }

  calculatedActiveCases() {
    this.covidData.forEach(el => {
      el.list.forEach(active => {
        active.active = active.confirmed - active.recovered;
      });
    });
  }

  getSlideData(index) {
    if (!index) index = this.covidData.length - 1;
    return this.covidData[index];
  }

  removeItemsWithZeroValue() {
    for (let i = this.mapData.length - 1; i >= 0; i--) {
      if (this.mapData[i].confirmed === 0) this.mapData.splice(i, 1);
    }
  }

  theLastDayMost() {
    for (let i = 0; i < this.mapData.length; i++) {
      const dayInfo = this.mapData[i];
      if (dayInfo.confirmed > this.max.confirmed) this.max.confirmed = dayInfo.confirmed;
      if (dayInfo.recovered > this.max.recovered) this.max.recovered = dayInfo.recovered;
      if (dayInfo.deaths > this.max.deaths) this.max.deaths = dayInfo.deaths;
      this.max.active = this.max.confirmed;
    }
  }

  createMainContainer() {
    this.mapContainer = am4core.create('center-col', am4core.Container);
    this.mapContainer.width = am4core.percent(100);
    this.mapContainer.height = am4core.percent(100);

    this.mapContainer.tooltip = new am4core.Tooltip();
    this.mapContainer.tooltip.background.fill = am4core.color(black);
    this.mapContainer.tooltip.background.stroke = this.activeColor;
    this.mapContainer.tooltip.fontSize = '0.9em';
    this.mapContainer.tooltip.getFillFromObject = false;
    this.mapContainer.tooltip.getStrokeFromObject = false;
  }

  createMapChart() {
    this.mapChart = this.mapContainer.createChild(am4maps.MapChart);
    this.mapChart.height = am4core.percent(80);
    this.mapChart.zoomControl = new am4maps.ZoomControl();
    this.mapChart.zoomControl.align = 'right';
    this.mapChart.zoomControl.marginRight = 15;
    this.mapChart.zoomControl.valign = 'middle';
    this.mapChart.homeGeoPoint = { longitude: 0, latitude: -2 };

    this.mapChart.zoomControl.minusButton.events.on('hit', () => {
      this.showWorld();
    });

    this.mapChart.seriesContainer.background.events.on('hit', () => {
      this.showWorld();
    });
    this.mapChart.seriesContainer.background.events.on('over', () => {
      this.resetHover();
    });

    this.mapChart.seriesContainer.background.fillOpacity = 0;
    this.mapChart.zoomEasing = am4core.ease.sinOut;

    this.mapChart.geodata = am4GeoDataWorldLow;
    this.mapChart.projection = new am4maps.projections.Miller();
    this.mapChart.panBehavior = 'move';
    this.mapChart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 0.05;
    this.mapChart.backgroundSeries.mapPolygons.template.polygon.fill = am4core.color(white);
    this.mapChart.backgroundSeries.hidden = true;
  }

  createPolygonSeries() {
    this.polygonSeries = this.mapChart.series.push(new am4maps.MapPolygonSeries());
    this.polygonSeries.dataFields.id = 'id';
    this.polygonSeries.dataFields.value = 'confirmedPC';
    this.polygonSeries.interpolationDuration = 0;
    this.polygonSeries.exclude = ['AQ'];
    this.polygonSeries.useGeodata = true;
    this.polygonSeries.nonScalingStroke = true;
    this.polygonSeries.strokeWidth = 0.5;
    this.polygonSeries.calculateVisualCenter = true;
    this.polygonSeries.data = this.mapData;
  }

  createPolygonTemplate() {
    this.polygonTemplate = this.polygonSeries.mapPolygons.template;
    this.polygonTemplate.fill = this.countryColor;
    this.polygonTemplate.fillOpacity = 1;
    this.polygonTemplate.stroke = this.countryStrokeColor;
    this.polygonTemplate.strokeOpacity = 0.15;
    this.polygonTemplate.setStateOnChildren = true;
    this.polygonTemplate.tooltipPosition = 'fixed';

    this.polygonTemplate.events.on('hit', e => {
      this.AppInstance.table.preGetSelectedCountry(e.target.dataItem.id);
      this.selectCountry(this.polygonSeries.getPolygonById(e.target.dataItem.id));
    });
    this.polygonTemplate.events.on('over', e => {
      this.rollOverCountry(e.target);
    });
    this.polygonTemplate.events.on('out', e => {
      this.rollOverCountry(e.target);
    });

    this.polygonSeries.heatRules.push({
      target: this.polygonTemplate,
      property: 'fill',
      min: this.countryColor,
      max: this.countryColor,
      dataField: 'value',
    });
    this.setPolygonStates();
  }

  selectCountry(mapPolygon) {
    this.resetHover();
    this.polygonSeries.hideTooltip();
    const countryIndex = this.countryIndexMap[mapPolygon.dataItem.id];
    this.currentCountry = mapPolygon.dataItem.dataContext.name;

    this.polygonSeries.mapPolygons.each(polygon => {
      polygon.isActive = false;
    });

    this.setCountryData(countryIndex);
    this.updateTotals(this.currentIndex);
    this.updateCountryName();
    mapPolygon.isActive = true;
  }

  showWorld() {
    if (this.table) {
      this.AppInstance.table.pressBackBtn();
      this.AppInstance.countries.input.element.value = '';
    }
    this.AppInstance.countries.displayMatches();
    this.currentCountry = 'World';
    this.currentPolygon = undefined;
    this.resetHover();

    this.polygonSeries.mapPolygons.each(polygon => {
      polygon.isActive = false;
    });

    this.updateCountryName();
    this.setCountryData(this.worldIndex);
    this.lineChart.invalidateRawData();
    this.updateTotals(this.currentIndex);
    this.mapChart.goHome();
  }

  resetHover() {
    this.polygonSeries.mapPolygons.values.forEach(polygon => {
      polygon.isHover = false;
    });
    this.bubbleSeries.mapImages.each(image => {
      image.isHover = false;
    });
  }

  updateCountryName() {
    this.countryName.text = `${this.currentCountry}, ${this.mapChart.dateFormatter.format(
      this.currentDate,
      'MMM dd, yyyy',
    )}`;
  }

  setCountryData(countryIndex) {
    for (let i = 0; i < this.lineChart.data.length; i++) {
      const dayInfo = this.covidData[i].list;

      let countryData = dayInfo[countryIndex];
      if (this.currentCountry === 'World' && countryIndex === this.worldIndex) {
        countryData = dayInfo[dayInfo.length - 1];
      }
      const dataContext = this.lineChart.data[i];
      if (countryData) {
        dataContext.recovered = countryData.recovered;
        dataContext.confirmed = countryData.confirmed;
        dataContext.deaths = countryData.deaths;
        dataContext.active = countryData.confirmed - countryData.recovered - countryData.deaths;
        this.valueAxis.min = undefined;
        this.valueAxis.max = undefined;
      } else {
        dataContext.recovered = 0;
        dataContext.confirmed = 0;
        dataContext.deaths = 0;
        dataContext.active = 0;
        this.valueAxis.min = 0;
        this.valueAxis.max = 10;
      }
    }

    this.lineChart.invalidateRawData();
    this.updateTotals(this.currentIndex);
    setTimeout(this.updateSeriesTooltip, 1000);
  }

  updateTotals(index) {
    if (index) {
      const di = this.covidData[index];
      const date = new Date(di.date);
      this.currentDate = date;

      this.updateCountryName();

      let position = this.dateAxis.dateToPosition(date);
      position = this.dateAxis.toGlobalPosition(position);
      const x = this.dateAxis.positionToCoordinate(position);

      if (this.lineChart.cursor) {
        this.lineChart.cursor.triggerMove({ x, y: 0 }, 'soft', true);
      }
      this.buttonsKey.forEach(key => {
        const count = Number(this.lineChart.data[index][key]);
        if (!Number.isNaN(count)) {
          this.buttons[key].label.text = `${capitalizeFirstLetter(
            key,
          )}: ${this.numberFormatter.format(count, '#,###')}`;
        }
      });
      this.currentIndex = index;
    }
  }

  updateSeriesTooltip() {
    if (!this.currentDate) return;
    let position = this.dateAxis.dateToPosition(this.currentDate);
    position = this.dateAxis.toGlobalPosition(position);
    const x = this.dateAxis.positionToCoordinate(position);

    this.lineChart.cursor.triggerMove({ x, y: 0 }, 'soft', true);
    this.lineChart.series.each(series => {
      if (!series.isHidden) {
        series.tooltip.disabled = false;
        series.showTooltipAtDataItem(series.tooltipDataItem);
      }
    });
  }

  rollOverCountry(mapPolygon) {
    this.resetHover();
    if (mapPolygon) {
      mapPolygon.isHover = true;
      const image = this.bubbleSeries.getImageById(mapPolygon.dataItem.id);
      if (image) {
        image.dataItem.dataContext.name = mapPolygon.dataItem.dataContext.name;
        image.isHover = true;
      }
    }
  }

  setPolygonStates() {
    this.polygonHoverState = this.polygonTemplate.states.create('hover');
    this.polygonHoverState.transitionDuration = 1400;
    this.polygonHoverState.properties.fill = this.countryHoverColor;

    this.polygonActiveState = this.polygonTemplate.states.create('active');
    this.polygonActiveState.properties.fill = this.activeCountryColor;
  }

  createBubbleSeries() {
    this.bubbleSeries = this.mapChart.series.push(new am4maps.MapImageSeries());
    this.bubbleSeries.data = JSON.parse(JSON.stringify(this.mapData));

    this.bubbleSeries.dataFields.value = 'confirmed';
    this.bubbleSeries.dataFields.id = 'id';

    this.bubbleSeries.tooltip.animationDuration = 0;
    this.bubbleSeries.tooltip.showInViewport = false;
    this.bubbleSeries.tooltip.background.fillOpacity = 0.2;
    this.bubbleSeries.tooltip.getStrokeFromObject = true;
    this.bubbleSeries.tooltip.getFillFromObject = false;
    this.bubbleSeries.tooltip.background.fillOpacity = 0.2;
    this.bubbleSeries.tooltip.background.fill = am4core.color(black);
  }

  createImageTemplate() {
    this.imageTemplate = this.bubbleSeries.mapImages.template;
    this.imageTemplate.nonScaling = true;
    this.imageTemplate.strokeOpacity = 0;
    this.imageTemplate.fillOpacity = 0.55;
    this.imageTemplate.tooltipText = '{name}: [bold]{value}[/]';
    this.imageTemplate.applyOnClones = true;

    this.imageTemplate.events.on('over', this.handleImageOver.bind(this));
    this.imageTemplate.events.on('out', this.handleImageOut.bind(this));
    this.imageTemplate.events.on('hit', this.handleImageHit.bind(this));
    this.imageTemplate.adapter.add('tooltipY', (tooltipY, target) => {
      return -target.children.getIndex(0).radius;
    });
    this.imageHoverState = this.imageTemplate.states.create('hover');
    this.imageHoverState.properties.fillOpacity = 1;
  }

  handleImageOver(event) {
    this.rollOverCountry(this.polygonSeries.getPolygonById(event.target.dataItem.id));
  }

  handleImageOut(event) {
    this.rollOverCountry(this.polygonSeries.getPolygonById(event.target.dataItem.id));
  }

  handleImageHit(event) {
    this.selectCountry(this.polygonSeries.getPolygonById(event.target.dataItem.id));
  }

  addCircleInsideImage() {
    this.circle = this.imageTemplate.createChild(am4core.Circle);
    this.circle.hiddenState.properties.scale = 0.0001;
    this.circle.hiddenState.transitionDuration = 2000;
    this.circle.defaultState.transitionDuration = 2000;
    this.circle.defaultState.transitionEasing = am4core.ease.elasticOut;
    this.circle.applyOnClones = true;
    this.bubbleSeries.heatRules.push({
      target: this.circle,
      property: 'radius',
      min: 6,
      max: 24,
      dataField: 'value',
    });

    this.bubbleSeries.events.on('dataitemsvalidated', () => {
      this.bubbleSeries.dataItems.each(dataItem => {
        const mapImage = dataItem.mapImage;
        const circle = mapImage.children.getIndex(0);
        if (mapImage.dataItem.value === 0) {
          circle.hide(0);
        } else if (circle.isHidden || circle.isHiding) {
          circle.show();
        }
      });
    });

    this.imageTemplate.adapter.add('latitude', (latitude, target) => {
      const polygon = this.polygonSeries.getPolygonById(target.dataItem.id);
      if (polygon) {
        target.disabled = false;
        return polygon.visualLatitude;
      }
      target.disabled = true;

      return latitude;
    });

    this.imageTemplate.adapter.add('longitude', (longitude, target) => {
      const polygon = this.polygonSeries.getPolygonById(target.dataItem.id);
      if (polygon) {
        target.disabled = false;
        return polygon.visualLongitude;
      }
      target.disabled = true;

      return longitude;
    });
  }

  createBtnAndChartContainer() {
    this.buttonsAndChartContainer = this.mapContainer.createChild(am4core.Container);
    this.buttonsAndChartContainer.layout = 'vertical';
    this.buttonsAndChartContainer.height = am4core.percent(45);
    this.buttonsAndChartContainer.width = am4core.percent(100);
    this.buttonsAndChartContainer.valign = 'bottom';

    this.nameAndButtonsContainer = this.buttonsAndChartContainer.createChild(am4core.Container);
    this.nameAndButtonsContainer.width = am4core.percent(100);
    this.nameAndButtonsContainer.padding(0, 10, 5, 20);
    this.nameAndButtonsContainer.layout = 'horizontal';

    this.countryName = this.nameAndButtonsContainer.createChild(am4core.Label);
    this.countryName.fontSize = '2.5em';
    this.countryName.fill = am4core.color(white);
    this.countryName.valign = 'middle';

    this.buttonsContainer = this.nameAndButtonsContainer.createChild(am4core.Container);
    this.buttonsContainer.layout = 'grid';
    this.buttonsContainer.width = am4core.percent(100);
    this.buttonsContainer.x = 10;
    this.buttonsContainer.contentAlign = 'right';
  }

  createChartAnSliderContainer() {
    this.chartAndSliderContainer = this.buttonsAndChartContainer.createChild(am4core.Container);
    this.chartAndSliderContainer.layout = 'vertical';
    this.chartAndSliderContainer.height = am4core.percent(100);
    this.chartAndSliderContainer.width = am4core.percent(100);
    this.chartAndSliderContainer.background = new am4core.RoundedRectangle();
    this.chartAndSliderContainer.background.fill = am4core.color(black);
    this.chartAndSliderContainer.background.cornerRadius(30, 30, 0, 0);
    this.chartAndSliderContainer.background.fillOpacity = 0.5;
    this.chartAndSliderContainer.paddingTop = 12;
    this.chartAndSliderContainer.paddingBottom = 0;

    this.sliderContainer = this.chartAndSliderContainer.createChild(am4core.Container);
    this.sliderContainer.width = am4core.percent(100);
    this.sliderContainer.padding(0, 15, 15, 10);
    this.sliderContainer.layout = 'horizontal';

    this.slider = this.sliderContainer.createChild(am4core.Slider);
    this.slider.width = am4core.percent(100);
    this.slider.valign = 'middle';
    this.slider.background.opacity = 0.4;
    this.slider.opacity = 1;
    this.slider.background.fill = am4core.color(white);
    this.slider.marginLeft = 20;
    this.slider.marginRight = 35;
    this.slider.height = 15;
    this.slider.start = 1;

    this.slider.events.on('rangechanged', () => {
      const index = Math.round((this.covidData.length - 1) * this.slider.start);
      const data = this.getSlideData(index);
      this.updateMapData(data.list);
      this.updateTotals(index);
    });

    this.slider.startGrip.events.on('drag', () => {
      this.stop();
      if (this.sliderAnimation) {
        this.sliderAnimation.setProgress(this.slider.start);
      }
    });

    this.playButton = this.sliderContainer.createChild(am4core.PlayButton);
    this.playButton.valign = 'middle';

    this.playButton.events.on('toggled', event => {
      if (event.target.isActive) {
        this.play();
      } else {
        this.stop();
      }
    });

    this.slider.startGrip.background.fill = this.playButton.background.fill;
    this.slider.startGrip.background.strokeOpacity = 0;
    this.slider.startGrip.icon.stroke = am4core.color(white);
    this.slider.startGrip.background.states.copyFrom(this.playButton.background.states);
  }

  updateMapData(data) {
    this.bubbleSeries.dataItems.each(dataItem => {
      dataItem.dataContext.confirmed = 0;
      dataItem.dataContext.deaths = 0;
      dataItem.dataContext.recovered = 0;
      dataItem.dataContext.active = 0;
    });

    this.maxPC = { active: 0, confirmed: 0, deaths: 0, recovered: 0 };

    data.forEach(el => {
      const image = this.bubbleSeries.getImageById(el.id);
      const polygon = this.polygonSeries.getPolygonById(el.id);
      const population = Number(this.population[el.id]);

      if (image) {
        image.dataItem.dataContext.confirmed = el.confirmed;
        image.dataItem.dataContext.deaths = el.deaths;
        image.dataItem.dataContext.recovered = el.recovered;
        image.dataItem.dataContext.active = el.confirmed - el.recovered - el.deaths;
      }

      if (polygon) {
        polygon.dataItem.dataContext.confirmedPC = (el.confirmed / population) * 1000000;
        polygon.dataItem.dataContext.deathsPC = (el.deaths / population) * 1000000;
        polygon.dataItem.dataContext.recoveredPC = (el.recovered / population) * 1000000;
        polygon.dataItem.dataContext.active = el.confirmed - el.recovered - el.deaths;
        polygon.dataItem.dataContext.activePC =
          (polygon.dataItem.dataContext.active / population) * 1000000;

        if (population > 100000) {
          if (polygon.dataItem.dataContext.confirmedPC > this.maxPC.confirmed) {
            this.maxPC.confirmed = polygon.dataItem.dataContext.confirmedPC;
          }
          if (polygon.dataItem.dataContext.deathsPC > this.maxPC.deaths) {
            this.maxPC.deaths = polygon.dataItem.dataContext.deathsPC;
          }
          if (polygon.dataItem.dataContext.recoveredPC > this.maxPC.recovered) {
            this.maxPC.recovered = polygon.dataItem.dataContext.recoveredPC;
          }
          if (polygon.dataItem.dataContext.activePC > this.maxPC.active) {
            this.maxPC.active = polygon.dataItem.dataContext.activePC;
          }
        }
      }

      this.bubbleSeries.heatRules.getIndex(0).maxValue = this.max[this.currentType];
      this.polygonSeries.heatRules.getIndex(0).maxValue = this.maxPC[this.currentType];

      this.bubbleSeries.invalidateRawData();
      this.polygonSeries.invalidateRawData();
    });
  }

  stop() {
    if (this.sliderAnimation) {
      this.sliderAnimation.pause();
    }
    this.playButton.isActive = false;
  }

  play() {
    if (!this.sliderAnimation) {
      this.sliderAnimation = this.slider
        .animate({ property: 'start', to: 1, from: 0 }, 50000, am4core.ease.linear)
        .pause();
      this.sliderAnimation.events.on('animationended', () => {
        this.playButton.isActive = false;
      });
    }

    if (this.slider.start >= this.sliderCurrent) {
      this.slider.start = 0;
      this.sliderAnimation.start();
    }
    this.sliderAnimation.resume();
    this.playButton.isActive = true;
  }

  createBottomChart() {
    this.lineChart = this.chartAndSliderContainer.createChild(am4charts.XYChart);
    this.lineChart.fontSize = '1em';
    this.lineChart.paddingRight = 30;
    this.lineChart.paddingLeft = 30;
    this.lineChart.maskBullets = false;
    this.lineChart.zoomOutButton.disabled = true;
    this.lineChart.paddingBottom = 5;
    this.lineChart.paddingTop = 15;
    this.lineChart.data = JSON.parse(JSON.stringify(this.covidData));
  }

  createDateAxis() {
    this.dateAxis = this.lineChart.xAxes.push(new am4charts.DateAxis());
    this.dateAxis.renderer.minGridDistance = 50;
    this.dateAxis.renderer.grid.template.stroke = am4core.color(black);
    this.dateAxis.renderer.grid.template.strokeOpacity = 0.25;
    this.dateAxis.max = this.lastDate.getTime() + am4core.time.getDuration('day', 5);
    this.dateAxis.tooltip.label.fontSize = '1.5em';
    this.dateAxis.tooltip.background.fill = this.activeColor;
    this.dateAxis.tooltip.background.stroke = this.activeColor;
    this.dateAxis.renderer.labels.template.fill = am4core.color(white);

    this.valueAxis = this.lineChart.yAxes.push(new am4charts.ValueAxis());
    this.valueAxis.renderer.opposite = true;
    this.valueAxis.interpolationDuration = 3000;
    this.valueAxis.renderer.grid.template.stroke = am4core.color(black);
    this.valueAxis.renderer.grid.template.strokeOpacity = 0.25;
    this.valueAxis.renderer.minGridDistance = 30;
    this.valueAxis.renderer.maxLabelPosition = 0.98;
    this.valueAxis.renderer.baseGrid.disabled = true;
    this.valueAxis.tooltip.disabled = true;
    this.valueAxis.extraMax = 0.05;
    this.valueAxis.maxPrecision = 0;
    this.valueAxis.renderer.inside = true;
    this.valueAxis.renderer.labels.template.verticalCenter = 'bottom';
    this.valueAxis.renderer.labels.template.fill = am4core.color(white);
    this.valueAxis.renderer.labels.template.padding(2, 2, 2, 2);
    this.valueAxis.adapter.add('max', max => {
      if (max < 5) max = 5;
      return max;
    });

    // eslint-disable-next-line consistent-return
    this.valueAxis.adapter.add('min', min => {
      if (!this.seriesTypeSwitch.isActive) {
        if (min < 0) min = 0;
        return min;
      }
    });
  }

  createCursorAndLegend() {
    this.lineChart.cursor = new am4charts.XYCursor();
    this.lineChart.cursor.maxTooltipDistance = 0;
    this.lineChart.cursor.behavior = 'none';
    this.lineChart.cursor.lineY.disabled = true;
    this.lineChart.cursor.lineX.stroke = this.activeColor;
    this.lineChart.cursor.xAxis = this.dateAxis;
    am4core
      .getInteraction()
      .body.events.off('down', this.lineChart.cursor.handleCursorDown, this.lineChart.cursor);
    am4core
      .getInteraction()
      .body.events.off('up', this.lineChart.cursor.handleCursorUp, this.lineChart.cursor);

    this.lineChart.legend = new am4charts.Legend();
    this.lineChart.legend.parent = this.lineChart.plotContainer;
    this.lineChart.legend.labels.template.fill = am4core.color(white);
    this.lineChart.legend.markers.template.height = 8;
    this.lineChart.legend.contentAlign = 'left';
    this.lineChart.legend.fontSize = '1.7em';
    this.lineChart.legend.itemContainers.template.valign = 'middle';

    this.seriesTypeSwitch = this.lineChart.legend.createChild(am4core.SwitchButton);
    this.seriesTypeSwitch.leftLabel.text = 'totals';
    this.seriesTypeSwitch.rightLabel.text = 'day change';
    this.seriesTypeSwitch.leftLabel.fill = am4core.color(white);
    this.seriesTypeSwitch.rightLabel.fill = am4core.color(white);

    this.seriesTypeSwitch.events.on('down', () => {
      this.legendDown = true;
    });
    this.seriesTypeSwitch.events.on('up', () => {
      setTimeout(() => {
        this.legendDown = false;
      }, 100);
    });

    this.seriesTypeSwitch.events.on('toggled', () => {
      if (this.seriesTypeSwitch.isActive) {
        if (!this.columnSeries) {
          this.createColumnSeries();
        }

        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const key in this.columnSeries) {
          this.columnSeries[key].hide(0);
        }

        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const key in this.series) {
          this.series[key].hiddenInLegend = true;
          this.series[key].hide();
        }

        this.columnSeries[this.currentType].show();
      } else {
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const key in this.columnSeries) {
          this.columnSeries[key].hiddenInLegend = true;
          this.columnSeries[key].hide();
        }

        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const key in this.series) {
          this.series[key].hiddenInLegend = false;
          this.series[key].hide();
        }

        this.series[this.currentType].show();
      }
    });
  }

  createColumnSeries() {
    this.columnSeries = {};
    this.columnSeries.active = this.addColumnSeries('active', this.activeColor);
    this.columnSeries.active.events.on('validated', () => {
      this.updateColumnsFill();
    });

    this.columnSeries.confirmed = this.addColumnSeries('confirmed', this.confirmedColor);
    this.columnSeries.recovered = this.addColumnSeries('recovered', this.recoveredColor);
    this.columnSeries.deaths = this.addColumnSeries('deaths', this.deathsColor);
  }

  updateColumnsFill() {
    this.columnSeries.active.columns.each(column => {
      if (column.dataItem.values.valueY.previousChange < 0) {
        column.fillOpacity = 0;
        column.strokeOpacity = 0.6;
      } else {
        column.fillOpacity = 0.6;
        column.strokeOpacity = 0;
      }
    });
  }

  addColumnSeries(name, color) {
    let series = this.lineChart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = name;
    series.dataFields.valueYShow = 'previousChange';
    series.dataFields.dateX = 'date';
    series.name = capitalizeFirstLetter(name);
    series.hidden = true;
    series.stroke = color;
    series.fill = color;
    series.columns.template.fillOpacity = 0.6;
    series.columns.template.strokeOpacity = 0;
    series.hideTooltipWhileZooming = true;
    series.clustered = false;
    series.hiddenInLegend = true;
    series.columns.template.width = am4core.percent(50);

    series = this.seriesTooltipSetting(series)
    series.tooltip.fontSize = '1.1em';
    series.tooltipText = "{name}: {valueY.previousChange.formatNumber('+#,###|#,###|0')}";

    return series;
  }

  createActiveSeries() {
    this.activeSeries = this.addSeries('active', this.activeColor);
    this.activeSeries.tooltip.disabled = true;
    this.activeSeries.hidden = false;

    this.confirmedSeries = this.addSeries('confirmed', this.confirmedColor);
    this.recoveredSeries = this.addSeries('recovered', this.recoveredColor);
    this.deathsSeries = this.addSeries('deaths', this.deathsColor);

    this.series = {
      active: this.activeSeries,
      confirmed: this.confirmedSeries,
      recovered: this.recoveredSeries,
      deaths: this.deathsSeries,
    };
  }

  addSeries(name, color) {
    let series = this.lineChart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = name;
    series.dataFields.dateX = 'date';
    series.name = capitalizeFirstLetter(name);
    series.strokeOpacity = 1;
    series.stroke = color;
    series.fill = color;
    series.maskBullets = false;
    series.minBulletDistance = 10;
    series.hidden = true;
    series.hideTooltipWhileZooming = true;

    const bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.setStateOnChildren = true;
    bullet.circle.fillOpacity = 1;
    bullet.circle.fill = this.backgroundColor;
    bullet.circle.radius = 2;

    const circleHoverState = bullet.circle.states.create('hover');
    circleHoverState.properties.fillOpacity = 1;
    circleHoverState.properties.fill = color;
    circleHoverState.properties.scale = 1.4;
    series = this.seriesTooltipSetting(series);

    series.tooltip.dy = -4;
    series.tooltip.fontSize = '2em';
    series.tooltipText = 'Total {name}: {valueY}';
    return series;
  }

  seriesTooltipSetting(series) {
    series.tooltip.pointerOrientation = 'down';
    series.tooltip.getStrokeFromObject = true;
    series.tooltip.getFillFromObject = false;
    series.tooltip.background.fillOpacity = 0.2;
    series.tooltip.background.fill = am4core.color(black);
    return series
  }

  createLabel() {
    this.label = this.lineChart.plotContainer.createChild(am4core.Label);
    this.label.text = 'Current day stats may be incomplete until countries submit their data.';
    this.label.fill = am4core.color(white);
    this.label.fontSize = '1.7em';
    this.label.paddingBottom = 4;
    this.label.opacity = 1;
    this.label.align = 'right';
    this.label.horizontalCenter = 'right';
    this.label.verticalCenter = 'bottom';
  }

  createBtn() {
    this.activeButton = this.addButton('active', this.activeColor);
    this.confirmedButton = this.addButton('confirmed', this.confirmedColor);
    this.recoveredButton = this.addButton('recovered', this.recoveredColor);
    this.deathsButton = this.addButton('deaths', this.deathsColor);

    this.buttons = {
      active: this.activeButton,
      confirmed: this.confirmedButton,
      recovered: this.recoveredButton,
      deaths: this.deathsButton,
    };
  }

  addButton(name, color) {
    const button = this.buttonsContainer.createChild(am4core.Button);
    button.label.valign = 'middle';
    button.label.fill = am4core.color(white);
    button.label.fontSize = '16px';
    button.background.cornerRadius(30, 30, 30, 30);
    button.background.strokeOpacity = 0.3;
    button.background.fillOpacity = 0;
    button.background.stroke = this.buttonStrokeColor;
    button.background.padding(2, 3, 2, 3);
    button.states.create('active');
    button.setStateOnChildren = true;

    const activeHoverState = button.background.states.create('hoverActive');
    activeHoverState.properties.fillOpacity = 0;

    const circle = new am4core.Circle();
    circle.radius = 8;
    circle.fillOpacity = 0.3;
    circle.fill = this.buttonStrokeColor;
    circle.strokeOpacity = 0;
    circle.valign = 'middle';
    circle.marginRight = 5;
    button.icon = circle;
    // save name to dummy data for later use
    button.dummyData = name;
    const circleActiveState = circle.states.create('active');
    circleActiveState.properties.fill = color;
    circleActiveState.properties.fillOpacity = 0.5;
    button.events.on('hit', e => {
      this.changeDataType(e.target.dummyData);
    });

    return button;
  }

  changeDataType(name) {
    this.currentType = name;
    this.currentTypeName = name;
    if (name !== 'deaths') {
      this.currentTypeName += ' cases';
    }

    // eslint-disable-next-line max-len
    this.bubbleSeries.mapImages.template.tooltipText = `[bold font-size:20px]{name}: {value}[/] [font-size:20px]\n${this.currentTypeName}`;

    // make button active
    const activeButton = this.buttons[name];
    activeButton.isActive = true;
    // make other buttons inactive
    // eslint-disable-next-line no-restricted-syntax
    for (const key in this.buttons) {
      if (this.buttons[key] !== activeButton) {
        this.buttons[key].isActive = false;
      }
    }
    // tell series new field name
    this.bubbleSeries.dataFields.value = name;
    this.polygonSeries.dataFields.value = `${name}PC`;

    this.bubbleSeries.dataItems.each(dataItem => {
      dataItem.setValue('value', dataItem.dataContext[this.currentType]);
    });

    this.polygonSeries.dataItems.each(dataItem => {
      dataItem.setValue('value', dataItem.dataContext[`${this.currentType}PC`]);
      dataItem.mapPolygon.defaultState.properties.fill = undefined;
    });

    // change color of bubbles
    // setting colors on mapImage for tooltip colors
    this.bubbleSeries.mapImages.template.fill = this.colors[name];
    this.bubbleSeries.mapImages.template.stroke = this.colors[name];
    // first child is circle
    this.bubbleSeries.mapImages.template.children.getIndex(0).fill = this.colors[name];

    this.dateAxis.tooltip.background.fill = this.colors[name];
    this.dateAxis.tooltip.background.stroke = this.colors[name];
    this.lineChart.cursor.lineX.stroke = this.colors[name];

    // show series
    if (this.seriesTypeSwitch.isActive) {
      const activeSeries = this.columnSeries[name];
      activeSeries.show();
      // hide other series
      // eslint-disable-next-line no-restricted-syntax
      for (const key in this.columnSeries) {
        if (this.columnSeries[key] !== activeSeries) {
          this.columnSeries[key].hide();
        }
      }
    } else {
      const activeSeries = this.series[name];
      activeSeries.show();
      // hide other series
      // eslint-disable-next-line no-restricted-syntax
      for (const key in this.series) {
        if (this.series[key] !== activeSeries) {
          this.series[key].hide();
        }
      }
    }

    // update heat rule's maxValue
    this.bubbleSeries.heatRules.getIndex(0).maxValue = this.max[this.currentType];
    this.polygonSeries.heatRules.getIndex(0).maxValue = this.maxPC[this.currentType];
    if (this.perCapita) {
      this.polygonSeries.heatRules.getIndex(0).max = this.colors[name];
      this.updateCountryTooltip();
    }
  }

  updateCountryTooltip() {
    // eslint-disable-next-line
    this.polygonSeries.mapPolygons.template.tooltipText = `[bold]{name}: {value.formatNumber('#.')}[/]\n[font-size:16px] ${this.currentTypeName} per million`;
  }
}
