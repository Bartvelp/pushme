// urlB64ToUint8Array is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option
function urlB64ToUint8Array (base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// saveSubscription saves the subscription to the backend
async function saveSubscription (subscription) {
  const response = await fetch('/api/saveSubscription.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription)
  })
  return response.json()
}

async function registerPush () {
  const applicationServerKey = urlB64ToUint8Array(
    'BIneGPMXfpFUmGRuQ06yVw0Kt5Yh0QWxiMkFnLoo4K0A8MniSFVnDoliE35mQ1zEb6pGTKOWGJSO7YRlfzUmmd8'
  )
  const options = { applicationServerKey, userVisibleOnly: true }
  const subscription = await self.registration.pushManager.subscribe(options)
  return saveSubscription(subscription)
}

async function showLocalNotification (title, body, swRegistration) {
  const options = {
    body
    // here you can add more properties like icon, image, vibrate, etc.
  }
  return swRegistration.showNotification(title, options)
}

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting()) // Activate worker immediately
})
self.addEventListener('activate', function (event) {
  // This will be called only once when the service worker is activated.
  console.log('Registerd Serviceworker')
  event.waitUntil(self.clients.claim()) // Become available to all pages
})

self.addEventListener('push', function (event) {
  if (event.data) {
    console.log('Push event! Showing data:', event.data.json())
    const notification = event.data.json()
    const notifPromise = showLocalNotification(notification.title, notification.body, self.registration)
    event.waitUntil(notifPromise)
  } else {
    console.log('Push event but no data')
  }
})

self.addEventListener('message', async function (event) {
  console.log('Handling message event:', event)
  if (event.data.subscribe) { // User wants to subscribe
    const response = await registerPush()
    event.ports[0].postMessage(response)
  }
})
