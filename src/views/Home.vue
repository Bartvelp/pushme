<template>
  <div class="home">
    <section class="hero is-light">
      <div class="hero-body">
        <div class="container">
          <p class="title is-3">1. First get your code</p>
          <p class="subtitle is-6">Your code is specific to this device</p>
          <div>
            <button v-if="!code" class="button is-primary" :disabled="isSubscribing" @click="subscribe()">Get code</button>
            <p class="subtitle is-5" v-else>Your code is: {{code}}<b></b></p>
          </div>
        </div>
      </div>
    </section>
    <section class="hero is-dark">
      <div class="hero-body">
        <div class="container">
          <p class="title is-3">2. Send a notification</p>
          <div>
            <button class="button" :class="{'is-primary': code}" :disabled="!code || isSendingNotif" @click="sendNotification()">Notify me</button><br>
            <br>
            <p class="subtitle is-5">Send it yourself:</p>
            <div class="tabs is-boxed is-marginless">
              <ul>
                <li
                  v-for="lang in codeExampleLangs"
                  :key="lang.short"
                  :class="{'is-active': currentExample == lang.short}">
                  <a @click="currentExample = lang.short">{{lang.name}}</a>
                </li>
              </ul>
            </div>
            <p v-if="currentExample === 'js'">
              <pre>
                <code>
fetch('https://{{hostname}}/api/sendNotification', {
  method: 'POST',
  headers: {
    'content-type': 'application/json' // This is mandatory
  },
  body: JSON.stringify({
    code: '{{code}}',
    title: 'Sample title',
    message: 'sample message'
  })
})              </code>
              </pre>
            </p>
            <p v-if="currentExample === 'arduino'">
              <pre>
                <code>
#include &lt;ESP8266WiFi.h&gt;
#include &lt;ESP8266HTTPClient.h&gt;

void setup() {
  sendNotification("Hi from ESP8266", "This is your message");
}
void loop() {}

void sendNotification(String title, String message) {
  const char * host = "{{hostname}}";
  const uint16_t port = 443;
  String path = "/api/sendNotification";
  Serial.println("Sending notification: " + message);

  BearSSL::WiFiClientSecure client;
  client.setInsecure();
  HTTPClient https;

  if (https.begin(client, host, port, path)) {
    https.addHeader("Content-Type", "application/json");
    int httpsCode = https.POST("{\"code\":\"{{code}}\",\"title\":\"" + title + "\",\"message\":\"" + message + "\"}");
    if (httpsCode > 0) {
      Serial.println(httpsCode);
      if (httpsCode == HTTP_CODE_OK) {
        Serial.println(https.getString());
      }
    } else {
      Serial.print("failed to POST");
    }
  } else {
    Serial.print("failed to connect to server");
  }
}              </code>
              </pre>
            </p>
            <p v-if="currentExample === 'python2'">
              <pre>
                <code>
import json
import urllib2

data = {
  code: '{{code}}',
  title: 'Sample title',
  message: 'sample message'
}

req = urllib2.Request('https://{{hostname}}/api/sendNotification')
req.add_header('Content-Type', 'application/json')

response = urllib2.urlopen(req, json.dumps(data))              </code>
              </pre>
            </p>
            <p v-if="currentExample === 'perl'">
              <pre>
                <code>
use JSON::PP;
use HTTP::Tiny;

my $obj = {
  code    => '{{code}}',
  title   => 'Sample title',
  message => 'Sample message'
};

my $http_opts = {
  'content' => encode_json($obj),
  'headers' => { 'content-type' => 'application/json'},
};

my $http = HTTP::Tiny->new();
my $resp = $http->request("POST", "https://{{hostname}}/api/sendNotification", $http_opts);              </code>
              </pre>
            </p>
            <p v-if="currentExample === 'curl'">
              <pre>
                <code>
curl --header "content-type: application/json" \
--data '{"code":"{{code}}","title":"Sample title","message":"Sample message"}' \
https://{{hostname}}/api/sendNotification              </code>
              </pre>
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'home',
  data: () => {
    return {
      code: null,
      isSubscribing: false,
      isSendingNotif: false,
      currentExample: 'js',
      codeExampleLangs: [{
        short: 'js',
        name: 'JavaScript'
      }, {
        short: 'arduino',
        name: 'Arduino (ESP8266)'
      }, {
        short: 'python2',
        name: 'Python 2'
      }, {
        short: 'perl',
        name: 'Perl'
      }, {
        short: 'curl',
        name: 'Curl'
      }]
    }
  },
  computed: {
    hostname () {
      return window.location.hostname
    }
  },
  methods: {
    async subscribe () {
      this.isSubscribing = true
      await requestNotificationPermission() // First request notificationPermission
      const response = await sendMessageToSW({ subscribe: true })
      localStorage.setItem('push-code', response.code) // Save in localstorage for further use
      this.code = response.code
    },
    async sendNotification () {
      this.isSendingNotif = true
      const code = this.code
      const title = 'Example Title'
      const message = 'Example message'
      if (!code) throw new Error('No code')
      await fetch('api/sendNotification', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          code,
          title,
          message
        })
      })
      this.isSendingNotif = false
    }
  },
  async created () {
    await registerServiceWorker()
    const cachedCode = localStorage.getItem('push-code')
    if (cachedCode) this.code = cachedCode
  }
}

const requestNotificationPermission = async () => {
  const permission = await window.Notification.requestPermission()
  // value of permission can be 'granted', 'default', 'denied'
  // default: user has dismissed the notification permission popup by clicking on x
  if (permission !== 'granted') {
    alert('Permission not granted for Notification, please do')
  }
}

async function registerServiceWorker () {
  return navigator.serviceWorker.register('service-worker.js')
}

function sendMessageToSW (message) { // https://googlechrome.github.io/samples/service-worker/post-message/
  // This wraps the message posting/response in a promise, which will resolve if the response doesn't
  // contain an error, and reject with the error if it does. If you'd prefer, it's possible to call
  // controller.postMessage() and set up the onmessage handler independently of a promise, but this is
  // a convenient wrapper.
  return new Promise(function (resolve, reject) {
    var messageChannel = new MessageChannel()
    messageChannel.port1.onmessage = function (event) {
      if (event.data.error) {
        reject(event.data.error)
      } else {
        resolve(event.data)
      }
    }

    // This sends the message data as well as transferring messageChannel.port2 to the service worker.
    // The service worker can then use the transferred port to reply via postMessage(), which
    // will in turn trigger the onmessage handler on messageChannel.port1.
    // See https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
    navigator.serviceWorker.controller.postMessage(message,
      [messageChannel.port2])
  })
}
</script>
