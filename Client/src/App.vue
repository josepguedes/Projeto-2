<script>
import { RouterLink } from 'vue-router';
import HomePageView from './views/HomePageView.vue'
import footerComp from '@/components/Footer.vue'
import navbar from '@/components/Navbar.vue';

export default {
    components: {
        footerComp,
        navbar
    }
}
</script>

<template>
    <navbar />
    <RouterView />
    <footerComp />
</template>

<style>
</style>