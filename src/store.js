import { defineStore } from "pinia";
import { ref } from "vue";
import { newRoom, removeFromRoom, newMessage } from "./firebase";
import { router } from "./router";
import { addToLocal, removeFromLocal } from "./localStorage";

export const useChatStore = defineStore("chat-store", () => {
  const userName = ref("");
  const allUsers = ref([]);
  const allMessages = ref([]);

  function createRoom(name) {
    userName.value = name;
    const roomID = newRoom(userName.value);
    addToLocal(userName.value);
    router.push({ name: "Room", params: { id: roomID } });
  }

  function exitRoom() {
    const id = router.currentRoute.value.params.id;
    const currentUser = JSON.parse(localStorage.getItem("current-user"));
    removeFromRoom(id, currentUser);
    removeFromLocal();
    localStorage.clear();
    userName.value = "";
    router.push({ name: "Home" });
  }

  function addMessage(message) {
    const id = router.currentRoute.value.params.id;
    newMessage(id, message);
  }

  return { userName, allUsers, createRoom, exitRoom, allMessages, addMessage };
});
