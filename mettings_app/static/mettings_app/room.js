const roomCode = "{{ room.code }}";
const videoGrid = document.getElementById('video-grid');
const toggleMicBtn = document.getElementById('toggle-mic');
const toggleScreenBtn = document.getElementById('toggle-screen');
const copyCodeBtn = document.getElementById('copy-code-btn');
const copyLinkBtn = document.getElementById('copy-link-btn');
const roomCodeElement = document.getElementById('room-code');
const roomLinkElement = document.getElementById('room-link');

let localStream;
let peer;
let peers = {};
let micEnabled = true;
let cameraEnabled = true;
let screenSharing = false;
let screenStream;

// Copy code button handler
if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(roomCodeElement.textContent).then(() => {
            alert('Room code copied to clipboard!');
        }).catch(err => {
            alert('Failed to copy room code.');
            console.error(err);
        });
    });
}

// Copy link button handler
if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(roomLinkElement.value).then(() => {
            alert('Room link copied to clipboard!');
        }).catch(err => {
            alert('Failed to copy room link.');
            console.error(err);
        });
    });
}

// Create WebSocket connection for signaling
const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
const signalingSocket = new WebSocket(
    wsScheme + '://' + window.location.host + '/ws/room/' + roomCode + '/'
);

// Initialize PeerJS
peer = new Peer(undefined, {
    host: '/',
    port: window.location.port || (window.location.protocol === 'https:' ? 443 : 80),
    path: '/peerjs'
});

// Add video element for local stream with fullscreen button wrapper
function addVideoStream(video, stream) {
    const container = document.createElement('div');
    container.classList.add('video-container');

    video.srcObject = stream;
    video.classList.add('rounded-lg', 'shadow-md');
    video.style.width = '100%';
    video.style.height = '200px';
    video.style.objectFit = 'cover';
    video.setAttribute('playsinline', 'true');
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });

    // Create fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.classList.add('fullscreen-btn');
    fullscreenBtn.title = 'Toggle Fullscreen';
    fullscreenBtn.innerHTML = `
        <svg class="fullscreen-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M7 14H5v5h5v-2H7v-3zm10 3h-3v2h5v-5h-2v3zm0-10v3h2V5h-5v2h3zm-10 2h3V7H5v5h2V9z"/>
        </svg>
    `;

    fullscreenBtn.onclick = () => {
        if (!document.fullscreenElement) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.mozRequestFullScreen) { /* Firefox */
                container.mozRequestFullScreen();
            } else if (container.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) { /* IE/Edge */
                container.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    container.appendChild(video);
    container.appendChild(fullscreenBtn);
    videoGrid.appendChild(container);
}

// Get user media (audio and video)
async function getMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const localVideo = document.createElement('video');
        localVideo.muted = true;
        addVideoStream(localVideo, localStream);
    } catch (err) {
        alert('Error accessing media devices. Please allow access to camera and microphone.');
        console.error('getUserMedia error:', err);
        localStream = null;
    }
}

// Call a new user
function callUser(peerId) {
    if (!localStream) {
        console.warn('No local media stream available to call user:', peerId);
        return;
    }
    const call = peer.call(peerId, localStream);
    call.on('stream', userVideoStream => {
        const video = document.createElement('video');
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
        delete peers[peerId];
    });
    peers[peerId] = call;
}

// Answer incoming calls
peer.on('call', call => {
    if (!localStream) {
        console.warn('No local media stream available to answer call');
        call.close();
        return;
    }
    call.answer(localStream);
    call.on('stream', userVideoStream => {
        const video = document.createElement('video');
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    });
    peers[call.peer] = call;
});

// When peer is open, send ID to signaling server
peer.on('open', id => {
    signalingSocket.send(JSON.stringify({ 'type': 'join', 'peer_id': id }));
});

// Handle signaling messages
signalingSocket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'new-peer' && data.peer_id !== peer.id) {
        callUser(data.peer_id);
    }
};

// Toggle microphone
toggleMicBtn.onclick = () => {
    micEnabled = !micEnabled;
    localStream.getAudioTracks()[0].enabled = micEnabled;
    toggleMicBtn.textContent = micEnabled ? 'Mute Mic' : 'Unmute Mic';
};

// Toggle camera
const toggleCameraBtn = document.getElementById('toggle-camera');
if (toggleCameraBtn) {
    toggleCameraBtn.onclick = () => {
        if (!localStream) {
            console.warn('No local media stream available to toggle camera');
            return;
        }
        cameraEnabled = !cameraEnabled;
        localStream.getVideoTracks().forEach(track => {
            track.enabled = cameraEnabled;
        });
        toggleCameraBtn.textContent = cameraEnabled ? 'Turn Camera Off' : 'Turn Camera On';
    };
}

// Toggle screen sharing
toggleScreenBtn.onclick = async () => {
    if (!screenSharing) {
        try {
            screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];
            if (Object.keys(peers).length > 0) {
                Object.values(peers).forEach(call => {
                    const sender = call.peerConnection.getSenders().find(s => s.track.kind === 'video');
                    sender.replaceTrack(screenTrack);
                });
            } else {
                console.warn('No active calls to replace video track');
            }

    // Add screen video element
    const screenVideo = document.createElement('video');
    screenVideo.id = 'screen-video';
    screenVideo.srcObject = screenStream;
    screenVideo.autoplay = true;
    screenVideo.muted = true;
    screenVideo.classList.add('rounded-lg', 'shadow-md');
    screenVideo.style.width = '100%';
    screenVideo.style.height = 'auto';
    screenVideo.style.gridColumn = 'span 2'; // Make screen video span two columns for better visibility
    screenVideo.style.display = 'block'; // Ensure video is displayed
    screenVideo.style.objectFit = 'contain'; // Ensure video fits nicely
    videoGrid.appendChild(screenVideo);

            screenTrack.onended = () => {
                if (Object.keys(peers).length > 0) {
                    Object.values(peers).forEach(call => {
                        const sender = call.peerConnection.getSenders().find(s => s.track.kind === 'video');
                        sender.replaceTrack(localStream.getVideoTracks()[0]);
                    });
                }
                if (screenStream) {
                    screenStream.getTracks().forEach(track => track.stop());
                }
                screenSharing = false;
                toggleScreenBtn.textContent = 'Share Screen';
                // Remove screen video element
                const sv = document.getElementById('screen-video');
                if (sv) {
                    sv.remove();
                }
            };
            screenSharing = true;
            toggleScreenBtn.textContent = 'Stop Sharing';
        } catch (err) {
            console.error('Error sharing screen:', err);
        }
    } else {
        if (Object.keys(peers).length > 0) {
            Object.values(peers).forEach(call => {
                const sender = call.peerConnection.getSenders().find(s => s.track.kind === 'video');
                sender.replaceTrack(localStream.getVideoTracks()[0]);
            });
        } else {
            console.warn('No active calls to replace video track');
        }
        if (screenStream) {
            // Stop all tracks of the screen stream to stop sharing
            screenStream.getTracks().forEach(track => track.stop());
        }
        screenSharing = false;
        toggleScreenBtn.textContent = 'Share Screen';
        // Remove screen video element
        const sv = document.getElementById('screen-video');
        if (sv) {
            sv.remove();
        }
    }
};

getMedia();
