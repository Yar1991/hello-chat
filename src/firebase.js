import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { useChatStore } from "./store";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rooms = collection(db, "rooms");

export function newRoom(username) {
  const room = doc(rooms);
  const users = collection(db, `rooms/${room.id}/users`);
  const roomMsgs = collection(db, `rooms/${room.id}/messages`);
  const newUser = doc(users);
  const joinedUserDoc = doc(roomMsgs);
  const joinedMsg = {
    text: `${username[0].toUpperCase() + username.slice(1)} joined the room`,
    timestamp: Timestamp.fromMillis(new Date().getTime()),
    style: "info-msg",
  };
  setDoc(newUser, {
    name: username,
  });
  setDoc(joinedUserDoc, joinedMsg);
  return room.id;
}

export async function joinRoom(roomID, username) {
  const roomUsers = collection(db, `rooms/${roomID}/users`);
  const roomMsgs = collection(db, `rooms/${roomID}/messages`);
  const joinedUserDoc = doc(roomMsgs);
  const joinedMsg = {
    text: `${username[0].toUpperCase() + username.slice(1)} joined the room`,
    timestamp: Timestamp.fromMillis(new Date().getTime()),
    style: "info-msg",
  };
  const allUsers = await getDocs(roomUsers);
  const exists = allUsers.docs.find(
    (doc) => doc.data().name.toLowerCase() === username.toLowerCase()
  );
  if (exists) {
    return "exists";
  } else {
    const users = [];
    allUsers.docs.forEach((doc) => users.push(doc.data().name));
    users.push(username);
    await addDoc(roomUsers, {
      name: username,
    });
    await setDoc(joinedUserDoc, joinedMsg);
    return users;
  }
}

export async function removeFromRoom(roomID, username) {
  const roomUsers = collection(db, `rooms/${roomID}/users`);
  const allUsers = await getDocs(roomUsers);
  const messagesRef = collection(db, `rooms/${roomID}/messages`);
  const allMessages = await getDocs(messagesRef);
  const targetUser = allUsers.docs.find(
    (doc) => doc.data().name.toLowerCase() === username.toLowerCase()
  );
  if (allUsers.docs.length <= 1) {
    allMessages.forEach(async (message) => {
      await deleteDoc(doc(db, `rooms/${roomID}/messages/${message.id}`));
    });
    await deleteDoc(doc(db, `rooms/${roomID}/users/${targetUser.id}`));
    await deleteDoc(doc(db, `rooms/${roomID}`));
  } else {
    const leftUserDoc = doc(messagesRef);
    const leftMsg = {
      text: `${username[0].toUpperCase() + username.slice(1)} left the room`,
      timestamp: Timestamp.fromMillis(new Date().getTime()),
      style: "info-msg",
    };
    await deleteDoc(doc(db, `rooms/${roomID}/users/${targetUser.id}`));
    await setDoc(leftUserDoc, leftMsg);
  }
}

export function wathcUsersUpdate(roomID) {
  const chatState = useChatStore();
  return onSnapshot(collection(db, `rooms/${roomID}/users`), (snapshot) => {
    const allUsers = [];
    snapshot.forEach((doc) => allUsers.push(doc.data().name));
    chatState.allUsers = [...allUsers];
    localStorage.setItem("users", JSON.stringify(chatState.allUsers));
  });
}

export async function newMessage(roomID, message) {
  const messages = collection(db, `rooms/${roomID}/messages`);
  const messageDoc = doc(messages);
  const newMessage = {
    text: message.text,
    username: message.username,
    time: message.time,
    timestamp: Timestamp.fromMillis(new Date().getTime()),
  };

  await setDoc(messageDoc, newMessage);
}

export function watchMessagesUpdate(roomID) {
  const chatState = useChatStore();
  return onSnapshot(collection(db, `rooms/${roomID}/messages`), (snapshot) => {
    const allMsgs = [];
    snapshot.forEach((doc) => allMsgs.push(doc.data()));
    allMsgs.sort((a, b) => {
      return a.timestamp.seconds - b.timestamp.seconds;
    });
    chatState.allMessages = [...allMsgs];
  });
}

export async function roomExists(roomID) {
  const roomDocs = collection(db, `rooms/${roomID}/users`);
  const targetRoom = await getDocs(roomDocs);
  if (targetRoom.docs.length < 1) {
    return false;
  } else {
    return true;
  }
}
