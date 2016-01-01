import 'whatwg-fetch'
import { TimeSeries, Maps } from './app.js'
import { removeChildren, getMonthYear } from './helpers.js'

Array.prototype.forEach.call(document.querySelectorAll('.nav-item'), nav => {
  nav.addEventListener('click', event => {
    event.preventDefault()
    window.history.pushState(null, '', event.target.textContent.toLowerCase())
    removeChildren(document.getElementById('chart-container'))
    removeChildren(document.getElementById('chart-detail'))
    removeChildren(document.querySelector('.selectors'))
    route()
  })
})

window.onload = function () {
  window.meta = JSON.parse(window.sessionStorage.getItem('meta'))
  if (window.meta) route()
  else {
    console.log('retrieving data from MongoDB')
    const url = window.location.protocol + '//' + window.location.host + '/list'
    const headers = { Accept: 'application/json' }
    window.fetch(url, headers).then(res => res.json()).then(meta => {
      window.meta = meta
      window.sessionStorage.setItem('meta', JSON.stringify(meta))
    }).then(route)
  }
}

function route () {
  Array.prototype.forEach.call(document.querySelectorAll('.nav-item a'), a => {
    a.classList.remove('active')
    if (a.pathname === window.location.pathname) a.classList.add('active')
  })
  document.querySelector('.retrieve-date').textContent =
    window.meta.lastUpdate.slice(8, 10) + ' ' + getMonthYear(window.meta.lastUpdate)
  switch (window.location.pathname) {
    case '/charts':
      return new TimeSeries()
    case '/maps':
      return new Maps()
    default:
      document.querySelector('.nav-item a').classList.add('active')
      return new TimeSeries()
  }
}

document.querySelector('.footer-terms').addEventListener('click', event => {
  event.preventDefault()
  document.querySelector('.terms').classList.toggle('hidden')
})
document.querySelector('.accept-terms').addEventListener('click', event => {
  event.preventDefault()
  document.querySelector('.terms').classList.add('hidden')
})
