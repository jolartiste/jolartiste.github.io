import { Coverflow, FlickrDataSource } from '../lib/flickr-coverflow-2.1.1.js'
Coverflow.logLevel = 'info'

const dataSource = new FlickrDataSource({
  apiKey: 'd894b19ad1a475b0d9aff1a5eb612419',
  user: '80141149@N00',
  // apiKey: '526aaaa5cbca4f64991e80ea2c67c1e1',
  // user: '12143321@N03',
  pageSize: Coverflow.PAGE_SIZE
})

const artFlow = new Coverflow({
  dataSource,
  container: document.getElementById('coverflow'),
  '3d': true,
  size: 'large',
  prefix: 'fcf'
})

let previous = 'previous'
let next = 'next'
let intervalId
let isSlideshowStopped = false

artFlow.onInit(() => {
  for (const element of Array.from(document.querySelectorAll('.hidden-while-loading'))) {
    element.classList.remove('hidden-while-loading')
  }
  
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (!isSlideshowStopped) {
        startSlideshow()
      }
    } else {
      clearInterval(intervalId)
    }
  })
  
  window.addEventListener('focus', () => {
    if (!isSlideshowStopped) {
      startSlideshow()
    }
  })
  
  document.querySelector('.about').addEventListener('click', async ({ target }) => {
    const modal = document.querySelector('.modal')
    const innerModal = modal.querySelector('.inner-modal')
    const isClosed = modal.classList.contains('hidden')
  
    modal.classList.toggle('hidden')
    target.classList.toggle('active')
    target.closest('nav').classList.toggle('active')
    
    if (isClosed) {
      isSlideshowStopped = true
      pauseSlideshow()
      innerModal.innerHTML = await (await fetch('about.html')).text()
    } else {
      closeModal()
    }
  })
  
  document.querySelector('.close-modal').addEventListener('click', closeModal)
  startSlideshow()
})

setModalLoading()

// artFlow.onZoom((event) => console.debug('third Coverflow zoom:', event))
artFlow.onPrevious(startSlideshow)
artFlow.onNext(startSlideshow)
artFlow.init()

function setModalLoading () {
  const template = document.querySelector('#loading').content.cloneNode(true)
  document.querySelector('.modal .inner-modal').innerHTML = template.children[0].outerHTML
}

function startSlideshow () {
  pauseSlideshow()
  intervalId = setInterval(() => !artFlow[next]() && ([previous, next] = [next, previous]), 10000)
}

function pauseSlideshow () {
  clearInterval(intervalId)
}

function closeModal () {
  document.querySelector('.modal').classList.add('hidden')
  
  for (const element of Array.from(document.querySelectorAll('footer .active'))) {
    element.classList.remove('active')
  }
  
  setModalLoading()
  isSlideshowStopped = false
  startSlideshow()
}