<script setup>
import { ref, watch } from 'vue'
import { useChatStore } from "../store"
import { joinRoom as join, roomExists } from "../firebase"
import { router } from "../router"

const chatState = useChatStore()
const dialogBox = ref(null);
const joinDialogBox = ref(null);
const userName = ref('');
const roomID = ref('');
const nameError = ref('');
const roomIdError = ref('');
const addBtn = ref(null);


function openDialog() {
  dialogBox.value.showModal()
  dialogBox.value.classList.add('show');
}

function openJoinDialog() {
  joinDialogBox.value.showModal()
  joinDialogBox.value.classList.add('show');
}

function newRoom() {
  dialogBox.value.classList.remove('show');
  dialogBox.value.close()
  chatState.createRoom(userName.value)
}

async function joinRoom() {
  addBtn.value.classList.add("join-loading");
  const existRoom = await roomExists(roomID.value)
  if (!existRoom) {
    addBtn.value.classList.remove("join-loading");
    roomIdError.value = "The room id is incorrect"
    return
  }
  const users = await join(roomID.value, userName.value)
  if (users === "exists") {
    nameError.value = "This nickname already exists"
  } else {
    chatState.userName = userName.value
    localStorage.setItem("users", JSON.stringify(users))
    localStorage.setItem("current-user", JSON.stringify(userName.value))
    router.push({ name: "Room", params: { id: roomID.value } })
  }
}

watch([nameError, roomIdError], () => {
  setTimeout(() => {
    nameError.value = ''
    roomIdError.value = ''
    addBtn.value.classList.remove("join-loading");
  }, 1500)
})

</script>

<template>
  <div id="home-box">
    <h1>HelloChat</h1>
    <p>You can create a new room or join the existing one</p>
    <div class="btns">
      <button @click="openDialog">New Room</button>
      <button @click="openJoinDialog">Join Room</button>
    </div>
    <dialog ref="dialogBox" class="room-modal">
      <form @submit.prevent="newRoom">
        <input type="text" name="username" v-model="userName" required placeholder="Enter your nickname...">
        <button>Add</button>
      </form>
    </dialog>
    <dialog ref="joinDialogBox" class="room-modal">
      <form @submit.prevent="joinRoom">
        <div class="input-box">
          <input type="text" name="username" v-model="userName" required placeholder="Enter your nickname...">
          <p class="modal-error" v-if="nameError">{{ nameError }}</p>
        </div>
        <div class="input-box">
          <input type="text" name="roomID" v-model="roomID" required placeholder="Enter room id...">
          <p class="modal-error" v-if="roomIdError">{{ roomIdError }}</p>
        </div>

        <button>Add
          <div class="add-spinner" ref="addBtn">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path fill="#ffffff"
                d="M 16 3 C 14.34375 3 13 4.34375 13 6 C 13 7.65625 14.34375 9 16 9 C 17.65625 9 19 7.65625 19 6 C 19 4.34375 17.65625 3 16 3 Z M 8.9375 6.4375 C 7.558594 6.4375 6.4375 7.558594 6.4375 8.9375 C 6.4375 10.316406 7.558594 11.4375 8.9375 11.4375 C 10.316406 11.4375 11.4375 10.316406 11.4375 8.9375 C 11.4375 7.558594 10.316406 6.4375 8.9375 6.4375 Z M 23.0625 7.9375 C 22.511719 7.9375 22.0625 8.386719 22.0625 8.9375 C 22.0625 9.488281 22.511719 9.9375 23.0625 9.9375 C 23.613281 9.9375 24.0625 9.488281 24.0625 8.9375 C 24.0625 8.386719 23.613281 7.9375 23.0625 7.9375 Z M 6 13.75 C 4.757813 13.75 3.75 14.757813 3.75 16 C 3.75 17.242188 4.757813 18.25 6 18.25 C 7.242188 18.25 8.25 17.242188 8.25 16 C 8.25 14.757813 7.242188 13.75 6 13.75 Z M 26 14.75 C 25.308594 14.75 24.75 15.308594 24.75 16 C 24.75 16.691406 25.308594 17.25 26 17.25 C 26.691406 17.25 27.25 16.691406 27.25 16 C 27.25 15.308594 26.691406 14.75 26 14.75 Z M 8.9375 21.0625 C 7.832031 21.0625 6.9375 21.957031 6.9375 23.0625 C 6.9375 24.167969 7.832031 25.0625 8.9375 25.0625 C 10.042969 25.0625 10.9375 24.167969 10.9375 23.0625 C 10.9375 21.957031 10.042969 21.0625 8.9375 21.0625 Z M 23.0625 21.5625 C 22.234375 21.5625 21.5625 22.234375 21.5625 23.0625 C 21.5625 23.890625 22.234375 24.5625 23.0625 24.5625 C 23.890625 24.5625 24.5625 23.890625 24.5625 23.0625 C 24.5625 22.234375 23.890625 21.5625 23.0625 21.5625 Z M 16 24.25 C 15.035156 24.25 14.25 25.035156 14.25 26 C 14.25 26.964844 15.035156 27.75 16 27.75 C 16.964844 27.75 17.75 26.964844 17.75 26 C 17.75 25.035156 16.964844 24.25 16 24.25 Z" />
            </svg>
          </div>
        </button>
      </form>
    </dialog>
  </div>


</template>

<style lang="scss">
#home-box {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  background-color: var(--light-main);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 15px hsla(210, 90%, 16%, 0.4), 0 0 10px hsla(209, 87%, 15%, 0.4);
  will-change: transform;


  h1 {
    font-size: 2.2rem;
  }

  p {
    font-weight: 300;
    font-size: 1.1rem;
    max-width: 80%;
    text-align: center;
  }

  .btns {
    display: flex;
    align-items: center;
    gap: 2rem;

    button {
      position: relative;
      border: none;
      border-radius: 1rem;
      background-color: hsl(204, 91%, 42%);
      width: 7rem;
      padding: 0.7rem 0;
      color: var(--light-main);
      filter: drop-shadow(0 0 2px hsla(0, 0%, 0%, 0.3)) drop-shadow(0 0 2px hsla(0, 0%, 0%, 0.3));
      transition: background-color 0.3s ease;
      overflow: hidden;

      &:hover {
        background-color: hsl(204, 91%, 48%);
      }

      &::before {
        content: "";
        position: absolute;
        width: 5rem;
        height: 5rem;
        inset: 0;
        margin: auto;
        border-radius: 50%;
        background-color: hsla(0, 0%, 100%, 0.2);
        filter: blur(10px);
        transform: scale(0);
        transform-origin: center center;
        transition: transform 0.3s ease, opacity 0.3s ease;
        z-index: -1;
      }

      &:active::before {
        transform: scale(5);
        opacity: 0;
      }
    }
  }

  .room-modal {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 22rem;
    height: fit-content;
    border: none;
    border-radius: 1rem;
    box-shadow: 0 0 15px hsla(210, 92%, 5%, 0.4), 0 0 10px hsla(210, 86%, 5%, 0.4);
    opacity: 0;
    transition: opacity 0.7s ease visibility 0.7s ease height 0.5s ease;

    &::backdrop {
      background-color: hsla(0, 0%, 0%, 0.7);
      opacity: 0;
      transition: opacity 0.7s ease;
    }

    &.show {
      visibility: visible;
      opacity: 1;

      &::backdrop {
        opacity: 1;
      }
    }


    form {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      padding: 1.5rem;
      background-color: var(--light-main);
      border-radius: 1rem;

      .input-box {
        position: relative;
        width: 100%;

        input {
          width: 100%;
          border: none;
          border-radius: 0.5rem;
          padding: 0.3rem;
          box-shadow: 0 0 5px hsla(0, 0%, 0%, 0.5);
        }

        .modal-error {
          position: absolute;
          top: 110%;
          text-align: start;
          width: 100%;
          color: rgb(210, 75, 75);
          font-size: 0.85rem;
          font-weight: 400;
          animation: anim-error 0.5s ease-in-out both;

          @keyframes anim-error {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }
        }

      }

      input {
        width: 100%;
        border: none;
        border-radius: 0.5rem;
        padding: 0.3rem;
        box-shadow: 0 0 5px hsla(0, 0%, 0%, 0.5);
      }

      button {
        position: relative;
        border: none;
        border-radius: 1rem;
        background-color: hsl(204, 91%, 42%);
        width: 7rem;
        padding: 0.7rem 0;
        color: var(--light-main);
        filter: drop-shadow(0 0 2px hsla(0, 0%, 0%, 0.3)) drop-shadow(0 0 2px hsla(0, 0%, 0%, 0.3));
        transition: background-color 0.3s ease;
        overflow: hidden;

        &:hover {
          background-color: hsl(204, 91%, 48%);
        }

        &::before {
          content: "";
          position: absolute;
          width: 5rem;
          height: 5rem;
          inset: 0;
          margin: auto;
          border-radius: 50%;
          background-color: hsla(0, 0%, 100%, 0.2);
          filter: blur(10px);
          transform: scale(0);
          transform-origin: center center;
          transition: transform 0.3s ease, opacity 0.3s ease;
          z-index: -1;
        }

        &:active::before {
          transform: scale(5);
          opacity: 0;
        }

        .add-spinner {
          position: absolute;
          visibility: hidden;
          inset: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: hsl(204, 91%, 42%);

          &>svg {
            width: 100%;
            height: 100%;
          }

        }

        .join-loading {
          visibility: visible;

          &>svg {
            animation: spin 1s linear infinite;

            @keyframes spin {
              to {
                transform: rotateZ(360deg);
              }
            }
          }
        }
      }
    }
  }
}
</style>
