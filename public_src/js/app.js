import Plot from './plot.js'
import Heatmap from './heatmap.js'
import 'whatwg-fetch'
import { appendChildren,
         removeChildren,
         capitalizeFirstLetters,
         getMonthYear } from './helpers.js'

window.PouchDB = require('pouchdb')

export class App {
  constructor () {
    removeChildren(document.querySelector('main'))
    removeChildren(document.querySelector('.selectors'))
    this.chartTitle = document.createElement('h1')
    this.chartTitle.id = 'chart-title'
    this.chartContainer = document.createElement('div')
    this.chartContainer.id = 'chart-container'
    this.chartDetail = document.createElement('div')
    this.chartDetail.id = 'chart-detail'
    this.loadingScreen = document.createElement('i')
    this.loadingScreen.id = 'loading'
    this.chartNav = document.querySelector('.selectors')
  }

  createSelections (text, ...dropdowns) {
    const navbarText = document.createElement('p')
    navbarText.classList.add('selectors-item')
    navbarText.textContent = text
    this.chartNav.appendChild(navbarText)

    const form = document.createElement('form')

    dropdowns.forEach(dropdown => {
      const selector = document.createElement('select')
      selector.setAttribute('id', dropdown.selector)
      selector.classList.add('selectors-item')
      dropdown.options.forEach(item => {
        const option = document.createElement('option')
        option.textContent = item
        if (item === dropdown.defaultOption) option.setAttribute('selected', '')
        selector.add(option)
      })
      selector.addEventListener('change', event => this.drawChart())
      form.appendChild(selector)
    })
    this.chartNav.appendChild(form)
  }

  appendChartElements () {
    appendChildren('main', this.chartTitle, this.chartContainer, this.chartDetail)
  }
}

export class TimeSeries extends App {
  constructor () {
    super()
    this.appendChartElements()

    this.drawForm()
    this.townSelection = document.getElementById('select-town')
    this.chartSelection = document.getElementById('select-chart')

    this.plotDiv = document.createElement('div')
    this.plotDiv.setAttribute('id', 'plot-space')
    this.chartContainer.appendChild(this.plotDiv)
    this.chartContainer.appendChild(this.loadingScreen)

    this.plot = new Plot(
      this.townSelection.options[this.townSelection.selectedIndex].value,
      this.chartSelection.options[this.chartSelection.selectedIndex].value,
      this.plotDiv,
      this.chartContainer,
      this.loadingScreen
    )

    this.drawChart()
  }

  drawForm () {
    const text = 'Choose town & chart type'
    const towns = {
      options: window.meta.townList,
      selector: 'select-town',
      defaultOption: 'Ang Mo Kio'
    }
    const charts = {
      options: ['Average', 'Min, Max & Median', 'Smoothed'],
      selector: 'select-chart',
      defaultOption: 'Smoothed'
    }
    this.createSelections(text, towns, charts)
  }

  drawChart () {
    removeChildren(this.chartDetail)

    this.plot.town = this.townSelection.options[this.townSelection.selectedIndex].value
    this.plot.chartType = this.chartSelection.options[this.chartSelection.selectedIndex].value

    if (this.plot.chartType === 'Smoothed') {
      this.chartTitle.innerHTML = 'Historical Trend of HDB Resale Prices <span>in ' + capitalizeFirstLetters(this.plot.town) + '</span>'
    } else if (this.plot.chartType === 'Average') {
      this.chartTitle.innerHTML = 'Historical Average of HDB Resale Prices <span>in ' + capitalizeFirstLetters(this.plot.town) + '</span>'
    } else {
      this.chartTitle.innerHTML = 'Range of Transacted Prices in ' + capitalizeFirstLetters(this.plot.town) + ' <span>(Min, Max & Median)</span>'
    }

    this.plot.plotChart(this.plot.town)
  }
}

export class Maps extends App {
  constructor () {
    super()
    this.appendChartElements()

    this.drawForm()
    this.monthSelection = document.getElementById('select-month')

    this.mapDiv = document.createElement('div')
    this.mapDiv.setAttribute('id', 'map')
    this.chartContainer.appendChild(this.mapDiv)
    this.chartContainer.appendChild(this.loadingScreen)

    this.heatmap = new Heatmap(
      this.monthSelection.options[this.monthSelection.selectedIndex].value,
      this.mapDiv,
      this.chartContainer,
      this.loadingScreen
    )

    this.createButtons()
    this.drawChart()
  }

  createButtons () {
    this.centerMap = document.createElement('i')
    this.centerMap.setAttribute('id', 'reset-map')
    this.centerMap.className = 'fa fa-crosshairs button'
    this.chartContainer.appendChild(this.centerMap)
    this.centerMap.addEventListener('click', event => this.heatmap.resetMap())

    this.prevButton = document.createElement('button')
    this.prevButton.setAttribute('id', 'prev-month')
    this.prevButton.classList.add('button')
    this.prevButton.textContent = '<'
    this.prevButton.addEventListener('click', event => this.prevChart())
    this.chartContainer.appendChild(this.prevButton)

    this.nextButton = document.createElement('button')
    this.nextButton.setAttribute('id', 'next-month')
    this.nextButton.classList.add('button')
    this.nextButton.textContent = '>'
    this.nextButton.disabled = true
    this.nextButton.addEventListener('click', event => this.nextChart())
    this.chartContainer.appendChild(this.nextButton)
  }

  drawForm () {
    const text = 'Choose month'
    const months = {
      options: window.meta.monthList,
      selector: 'select-month',
      defaultOption: window.meta.monthList[window.meta.monthList.length - 1]
    }
    this.createSelections(text, months)
  }

  drawChart () {
    this.heatmap.month = this.monthSelection.options[this.monthSelection.selectedIndex].value
    this.chartTitle.textContent = 'Property Hotspots in ' + getMonthYear(this.heatmap.month)
    this.withinMonthRange(this.monthSelection.selectedIndex)
    this.heatmap.plotHeatmap(this.heatmap.month)
  }

  prevChart () {
    this.monthSelection.selectedIndex--
    this.drawChart()
  }

  nextChart () {
    this.monthSelection.selectedIndex++
    this.drawChart()
  }

  withinMonthRange (idx) {
    this.prevButton.disabled = false
    this.nextButton.disabled = false
    if (idx === 0) this.prevButton.disabled = true
    if (idx === window.meta.monthList.length - 1) this.nextButton.disabled = true
  }
}

export class About extends App {
  constructor () {
    super()
    window.fetch('/about.html').then(res => res.text())
      .then(html => document.querySelector('main').innerHTML = html)
  }
}
