const selectedUser = "{{ selected_user.username if selected_user else '' }}";
const chatBox = document.getElementById('chat-box');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function fetchMessages() {
    if (!selectedUser) return;
    fetch(`/messages/messages/${selectedUser}/`)
        .then(response => response.json())
        .then(data => {
            console.log('Fetched messages:', data.messages);
            chatBox.innerHTML = '';
            data.messages.forEach((msg) => {
                const msgDiv = document.createElement('div');
                msgDiv.classList.add('message-container');
                msgDiv.classList.add(msg.sender === "{{ request.user.username }}" ? 'sent' : 'received');
                const bubble = document.createElement('div');
                bubble.classList.add('message-bubble');
                bubble.classList.add(msg.sender === "{{ request.user.username }}" ? 'message-sent' : 'message-received');
                bubble.innerHTML = `<div>${msg.content}</div><div class="message-timestamp">${msg.timestamp.split(' ')[1].slice(0,5)}</div>`;
                msgDiv.appendChild(bubble);
                chatBox.appendChild(msgDiv);
            });
            scrollToBottom();
        });
}

messageForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const content = messageInput.value.trim();
    if (!content) return;
    fetch('/messages/send/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        credentials: 'same-origin',
        body: JSON.stringify({
            receiver: selectedUser,
            content: content
        })
    }).then(response => {
        if (response.ok) {
            messageInput.value = '';
            setTimeout(fetchMessages, 500);
        } else {
            alert('Failed to send message.');
        }
    });
});

// Poll for new messages every 1 second (reduced from 3 seconds)
setInterval(fetchMessages, 1000);

// Initial fetch and scroll
fetchMessages();
