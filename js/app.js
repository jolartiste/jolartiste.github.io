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
    const isMenuActive = target.classList.contains('active')

    if (!isMenuActive) {
      const isModalOpen = !document.querySelector('.modal').classList.contains('hidden')
      
      if (isModalOpen) {
        await closeModal({ isTransition: true })
      }
      
      target.classList.add('active')

      openModal({
        async setContent (innerModal) { innerModal.innerHTML = await (await fetch('about.html')).text() },
        isTransition: isModalOpen
      })
    }
  })
  
  document.querySelector('.close-modal').addEventListener('click', closeModal)
  startSlideshow()
})

setModalLoading()

document.querySelector('.modal').addEventListener(
  'load',
  ({ target }) => target.style.setProperty('width', target.naturalWidth + 'px'),
  { capture: true }
)

artFlow.onZoom(({ target }) => {
  const template = document.querySelector('#zoom').content.cloneNode(true)
  const picture = template.querySelector('img')
  
  const minWidth = parseInt(getComputedStyle(target).getPropertyValue('width'), 10)
  const minHeight = parseInt(getComputedStyle(target).getPropertyValue('height'), 10)
  
  picture.style.width = `${minWidth * 1.33}px`
  picture.style.aspectRatio = `${minWidth} / ${minHeight}`
  picture.style.backgroundImage = `url(${target.getAttribute('src')})`
  picture.setAttribute('src', target.dataset.zoomUrl)

  template.querySelector('h2').innerHTML = target.alt
  
  const paragraph = template.querySelector('p')
  
  if (target.dataset.description?.trim()) {
    paragraph.innerHTML = target.dataset.description
  } else {
    paragraph.remove()
  }
  
  openModal({
    setContent (innerModal) {
      innerModal.innerHTML = ''
      innerModal.appendChild(template)
    }
  })
})

artFlow.onPrevious(startSlideshow)
artFlow.onNext(startSlideshow)
artFlow.init()

function setModalLoading () {
  const template = document.querySelector('#loading').content.cloneNode(true)
  const innerModal = document.querySelector('.modal .inner-modal')
  innerModal.innerHTML = ''
  innerModal.appendChild(template)
}

function startSlideshow () {
  pauseSlideshow()
  intervalId = setInterval(() => !artFlow[next]() && ([previous, next] = [next, previous]), 10000)
}

function pauseSlideshow () {
  clearInterval(intervalId)
}

function openModal ({ setContent, isTransition = false }) {
  document.querySelector('footer nav').classList.add('active')
  
  const modal = document.querySelector('.modal')
  modal.classList.remove('hidden')
  
  if (!isTransition) {
    isSlideshowStopped = true
    pauseSlideshow()
  }
  
  return setContent(modal.querySelector('.inner-modal'))
}

function closeModal ({ isTransition = false } = {}) {
  const tearingDownModal = []
  const modal = document.querySelector('.modal')
  
  const restoringLoading = new Promise(resolve => {
    modal.addEventListener('transitionend', () => {
      setModalLoading()
      resolve()
    }, { once: true })
  })
  
  tearingDownModal.push(restoringLoading)
  
  if (!isTransition) {
    const restartingSlideshow = new Promise(resolve => {
      modal.addEventListener('transitionend', () => {
        isSlideshowStopped = false
        startSlideshow()
        resolve()
      }, { once: true })
    })
    
    tearingDownModal.push(restartingSlideshow)
  }
  
  modal.classList.add('hidden')
  
  for (const element of Array.from(document.querySelectorAll('footer .active'))) {
    element.classList.remove('active')
  }
  
  return Promise.all(tearingDownModal)
}