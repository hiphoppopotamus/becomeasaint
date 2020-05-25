import Vue from 'vue'
import App from './App.vue'
import Home from './Home.vue'
import Petitions from './Petition/Petitions.vue'
import Petition from './Petition/Petition.vue'
import Register from './Profile/Register.vue'
import Login from './Login.vue'
import Profile from './Profile/Profile.vue'
import EditProfile from './Profile/EditProfile.vue'
import CreatePetition from "./Petition/CreatePetition";
import EditPetition from "./Petition/EditPetition";

import WebsiteHeader from "./WebsiteHeader";

import VueRouter from 'vue-router';
import axios from 'axios';
import VueAxios from 'vue-axios';
import { BootstrapVue, BootstrapVueIcons, IconsPlugin } from 'bootstrap-vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(VueRouter);
Vue.use(VueAxios, axios);
// Install BootstrapVue
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);
Vue.use(Vuetify);

const routes = [
  {
    path: "/",
    name: "home",
    component: Home
  },
  {
    path: "/petitions",
    name: "petitions",
    component: Petitions
  },
  {
    path: "/petition/:petitionId",
    name: "petition",
    component: Petition
  },
  {
    path: "/register",
    name: "register",
    component: Register
  },
  {
    path: "/login",
    name: "login",
    component: Login
  },
  {
    path: "/profile/:userId",
    name: "profile",
    component: Profile
  },
  {
    path: "/profile/edit/:userId",
    name: "editProfile",
    component: EditProfile
  },
  {
    path: "/petitions/create/",
    name: "createPetition",
    component: CreatePetition
  },
  {
    path: "/petition/edit/:petitionId",
    name: "editPetition",
    component: EditPetition
  },
];

const router = new VueRouter({
  routes: routes,
  mode: 'history'
});

Vue.component('WebsiteHeader', WebsiteHeader);

new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
});
