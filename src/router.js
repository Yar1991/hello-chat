import { createRouter, createWebHistory } from "vue-router";

import Home from "./components/Home.vue";
import Chat from "./components/Chat.vue";

const routes = [
  {
    name: "Home",
    path: "/",
    component: Home,
  },
  {
    name: "Room",
    path: "/:id",
    component: Chat,
    props: { default: true },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
