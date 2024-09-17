function getUserSource() {
  // Get the user agent string
  const userAgent = navigator.userAgent || navigator.vendor || window.opera

  // Check for PWA (Progressive Web App)
  const isPWA = window.matchMedia('(display-mode: standalone)').matches

  // Check for Mobile Device
  const isMobile = /Mobi|Android/i.test(userAgent)

  // Check for Desktop PC
  const isPC = !isMobile && !isPWA

  // Determine browser type
  const browserType = (function () {
    if (/chrome|crios|crmo/i.test(userAgent)) {
      return 'chrome'
    } else if (/firefox|fxios/i.test(userAgent)) {
      return 'firefox'
    } else if (/safari/i.test(userAgent) && !/chrome|crios|crmo/i.test(userAgent)) {
      return 'safari'
    } else if (/msie|trident/i.test(userAgent)) {
      return 'ie'
    } else if (/edge/i.test(userAgent)) {
      return 'edge'
    } else {
      return 'unknown-browser'
    }
  })()

  // Determine the user source
  let userSource = ''
  if (isPWA) {
    userSource = 'pwa'
  } else if (isMobile) {
    userSource = 'mobile'
  } else if (isPC) {
    userSource = 'pc'
  } else {
    userSource = 'unknown'
  }

  // Combine user source with browser type
  return `${userSource}_${browserType}`
}

export default getUserSource
