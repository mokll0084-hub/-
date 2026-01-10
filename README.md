<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>เปิดห้อง</title>

<style>
body{
    margin:0;
    font-family:Arial, sans-serif;
    background:#0e0e0e;
    color:#fff;
}

.container{
    max-width:900px;
    margin:auto;
    padding:20px;
}

input, button{
    padding:10px;
    border-radius:8px;
    border:none;
    font-size:16px;
}

button{
    cursor:pointer;
}

.hidden{
    display:none;
}

/* เปิดห้อง */
.open-room-box{
    background:#1c1c1c;
    padding:20px;
    border-radius:12px;
}

.open-room-box input{
    width:100%;
    margin-bottom:10px;
}

.lock-box{
    display:flex;
    gap:10px;
    margin-bottom:10px;
}

.lock-box button{
    flex:1;
    background:#333;
    color:#fff;
}

.lock-box button.active{
    background:#00ff99;
    color:#000;
}

/* ห้อง */
.room-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    background:#1c1c1c;
    padding:10px 15px;
    border-radius:10px;
}

.owner-controls button{
    margin-left:8px;
    background:#00ff99;
    color:#000;
}

/* กล้อง */
.camera-area{
    margin-top:15px;
    background:#000;
    border-radius:12px;
    height:220px;
    display:none;
    align-items:center;
    justify-content:center;
}

.camera-area video{
    width:100%;
    height:100%;
    object-fit:cover;
    border-radius:12px;
}

.chat-box{
    margin-top:15px;
    background:#1c1c1c;
    border-radius:10px;
    padding:10px;
    height:300px;
    overflow-y:auto;
}

.chat-input{
    display:flex;
    margin-top:10px;
    gap:10px;
}

.chat-input input{
    flex:1;
}
</style>
</head>
<body>

<div class="container">

<!-- ====== เปิดห้อง ====== -->
<div id="openRoomBox" class="open-room-box">
    <h2>เปิดห้อง</h2>
    <input id="roomName" placeholder="ชื่อห้อง">
    <input id="roomId" placeholder="ID ห้อง">

    <div class="lock-box">
        <button id="unlockBtn" class="active" onclick="setLock(false)">ไม่ล็อกห้อง</button>
        <button id="lockBtn" onclick="setLock(true)">ล็อกห้อง</button>
    </div>

    <button style="width:100%;background:#00ff99;color:#000;" onclick="openRoom()">เปิดห้อง</button>
</div>

<!-- ====== ภายในห้อง ====== -->
<div id="roomBox" class="hidden">

    <div class="room-header">
        <div>
            <b id="showRoomName"></b>
            <div style="font-size:13px;color:#aaa;">ID ห้อง: <span id="showRoomId"></span></div>
        </div>

        <div class="owner-controls">
            <button onclick="toggleCam()">🎥 เปิด/ปิดกล้อง</button>
            <button onclick="closeRoom()">❌ ปิดห้อง</button>
        </div>
    </div>

    <!-- พื้นที่แสดงกล้อง -->
    <div id="cameraArea" class="camera-area">
        <video id="cameraVideo" autoplay playsinline></video>
    </div>

    <div class="chat-box" id="chatBox"></div>

    <div class="chat-input">
        <input id="chatInput" placeholder="พิมพ์ข้อความ...">
        <button onclick="sendChat()">ส่ง</button>
    </div>

</div>

</div>

<script>
let isLocked = false;
let camOn = false;
let cameraStream = null;

/* ล็อกห้อง */
function setLock(lock){
    isLocked = lock;
    lockBtn.classList.toggle("active", lock);
    unlockBtn.classList.toggle("active", !lock);
}

/* เปิดห้อง */
function openRoom(){
    const name = roomName.value.trim();
    const id = roomId.value.trim();
    if(!name || !id) return alert("กรอกข้อมูลให้ครบ");

    const rooms = JSON.parse(localStorage.getItem("rooms") || "[]");
    rooms.push({ name, id, locked:isLocked });
    localStorage.setItem("rooms", JSON.stringify(rooms));

    openRoomBox.classList.add("hidden");
    roomBox.classList.remove("hidden");

    showRoomName.innerText = name + (isLocked ? " 🔒" : "");
    showRoomId.innerText = id;
}

/* แชท */
function sendChat(){
    if(!chatInput.value) return;
    const msg = document.createElement("div");
    msg.innerText = "คุณ: " + chatInput.value;
    chatBox.appendChild(msg);
    chatInput.value="";
    chatBox.scrollTop = chatBox.scrollHeight;
}

/* เปิด / ปิด กล้องจริง */
function toggleCam(){
    if(!camOn){
        navigator.mediaDevices.getUserMedia({ video:true, audio:false })
        .then(stream=>{
            cameraStream = stream;
            cameraVideo.srcObject = stream;
            cameraArea.style.display = "flex";
            camOn = true;
        })
        .catch(()=>{
            alert("ไม่สามารถเปิดกล้องได้");
        });
    }else{
        cameraStream.getTracks().forEach(track => track.stop());
        cameraVideo.srcObject = null;
        cameraArea.style.display = "none";
        camOn = false;
    }
}

/* ปิดห้อง */
function closeRoom(){
    if(confirm("ต้องการปิดห้องหรือไม่")){
        if(cameraStream){
            cameraStream.getTracks().forEach(track => track.stop());
        }
        location.href = "mm2.html";
    }
}
</script>

</body>
</html>
