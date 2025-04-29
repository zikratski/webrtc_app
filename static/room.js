const socket = io();
// const roomId = window.location.pathname.split("/").pop();

let localStream;
let remoteStream;
let peerConnection;

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

async function init() {
    console.log("🌐 Инициализация...");
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("🎥 Камера и 🎤 микрофон получены");
        localVideo.srcObject = localStream;

        socket.emit('join', { room: roomId });
        console.log(`📡 Отправили событие 'join' для комнаты: ${roomId}`);

        socket.on('user-joined', handleJoined);
        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('ice-candidate', handleIceCandidate);
    } catch (err) {
        console.error("❌ Ошибка доступа к камере/микрофону:", err);
    }
}

function createPeerConnection() {
    console.log("🔧 Создание peerConnection...");
    peerConnection = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        console.log("📹 Получен удаленный трек");
        if (!remoteStream) {
            remoteStream = new MediaStream();
            remoteVideo.srcObject = remoteStream;
        }
        remoteStream.addTrack(event.track);
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log("📨 Отправка ICE-кандидата");
            socket.emit('ice-candidate', {
                candidate: event.candidate,
                room: roomId
            });
        }
    };
}

async function handleJoined() {
    console.log("👥 Присоединился второй пользователь, отправляем offer...");
    createPeerConnection();

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit('offer', {
        offer: offer,
        room: roomId
    });
    console.log("📤 Отправлен offer");
}

async function handleOffer(data) {
    console.log("📥 Получен offer, создаем answer...");
    createPeerConnection();

    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit('answer', {
        answer: answer,
        room: roomId
    });
    console.log("📤 Отправлен answer");
}

async function handleAnswer(data) {
    console.log("📥 Получен answer");
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
}

function handleIceCandidate(data) {
    console.log("📥 Получен ICE-кандидат");
    const candidate = new RTCIceCandidate(data.candidate);
    peerConnection.addIceCandidate(candidate);
}

// // 🔘 Обработчики кнопок
// document.getElementById('toggleMic').addEventListener('click', () => {
//     if (!localStream) return;
//     localStream.getAudioTracks().forEach(track => {
//         track.enabled = !track.enabled;
//         console.log(`🎙️ Микрофон: ${track.enabled ? 'вкл' : 'выкл'}`);
//     });
// });

// document.getElementById('toggleCam').addEventListener('click', () => {
//     if (!localStream) return;
//     localStream.getVideoTracks().forEach(track => {
//         track.enabled = !track.enabled;
//         console.log(`📷 Камера: ${track.enabled ? 'вкл' : 'выкл'}`);
//     });
// });

socket.on('room-not-found', () => {
    alert("Комната не существует или уже закрыта.");
    window.location.href = '/';
});

document.getElementById('toggleMic').addEventListener('click', () => {
    const micBtn = document.getElementById('toggleMic');
    const micTrack = localStream.getAudioTracks()[0];
    micTrack.enabled = !micTrack.enabled;

    micBtn.classList.toggle('inactive');
    micBtn.classList.toggle('active');
    micBtn.innerHTML = micTrack.enabled
        ? '<i class="fas fa-microphone"></i>'
        : '<i class="fas fa-microphone-slash"></i>';
});

document.getElementById('toggleCam').addEventListener('click', () => {
    const camBtn = document.getElementById('toggleCam');
    const camTrack = localStream.getVideoTracks()[0];
    camTrack.enabled = !camTrack.enabled;

    camBtn.classList.toggle('inactive');
    camBtn.classList.toggle('active');
    camBtn.innerHTML = camTrack.enabled
        ? '<i class="fas fa-video"></i>'
        : '<i class="fas fa-video-slash"></i>';
});


// 🚀 Старт
init();
