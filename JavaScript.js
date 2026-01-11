// central.js
// ================== Firebase Config ==================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ================== User ==================
let username = localStorage.getItem("username");
if(!username){
    username = prompt("ชื่อผู้ใช้ของคุณ");
    localStorage.setItem("username", username);
}

// ================== Room Functions ==================

// สร้างห้องใหม่
function createRoom(id, name, locked=false, password=""){
    const roomRef = db.ref("rooms/" + id);
    roomRef.get().then(snap => {
        if(snap.exists()) return alert("ID ห้องนี้ถูกใช้งานแล้ว");
        roomRef.set({
            id, name, locked, password, owner: username,
            users: {[username]:true}, chats:{}, camOn:false
        });
    });
}

// เข้าห้อง
function enterRoom(id){
    const roomRef = db.ref("rooms/"+id);
    roomRef.once("value").then(snap=>{
        const room = snap.val();
        if(!room) return alert("ห้องไม่พบ");
        if(room.locked){
            const p = prompt("ใส่รหัสห้อง");
            if(p !== room.password) return alert("รหัสผิด");
        }
        room.users = room.users || {};
        room.users[username] = true;
        roomRef.update({users: room.users});

        // ฟังแชทเรียลไทม์
        db.ref("rooms/"+id+"/chats").on("value", snap=>{
            const chats = snap.val() || {};
            renderChat(chats);
        });

        // ฟังผู้ใช้เรียลไทม์
        db.ref("rooms/"+id+"/users").on("value", snap=>{
            const users = snap.val() || {};
            renderUserCount(Object.keys(users).length);
        });

        // ฟังกล้องเรียลไทม์
        db.ref("rooms/"+id+"/camOn").on("value", snap=>{
            const cam = snap.val();
            toggleCameraDisplay(cam, room.owner===username);
        });
    });
}

// ส่งแชท
function sendChat(message){
    if(!currentRoomId) return;
    const msgRef = db.ref("rooms/"+currentRoomId+"/chats");
    msgRef.push(username+": "+message);
}

// เปิด / ปิดกล้อง
function toggleCam(){
    if(!currentRoomId) return;
    const roomRef = db.ref("rooms/"+currentRoomId);
    roomRef.once("value").then(snap=>{
        const room = snap.val();
        if(room.owner !== username) return;
        const newCam = !room.camOn;
        roomRef.update({camOn: newCam});
        if(newCam){
            navigator.mediaDevices.getUserMedia({video:true}).then(stream=>{
                cameraVideo.srcObject = stream;
                cameraStream = stream;
            });
        } else {
            if(cameraStream) cameraStream.getTracks().forEach(t=>t.stop());
            cameraVideo.srcObject = null;
        }
    });
}

// ปิดห้อง
function closeRoom(){
    if(!currentRoomId) return;
    db.ref("rooms/"+currentRoomId).remove();
}

// ออกจากห้อง
function exitRoom(){
    if(!currentRoomId) return;
    if(cameraStream) cameraStream.getTracks().forEach(t=>t.stop());
    db.ref("rooms/"+currentRoomId+"/users/"+username).remove();
}

// ================== ฟังก์ชันช่วย ==================
function renderChat(chats){
    chatBox.innerHTML="";
    Object.values(chats).forEach(c=>{
        const d = document.createElement("div");
        d.innerText = c;
        chatBox.appendChild(d);
    });
}

function renderUserCount(n){
    showRoomCount.innerText = n;
}

function toggleCameraDisplay(cam, isOwner){
    if(!isOwner) cameraArea.style.display = cam?"flex":"none";
}