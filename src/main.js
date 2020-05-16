import Vue from 'vue'
import App from './App.vue'
import Petitions from './Petitions.vue'
import VueRouter from 'vue-router';
import axios from 'axios';
import VueAxios from 'vue-axios';
import { BootstrapVue, BootstrapVueIcons, IconsPlugin } from 'bootstrap-vue'

Vue.use(VueRouter);
Vue.use(VueAxios, axios);
// Install BootstrapVue
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)



const routes = [
  {
    path: "/petitions",
    name: "petitions",
    component: Petitions
  },
  {
    path: "/petitions/:petitionId",
    name: "petition",
    component: Petitions
  },
];

const router = new VueRouter({
  routes: routes,
  mode: 'history'
});

new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
});
