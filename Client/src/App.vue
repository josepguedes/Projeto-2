<script>
import { RouterLink } from 'vue-router';
import HomePageView from './views/HomePageView.vue'
import footerComp from '@/components/Footer.vue'
import navbar from '@/components/Navbar.vue';
import MessagesSidebar from '@/components/MessagesSidebar.vue';

export default {
  components: {
    footerComp,
    navbar,
    MessagesSidebar
  },
  data() {
    return {
      isMessagesSidebarOpen: false
    }
  },
  mounted() {
    window.addEventListener('open-messages', () => {
      this.isMessagesSidebarOpen = true;
    });
  },
  beforeUnmount() {
    window.removeEventListener('open-messages', () => {
      this.isMessagesSidebarOpen = true;
    });
  }
}
</script>

<template>
  <navbar />
  <RouterView />
  <footerComp />
  <MessagesSidebar :isOpen="isMessagesSidebarOpen" @close="isMessagesSidebarOpen = false" />
</template>

<style>
:root {
  --bs-primary: #33A58C;
  --bs-primary-rgb: 51, 165, 140;
  --bs-link-color: #33A58C;
  --bs-link-hover-color: #2a8873;
}

.btn-primary {
  background-color: #33A58C !important;
  border-color: #33A58C !important;
}

.btn-primary:hover {
  background-color: #2a8873 !important;
  border-color: #2a8873 !important;
}

.text-primary {
  color: #33A58C !important;
}

.bg-primary {
  background-color: #33A58C !important;
}

.btn-outline-primary {
  color: #33A58C !important;
  border-color: #33A58C !important;
}

.btn-outline-primary:hover {
  background-color: #33A58C !important;
  color: white !important;
}
</style>