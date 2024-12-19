let userAnswers = { destination: null, duration: null, peopleCount: null };

function analyzeUserResponse(response) {
    return fetch('/send_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: response })
    })
    .then(response => response.json())
    .then(data => {
        if (data.question) {
            const question = data.question
                .replace('destination', '여행 지역')
                .replace('duration', '여행 기간')
                .replace('peopleCount', '여행 인원수');
            appendMessage(question, 'bot');
        } else if (data.message) {
            appendMessage(data.message, 'bot');
        }
    })
    .catch(error => console.error('Error:', error));
}

function appendMessage(message, sender = 'user') {
    const chatContainer = document.getElementById('chat-container');
    const messageDiv = document.createElement('div');

    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    
    messageDiv.innerHTML = `<pre style="white-space: pre-wrap;">${message}</pre>`;

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (message) {
        appendMessage(message, 'user');
        input.value = '';
        analyzeUserResponse(message);
    }
}

document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('#chat-container').addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.textContent.includes('다음 단계')) {
            e.preventDefault();
            showLoadingOverlay();

            fetch('/generate_schedule')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = '/edit';
                    }
                })
                .catch(error => console.error('Error:', error));
        }
    });
});

function showLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}
