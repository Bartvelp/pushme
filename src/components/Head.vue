<template>
  <section class="hero is-primary is-bold">
    <div class="hero-body">
      <div class="container">
        <h1 class="title is-1">
          PushMe
        </h1>
        <h2 class="subtitle is-3">
          Easy push notifications with just 1 request
        </h2>
        <div id="nav">
          <router-link class="has-text-light" to="/">Home</router-link> |
          <router-link class="has-text-light" to="/about">About</router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Head'
}
</script>
