import { Coverflow, FlickrDataSource } from '../lib/flickr-coverflow-2.1.1.js'
Coverflow.logLevel = 'info'

{
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
  
  function startSlidshow () {
    clearInterval(intervalId)
    intervalId = setInterval(() => !artFlow[next]() && ([previous, next] = [next, previous]), 10000)
  }
  
  artFlow.onInit(() => {
    for (const element of Array.from(document.querySelectorAll('.hidden'))) {
      element.classList.remove('hidden')
    }
    
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        startSlidshow()
      } else {
        clearInterval(intervalId)
      }
    })
    
    window.addEventListener('focus', startSlidshow)
    startSlidshow()
  })
  
  // artFlow.onZoom((event) => console.debug('third Coverflow zoom:', event))
  artFlow.onPrevious(startSlidshow)
  artFlow.onNext(startSlidshow)
  artFlow.init()
}
