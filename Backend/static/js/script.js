let userAnswers = { destination: null, duration: null, peopleCount: null };

// 서버로 메시지를 보내고 응답을 처리하는 함수
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

// 메시지를 화면에 출력하는 함수
function appendMessage(message, sender = 'user') {
    const chatContainer = document.getElementById('chat-container');
    const messageDiv = document.createElement('div');

    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    
    // 줄바꿈이 반영되도록 <pre> 태그 사용
    messageDiv.innerHTML = `<pre style="white-space: pre-wrap;">${message}</pre>`;

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


// 채팅 입력 필드에서 엔터키를 눌렀을 때 메시지 전송
document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});

// 사용자가 입력한 메시지를 처리하는 함수
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (message) {
        appendMessage(message, 'user');
        input.value = '';  // 입력 필드 초기화
        analyzeUserResponse(message);
    }
}
