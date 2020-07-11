<template>
  <div id="app">
    <Head />
    <router-view/>
  </div>
</template>

<style lang="sass" src="bulma"></style>

<script>
import Head from '@/components/Head.vue'

export default {
  name: 'home',
  components: {
    Head
  }
}
</script>
