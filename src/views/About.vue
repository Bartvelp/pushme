<template>
  <div class="about">
    <section class="hero is-light">
      <div class="hero-body">
        <div class="container">
          <p class="title is-3">About</p>
          <p style="max-width: 800px;">
            This is just a simple webapp I wrote which was usefull for me and might be for you as well.
            I have no plans currently on monitization of this app or any other limits, if the userbase gets very large I will add some limits.
            But then I will obviously let you know.
            You can also run your own instance by going to the github page and downloading the necessary files.
          </p>
          <br>
          <div v-if="code">
            <p class="title is-5">Clear your code</p>
            <button class="button" @click="clearCode()">Clear</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'about',
  data: () => {
    return {
      code: localStorage.getItem('push-code')
    }
  },
  methods: {
    clearCode () {
      localStorage.removeItem('push-code')
      this.code = null
    }
  }
}
</script>
