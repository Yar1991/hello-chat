export function addToLocal(username) {
  localStorage.setItem("current-user", JSON.stringify(username));
  if (localStorage.getItem("users")) {
    const allUsers = JSON.parse(localStorage.getItem("users"));
    allUsers.push(username);
    localStorage.setItem("users", JSON.stringify(allUsers));
  } else {
    const allUsers = [];
    allUsers.push(username);
    localStorage.setItem("users", JSON.stringify(allUsers));
  }
}

export function getFromLocal() {
  if (localStorage.getItem("users")) {
    const allUsers = JSON.parse(localStorage.getItem("users"));
    return allUsers;
  }
}

export function removeFromLocal() {
  let allUsers = JSON.parse(localStorage.getItem("users"));
  const targetUser = JSON.parse(localStorage.getItem("current-user"));
  allUsers = allUsers.filter((name) => name !== targetUser);
  localStorage.setItem("users", JSON.stringify(allUsers));
}
