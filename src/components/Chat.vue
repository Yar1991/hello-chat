<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useChatStore } from "../store"
import { router } from "../router";
import { wathcUsersUpdate, watchMessagesUpdate } from "../firebase"
import { createPicker } from "picmo"


const chatState = useChatStore();
const copyModal = ref(null);
const usersSnapshotWatcher = ref(null);
const msgsSnapshotWatcher = ref(null);
const scrollMsgsTimeout = ref(null);


const messageInputElement = ref(null);
const msgsBox = ref(null);
const emojiBtn = ref(null);
const emojiContainer = ref(null);


function copyRoomID() {
  const currentPath = router.currentRoute.value.params.id;
  navigator.clipboard.writeText(currentPath);
  copyModal.value.classList.add("show-modal");
  const timeout = setTimeout(() => {
    copyModal.value.classList.remove("show-modal");
  }, 1000)

  return () => clearTimeout(timeout)
}

function sendMessage(e) {
  e.preventDefault();
  const currentUser = JSON.parse(localStorage.getItem("current-user"));
  const currentTime = new Date().toLocaleTimeString()
  if (!messageInputElement.value.textContent) {
    return;
  } else {
    const message = {
      text: messageInputElement.value.textContent,
      username: currentUser,
      time: `${currentTime.split(":")[0]}:${currentTime.split(":")[1]} ${currentTime.split(" ")[1]}`
    }
    messageInputElement.value.textContent = "";
    emojiContainer.value.classList.remove("open-emoji");
    chatState.addMessage(message);
  }
}

onMounted(() => {
  const currentRoom = router.currentRoute.value.params.id;
  const msgsElement = msgsBox.value.children[0];
  const picker = createPicker({
    rootElement: emojiContainer.value,
  })
  picker.addEventListener("emoji:select", (e) => {
    messageInputElement.value.textContent = `${messageInputElement.value.textContent}${e.emoji}`;
    messageInputElement.value.focus();
  })
  usersSnapshotWatcher.value = wathcUsersUpdate(currentRoom)
  msgsSnapshotWatcher.value = watchMessagesUpdate(currentRoom)
  scrollMsgsTimeout.value = setTimeout(() => {
    msgsElement.scroll({
      top: 100000,
      left: 0,
      behavior: "smooth"
    })
  }, 1500)
})

const msgWatcher = watch(() => chatState.allMessages, () => {
  const msgsElement = msgsBox.value.children[0];
  scrollMsgsTimeout.value = setTimeout(() => {
    msgsElement.scroll({
      top: 100000,
      left: 0,
      behavior: "smooth"
    })
  }, 300)
})

function toggleEmojies() {
  if (emojiContainer.value.classList.contains("open-emoji")) {
    emojiContainer.value.classList.remove("open-emoji");
  } else {
    emojiContainer.value.classList.add("open-emoji");
  }
}


onUnmounted(() => {
  usersSnapshotWatcher.value()
  msgsSnapshotWatcher.value()
  msgWatcher()
  clearTimeout(scrollMsgsTimeout.value)
})

</script>

<template>
  <div id="chat-box">
    <div class="info-block">
      <div class="users-info">
        <h3>In the room:</h3>
        <TransitionGroup tag="ul" name="fade-users" class="users">
          <li class="user" v-for="user in chatState.allUsers" :key="user">
            <svg viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 0.75C5.92893 0.75 4.25 2.42893 4.25 4.5C4.25 6.57107 5.92893 8.25 8 8.25C10.0711 8.25 11.75 6.57107 11.75 4.5C11.75 2.42893 10.0711 0.75 8 0.75Z"
                fill="black" />
              <path
                d="M4 10.25C1.92893 10.25 0.25 11.9289 0.25 14V15.1883C0.25 15.9415 0.795884 16.5837 1.53927 16.7051C5.8181 17.4037 10.1819 17.4037 14.4607 16.7051C15.2041 16.5837 15.75 15.9415 15.75 15.1883V14C15.75 11.9289 14.0711 10.25 12 10.25H11.6591C11.4746 10.25 11.2913 10.2792 11.1159 10.3364L10.2504 10.6191C8.78813 11.0965 7.21187 11.0965 5.74959 10.6191L4.88407 10.3364C4.70869 10.2792 4.52536 10.25 4.34087 10.25H4Z"
                fill="black" />
            </svg>
            <span>{{ user }}</span>
          </li>
        </TransitionGroup>
      </div>
      <div class="exit">
        <button class="exit-btn" title="exit" @click="chatState.exitRoom()">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1"
            x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve">
            <g>
              <g>
                <g>
                  <path class="arrow"
                    d="M510.371,226.513c-1.088-2.603-2.645-4.971-4.629-6.955l-63.979-63.979c-8.341-8.32-21.824-8.32-30.165,0     c-8.341,8.341-8.341,21.845,0,30.165l27.584,27.584H320.013c-11.797,0-21.333,9.557-21.333,21.333s9.536,21.333,21.333,21.333     h119.168l-27.584,27.584c-8.341,8.341-8.341,21.845,0,30.165c4.16,4.181,9.621,6.251,15.083,6.251s10.923-2.069,15.083-6.251     l63.979-63.979c1.984-1.963,3.541-4.331,4.629-6.955C512.525,237.606,512.525,231.718,510.371,226.513z" />
                  <path class="door"
                    d="M362.68,298.667c-11.797,0-21.333,9.557-21.333,21.333v106.667h-85.333V85.333c0-9.408-6.187-17.728-15.211-20.437     l-74.091-22.229h174.635v106.667c0,11.776,9.536,21.333,21.333,21.333s21.333-9.557,21.333-21.333v-128     C384.013,9.557,374.477,0,362.68,0H21.347c-0.768,0-1.451,0.32-2.197,0.405c-1.003,0.107-1.92,0.277-2.88,0.512     c-2.24,0.576-4.267,1.451-6.165,2.645c-0.469,0.299-1.045,0.32-1.493,0.661C8.44,4.352,8.376,4.587,8.205,4.715     C5.88,6.549,3.939,8.789,2.531,11.456c-0.299,0.576-0.363,1.195-0.597,1.792c-0.683,1.621-1.429,3.2-1.685,4.992     c-0.107,0.64,0.085,1.237,0.064,1.856c-0.021,0.427-0.299,0.811-0.299,1.237V448c0,10.176,7.189,18.923,17.152,20.907     l213.333,42.667c1.387,0.299,2.795,0.427,4.181,0.427c4.885,0,9.685-1.685,13.525-4.843c4.928-4.053,7.808-10.091,7.808-16.491     v-21.333H362.68c11.797,0,21.333-9.557,21.333-21.333V320C384.013,308.224,374.477,298.667,362.68,298.667z" />
                </g>
              </g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
          </svg>
        </button>
        <button class="copy-btn" title="copy room id" @click="copyRoomID">Copy Room ID</button>
      </div>
    </div>
    <div ref="msgsBox" class="messages-block">
      <TransitionGroup tag="div" name="fade-msgs" class="messages">
        <div :class="msg.style ? 'message info-msg' : 'message'" v-for="msg, index in chatState.allMessages"
          :key="index">
          <p class="msg-text">{{ msg?.text }}</p>
          <div class="msg-info">
            <span class="msg-username">{{ msg?.username }}</span>
            <span class="msg-time">{{ msg?.time }}</span>
          </div>
        </div>
      </TransitionGroup>
      <div class="send-message">
        <div ref="emojiContainer" class="emoji-container"></div>
        <div class="send-box">
          <div class="input-box">
            <p class="input" ref="messageInputElement" contenteditable="true" spellcheck="true"
              @keydown.enter.exact="sendMessage"></p>
          </div>
          <button ref="emojiBtn" class="emoji-trigger" @click="toggleEmojies" title="emojies">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
              id="Layer_1" x="0px" y="0px" viewBox="0 0 485 485" style="enable-background:new 0 0 485 485;"
              xml:space="preserve">
              <path
                d="M413.974,71.026C368.171,25.225,307.274,0,242.5,0S116.829,25.225,71.026,71.026C25.225,116.829,0,177.726,0,242.5   s25.225,125.671,71.026,171.474C116.829,459.775,177.726,485,242.5,485s125.671-25.225,171.474-71.026   C459.775,368.171,485,307.274,485,242.5S459.775,116.829,413.974,71.026z M242.5,455C125.327,455,30,359.673,30,242.5   S125.327,30,242.5,30S455,125.327,455,242.5S359.673,455,242.5,455z" />
              <path
                d="M318.514,231.486c19.299,0,35-15.701,35-35s-15.701-35-35-35s-35,15.701-35,35S299.215,231.486,318.514,231.486z" />
              <path
                d="M166.486,231.486c19.299,0,35-15.701,35-35s-15.701-35-35-35s-35,15.701-35,35S147.188,231.486,166.486,231.486z" />
              <path
                d="M242.5,355c-46.911,0-89.35-29.619-105.604-73.703l-28.148,10.378C129.329,347.496,183.08,385,242.5,385   s113.171-37.504,133.752-93.325l-28.148-10.378C331.85,325.381,289.411,355,242.5,355z" />
            </svg>
          </button>
          <button type="submit" title="send" @click="sendMessage">
            <svg viewBox="0 0 30 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M29.5714 13.7102C29.8359 13.5669 30 13.2951 30 13C30 12.7049 29.8359 12.433 29.5714 12.2897L25.7675 10.2293C18.2733 6.16994 10.3732 2.86793 2.19035 0.374724L1.0819 0.0369916C0.828864 -0.040104 0.553306 0.00478081 0.339721 0.157883C0.126133 0.310984 0 0.554035 0 0.812506V10.1562C0 10.5884 0.34693 10.9449 0.789534 10.9676L2.47227 11.054C6.57495 11.2645 10.6526 11.8071 14.6631 12.676L15.0603 12.7621C15.1487 12.7812 15.187 12.8164 15.2083 12.8444C15.2351 12.8797 15.2561 12.934 15.2561 13C15.2561 13.066 15.2351 13.1203 15.2083 13.1556C15.187 13.1836 15.1487 13.2188 15.0603 13.2379L14.6632 13.324C10.6526 14.1929 6.57494 14.7355 2.47223 14.946L0.789534 15.0324C0.34693 15.0551 0 15.4116 0 15.8437V25.1875C0 25.446 0.126132 25.689 0.33972 25.8421C0.553305 25.9952 0.828863 26.0401 1.08189 25.963L2.19037 25.6253C10.3732 23.1321 18.2733 19.8301 25.7675 15.7707L29.5714 13.7102Z"
                fill="black" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div ref="copyModal" class="copyModal">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 500 500"
        enable-background="new 0 0 500 500" id="Layer_1" version="1.1" xml:space="preserve">
        <g>
          <path
            d="M456.226,242.9c11.308-59.611-83.852-26.76-116.182-28.955c-37.914-30.403,15.408-113.679-32.38-143.407   c-10.051-6.251-20.394-6.054-30.905-1.393c-9.558,4.372-2.137,17.169-3.59,25.25c4.501,69.526-62.274,121.017-125.876,130.364   c-2.97,0.954-2.695-11.285-5.304-14.322c-10.86-20.286-41.897-11.722-60.711-10.64c-36.664,3.209-39.646,24.254-38.134,56.185   c1.062,46.448,1.585,93.069,7.011,139.255c2.257,22.873,11.43,41.318,37.653,38.798c20.361-3.101,58.412,5.307,63.069-21.705   c38.98,21.487,236.765,23.819,254.536-25.734c2.473-5.466-3.579-13.498,2.013-17.119c18.84-8.072,27.665-27.432,19.171-46.521   c-1.759-5.402,6.109-6.463,9.173-9.371c15.962-9.852,18.762-30.19,11.44-46.406C441.117,256.187,454.45,253.625,456.226,242.9z"
            fill="#58454D" />
          <path
            d="M149.011,407.536c15.081,23.712,244.243,14.138,248.024-11.701c9.945-17.24,3.077-21.924,8.853-29.284   c5.776-7.361,20.64-10.929,20.346-25.65c-0.294-14.721-4.137-21.967-1.993-24.589c35.536-16.598,20.38-32.457,18.351-58.608   c52.704-68.112-83.685-40.108-104.252-40.25c-30.228-16.055-5.305-89.924-13.663-115.215c-6.024-17.397-12.582-31.3-28.775-32.787   c-16.193-1.487-20.743,4.684-20.743,4.684c12.66,86.381-51.455,141.79-132.546,155.91   C144.287,236.659,151.247,388.72,149.011,407.536z"
            fill="#EDD5B8" />
          <path
            d="M275.427,78.512c0,0,24.214,79.897-14.57,128.094s-85.396,37.908-96.551,61.12   c-11.155,23.211,5.373,40.001,15.51,58.372c10.138,18.371-6.278,46.927,21.692,60.306s165.504,28.204,177.012,6.685   c11.507-21.52-2.676-34.076,13.114-40.846s30.691-12.613,27.089-22.572c-3.603-9.96-16.457-9.574-11.87-19.637   c4.587-10.062,32.575-15.016,31.797-30.606c-0.779-15.59-13.867-15.506-11.338-27.425c2.529-11.919,29.168-17.981,24.053-28.667   s6.468,4.257,2.007,17.417c-4.461,13.16-14.057,15.682-9.761,25.796s5.425,29.022,0.009,35.851   c-5.416,6.828-18.891,10.826-20.016,15.853s5.802,22.665-0.561,33.307c-6.363,10.642-19.3,14.1-20.973,19.676   c-1.673,5.576,3.002,21.424-9.261,28.946c-20.619,17.372-212.132,33.582-244.511,7.355c2.321-21.556-1.827-150.939-4.367-177.49   C211.102,219.868,293.105,160.859,275.427,78.512z"
            fill="#E4C39D" />
          <path
            d="M325.102,143.502c-7.085,13.052-21.143,56.387-2.753,74.45l15.99-1.956c0,0-18.154-11.615-16.92-28.998   C322.652,169.615,325.102,143.502,325.102,143.502z"
            fill="#E4C39D" />
          <path
            d="M51.961,214.799c-7.11,2.984-13.402,198.745,20.454,215.765c16.176,3.01,65.234-0.723,71.703-8.419   c9.958-8.872,7.776-206.821-9.903-216.475C124.266,200.882,62.587,208.278,51.961,214.799z"
            fill="#9CC4CF" />
          <path
            d="M146.412,280.129c0,0-16.905,21.069-26.05,49.173c-9.145,28.104-2.939,37.084-22.882,40.735   c-38.811,7.544-42.927-20.101-50.323-40.271c0,0,5.737,76.264,12.102,88.086c6.365,11.822,27.621,15.726,49.061,12.547   s32.246-1.148,38.092-15.1C152.258,401.346,146.412,280.129,146.412,280.129z"
            fill="#7EADBB" />
          <path
            d="M63.82,315.362c0,0,1.338-80.13,11.208-83.308c38.875-7.698,43.145-8.087,55.24,24.873   c0,0-0.26-29.612-11.487-34.567s-42.022-0.235-50.11,5.475C54.59,237.406,65.758,304.524,63.82,315.362z"
            fill="#B1D1DA" />
          <path
            d="M48.095,312.009c0,0,13.35-26.364,9.033-37.633c-4.316-11.268-8.477-30.89,3.708-44.385   c12.184-13.495,53.902-19.682,63.824-14.498c9.922,5.184,19.272,27.849,19.272,27.849s-1.237-33.497-12.738-38.285   c-11.501-4.788-71.404-2.254-79.233,9.742C44.131,226.795,48.095,312.009,48.095,312.009z"
            fill="#B1D1DA" />
          <path
            d="M130.273,299.803c-0.002-0.025-0.003-0.051-0.005-0.076c0.002,0.026,0,0.051,0.002,0.077   C130.271,299.803,130.272,299.803,130.273,299.803z"
            fill="#58454D" />
          <path
            d="M60.938,285.083c-0.033-0.006-0.068-0.001-0.102,0c0.037,0.032,0.064,0.066,0.106,0.098   C60.941,285.148,60.94,285.115,60.938,285.083z"
            fill="#58454D" />
          <path
            d="M64.587,364.104c-0.001,0.014-0.001,0.028-0.002,0.042c0.003-0.001,0.008,0,0.011-0.001   C64.592,364.131,64.591,364.117,64.587,364.104z"
            fill="#58454D" />
          <path
            d="M60.345,269.153c-0.003-0.056-0.005-0.112-0.009-0.168c-0.009,0.062-0.019,0.124-0.028,0.186   C60.32,269.165,60.333,269.159,60.345,269.153z"
            fill="#58454D" />
          <path
            d="M127.325,249.06L127.325,249.06c-0.002,0.035-0.004,0.07-0.006,0.105c0.014-0.008,0.026-0.017,0.041-0.025   C127.346,249.114,127.341,249.086,127.325,249.06z"
            fill="#58454D" />
          <path
            d="M279.772,105.567c-0.036,0.449-0.061,0.899-0.052,1.352C279.729,106.468,279.748,106.017,279.772,105.567z"
            fill="#58454D" />
          <path
            d="M279.794,105.171c0.003-0.046,0.006-0.092,0.009-0.137C279.798,105.079,279.799,105.125,279.794,105.171z"
            fill="#58454D" />
          <path
            d="M456.226,242.9c11.308-59.611-83.852-26.76-116.182-28.955c-37.914-30.403,15.408-113.679-32.38-143.407   c-10.051-6.251-20.394-6.054-30.905-1.393c-9.558,4.372-2.137,17.169-3.59,25.25c4.501,69.526-62.274,121.017-125.876,130.364   c-2.97,0.954-2.695-11.285-5.304-14.322c-10.86-20.286-41.897-11.722-60.711-10.64c-36.664,3.209-39.646,24.254-38.134,56.185   c1.062,46.448,1.585,93.069,7.011,139.255c2.257,22.873,11.43,41.318,37.653,38.798c20.361-3.101,58.412,5.307,63.069-21.705   c38.98,21.487,236.765,23.819,254.536-25.734c2.473-5.466-3.579-13.498,2.013-17.119c18.84-8.072,27.665-27.432,19.171-46.521   c-1.759-5.402,6.109-6.463,9.173-9.371c15.962-9.852,18.762-30.19,11.44-46.406C441.117,256.187,454.45,253.625,456.226,242.9z    M146.126,385.644c-1.894,12.715,2.643,34.515-14.058,37.683c-14.932,3.24-30.252,3.148-45.425,4.179   c-10.922,0.921-22.368-3.35-25.129-14.887c-9.432-40.412-7.593-82.815-10.999-123.936c-1.309-44.124-13.692-81.932,45.635-83.026   c32.821-1.63,41.997-4.264,43.197,32.698c2.395,13.618,2.829,27.881,3.653,41.773c0,0,0,0,0,0   C144.808,315.225,145.937,350.496,146.126,385.644z M445.966,246.273c-4.202,5.858-9.743,11.769-6.37,19.468   c6.467,14.596,6.294,33.164-8.524,42.552c-22.282,9.771-2.044,22.357-9.381,38.301c-3.224,13.983-24.09,14.155-22.777,27.473   c0.673,5.194,0.999,10.352-1.365,15.376c-28.966,35.932-201.018,37.286-243.936,15.6c0.076-52.214-1.844-111.699-5.202-164.451   c21.605-2.17,42.764-9.698,60.793-21.816c1.264-0.668,0.688-1.769-0.571-0.997c-18.437,9.597-41.438,18.574-61.674,16.924   c73.544-13.624,144.461-71.884,131.952-153.827l0,0c-2.023-7.209,3.831-7.162,9.33-8.201   c69.045,11.493,5.392,105.615,43.681,142.717c-4.393,0.561-8.443,1.038-12.537,1.057c0,0,0,0,0,0   c-8.755,0.425-7.772,1.702,0.123,2.597c0.072-0.061,0.141-0.057,0.206,0.012c15.421,1.16,30.862,0.129,46.255-0.332   c0,0-0.001,0-0.001,0c4.445-0.474,8.928-0.473,13.4-0.654c0,0,0,0,0,0c11.768-0.691,23.514-2.33,35.292-2.614c0,0-0.001,0-0.001,0   c10.419-0.914,23.177-0.985,30.602,7.5c0.004-0.005,0.005-0.009,0.01-0.014c0,0,0,0,0,0l0-0.001c0,0,0,0,0,0.001   C451.014,229.228,450.056,239.284,445.966,246.273z"
            fill="#58454D" />
          <path d="M356.965,219.092c-0.33,0.01-0.652,0.051-0.97,0.107C356.317,219.158,356.639,219.115,356.965,219.092z"
            fill="#58454D" />
          <path
            d="M192.947,256.655c7.896,0.589,3.169,9.676-0.237,12.764c-4.403,5.168-8.105,10.745-10.573,17.082   c-2.562,4.407-2.156,11.935-7.154,14.217c-2.191,0.452-3.913-0.69-5.317-2.221C155.452,281.619,174.727,258.894,192.947,256.655z"
            fill="#E4C39D" />
          <path d="M281.822,115.182c0.827,2.828,0.112,5.889,0.32,8.822C281.543,121.081,281.086,118.153,281.822,115.182z"
            fill="#E5C6A1" />
          <path
            d="M130.268,299.727c0.004-13.868-2.565-42.494-3.845-53.145c-0.048-16.206-6.512-25.934-23.897-23.487   c-38.885,1.572-40.856,8.614-38.47,45.596c1.691,42.151,2.934,84.042,6.721,126.033c0.182,12.222,11.246,3.367,14.044,8.597   c0.078,1.533-1.075,1.97-2.269,1.985c-5.217,0-13.079,1.184-14.618-5.4c-2.061-9.718-1.873-19.786-2.984-29.645   c-1.357-35.307-3.715-70.379-4.678-105.77c0.427-28.49-3.36-42.421,30.275-45.047c31.972-3.982,39.589,2.175,40.708,34.555   c2.184,37.289,3.618,74.633,4.661,111.976c-0.734,15.169,5.464,44.719-19.069,37.115c1.67-3.641,7.923-1.249,11.21-2.935   c8.18-3.436,3.491-19.377,4.48-26.726C132.313,348.853,131.798,324.26,130.268,299.727z"
            fill="#58454D" />
          <path d="M124.66,215.494c-1.467-0.106-2.841-0.616-4.248-0.983C121.926,214.416,123.363,214.653,124.66,215.494z"
            fill="#ACCED7" />
          <path
            d="M134.136,225.946c-0.756-0.984-1.292-2.077-1.636-3.267C133.497,223.542,133.958,224.673,134.136,225.946z"
            fill="#ACCED7" />
          <path
            d="M118.781,214.508c-1.194-0.154-2.448,0.349-3.595-0.325C116.417,213.925,117.616,214.034,118.781,214.508z"
            fill="#ACCED7" />
          <path d="M100.159,214.836c-1.147,0.674-2.401,0.17-3.595,0.325C97.71,214.487,98.964,214.992,100.159,214.836z"
            fill="#ACCED7" />
          <path d="M95.584,215.163c-0.693,0.6-1.525,0.218-2.288,0.325C94.002,214.978,94.731,214.64,95.584,215.163z"
            fill="#ACCED7" />
          <path
            d="M187.069,251.437c19.396-9.238,40.927-14.241,57.833-28.103   C228.685,237.778,206.753,243.262,187.069,251.437z"
            fill="#E5C6A1" />
          <path
            d="M251.11,217.783c3.857-4.691,7.863-9.672,11.757-14.382C259.657,208.677,255.669,213.606,251.11,217.783z"
            fill="#E5C6A1" />
          <path
            d="M244.901,223.335c1.925-1.785,3.612-3.836,5.886-5.228C249.028,220.078,247.301,222.086,244.901,223.335z"
            fill="#E5C6A1" />
          <path
            d="M108.32,403.336c0.332,10.816-15.93,11.124-15.907,0.375C92.287,392.849,108.506,391.758,108.32,403.336z"
            fill="#DB5143" />
          <path
            d="M100.442,391.485c-14.593-0.363-14.917,23.888-0.298,23.811   C114.71,415.342,115.554,391.541,100.442,391.485z M100.037,410.832c-9.507,0.029-8.56-15.15,0.412-14.99   C109.394,395.766,109.11,411.215,100.037,410.832z"
            fill="#58454D" />
        </g>
      </svg>
      <p>Copied to the clipboard!</p>
    </div>
  </div>


</template>

<style lang="scss">
#chat-box {
  position: relative;
  width: min(1000px, 100%);
  height: min(700px, 100%);
  background-color: var(--light-main);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 15px hsla(210, 90%, 16%, 0.4), 0 0 10px hsla(209, 87%, 15%, 0.4);
  will-change: transform;
  display: flex;

  .info-block {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .users-info {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding-right: 1rem;

      h3 {
        font-size: 1.4rem;
      }

      .users {
        position: relative;
        top: 5rem;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        overflow-y: auto;
        height: 70%;

        &::-webkit-scrollbar {
          width: 7px;
        }

        &::-webkit-scrollbar-track {
          width: 7px;
          background-color: none;
        }

        &::-webkit-scrollbar-thumb {
          background-color: #0a5676;
        }

        @supports (scrollbar-color: red green) {
          scrollbar-color: #0a5676 transparent;
          scrollbar-width: thin;
        }

        .user {
          display: flex;
          align-items: center;

          span {
            font-weight: 500;
          }

          svg {
            width: 1.6rem;
            height: 1.6rem;
            margin-right: 1rem;

            path,
            circle {
              fill: #1087ba;
            }
          }
        }
      }

      .fade-users-move,
      .fade-users-enter-active,
      .fade-users-leave-active {
        transition: all 0.7s ease;
      }

      .fade-users-enter-from,
      .fade-users-leave-to {
        opacity: 0;
        transform: translateX(-200%);
      }

      .fade-users-enter-to,
      .fade-users-leave-from {
        opacity: 1;
        transform: translateX(0%);
      }

      .fade-users-leave-active {
        position: absolute;
      }
    }

    .exit {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 1.5rem;

      .exit-btn {
        border: none;
        background-color: transparent;
        height: 2.2rem;
        width: 2.2rem;
        transition: transform 0.2s ease, filter 0.3s ease;
        will-change: transform;

        &:active {
          transform: scale(0.8);
        }

        &:hover {
          filter: brightness(120%);
        }

        svg {
          width: 100%;
          height: 100%;
          background-color: transparent;

          path {
            fill: #046994;
          }
        }

      }

      .copy-btn {
        position: relative;
        background-color: transparent;
        border: none;
        color: #0a5676;
        padding: 0.4rem 0.7rem;
        font-weight: 500;
        transition: color 0.3s ease;
        overflow: hidden;

        &::before {
          position: absolute;
          content: "";
          inset: 0;
          width: 100%;
          height: 100%;
          background-color: #0a6698;
          transition: transform 0.3s ease;
          transform: translateX(-120%);
          z-index: -1;
        }

        &:hover {
          color: var(--light-main);
        }

        &:hover::before {
          transform: translateX(0%);
        }
      }
    }

  }


  .messages-block {
    flex: 3;
    background-color: hsl(208, 82%, 20%);
    box-shadow: inset 0 0 15px hsla(209, 82%, 6%, 0.7);
    display: flex;
    flex-direction: column;

    .messages {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      overflow-y: scroll;

      &::-webkit-scrollbar {
        display: none;
      }

      .message {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        border-radius: 1rem;
        box-shadow: 0 0 15px hsla(209, 82%, 6%, 0.4), 0 0 15px hsla(209, 82%, 6%, 0.4);
        background-color: var(--light-accent);

        &.info-msg {
          background-color: hsl(211, 30%, 68%);
          gap: 0;
        }

        .msg-text {
          width: 100%;
        }

        .msg-info {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .msg-username,
          .msg-time {
            font-size: 0.8rem;
            color: hsl(196, 17%, 26%);
          }
        }
      }

    }

    .fade-msgs-move,
    .fade-msgs-enter-active,
    .fade-msgs-leave-active {
      transition: opacity 0.5s ease-in-out;
    }

    .fade-msgs-enter-from,
    .fade-msgs-leave-to {
      opacity: 0;
    }

    .fade-msgs-enter-to,
    .fade-msgs-leave-from {
      opacity: 1;
    }

    .send-message {
      position: relative;
      width: 100%;
      padding: 0.8rem;

      .emoji-container {
        position: absolute;
        top: -28rem;
        left: -1rem;
        width: 100%;
        display: flex;
        justify-content: flex-end;
        padding-block-end: 1rem;
        visibility: hidden;
        opacity: 0;
        transition: visibility 0.5s ease-in-out, opacity 0.5s ease-in-out;

        &.open-emoji {
          visibility: visible;
          opacity: 1;
        }
      }

      .send-box {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.5rem;


        .emoji-trigger {
          padding: 0.2rem;
          cursor: pointer;
          width: 2.4rem;
          height: 2.4rem;
          border: none;
          background: none;
          will-change: transform;
          transition: filter 0.3s ease, transform 0.1s ease;

          &:hover {
            filter: contrast(70%);
          }

          &:active {
            transform: scale(0.9);
          }

          &>svg {
            width: 100%;
            height: 100%;

            & path {
              fill: hsl(0, 0%, 100%);
            }
          }
        }

        .input-box {
          width: 100%;
          max-height: 4rem;
          box-shadow: 0 0 15px hsla(209, 82%, 6%, 0.4), 0 0 15px hsla(209, 82%, 6%, 0.4);
          background-color: #fff;
          border-radius: 0.5rem;
          overflow: hidden;

          .input {
            width: 100%;
            max-height: 4rem;
            line-height: 1.5;
            padding: 0.4rem;
            border-radius: 0.5rem;
            overflow-y: scroll;

            &::-webkit-scrollbar {
              display: none;
            }
          }
        }

        button {
          border: none;
          background: none;
          padding: 0.1rem;
          width: 2.4rem;
          height: 2.4rem;
          will-change: transform;
          transition: filter 0.3s ease, transform 0.1s ease;

          &:hover {
            filter: contrast(70%);
          }

          &:active {
            transform: scale(0.9);
          }

          svg {
            width: 100%;
            height: 100%;


            & path {
              fill: hsl(0, 0%, 100%);
            }
          }
        }


      }

    }

  }

  .copyModal {
    position: absolute;
    top: 0;
    left: 35%;
    background-color: var(--light-main);
    box-shadow: 0 0 15px hsla(209, 82%, 6%, 0.4), 0 0 15px hsla(209, 82%, 6%, 0.3);
    border-radius: 1rem;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    opacity: 0;
    transform: translateY(-200%);
    transition: opacity 0.5s ease, transform 0.5s ease;

    svg {
      width: 2rem;
      height: 2rem;
    }

    &.show-modal {
      opacity: 1;
      transform: translateY(0%);
    }
  }
}
</style>
