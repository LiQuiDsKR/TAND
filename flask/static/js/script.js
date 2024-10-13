let userAnswers = {
    destination: null,
    duration: null,
    theme: null,
    peopleCount: null,
    nextActivity: null
};

// 사용자 메시지를 백엔드로 전송해 AI 분석 결과를 받는 함수
function analyzeUserResponse(response) {
    return fetch('/send_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: response })
    })
    .then(response => response.json())
    .then(data => {
        // AI가 추출한 데이터를 저장
        if (data.duration) userAnswers.duration = data.duration;
        if (data.destination) userAnswers.destination = data.destination;
        if (data.theme) userAnswers.theme = data.theme;
        if (data.peopleCount) userAnswers.peopleCount = data.peopleCount;
        if (data.nextActivity) userAnswers.nextActivity = data.nextActivity;
    });
}

// 다음 질문을 결정하는 함수
function getNextQuestion() {
    if (!userAnswers.destination) {
        return "어디로 여행을 가시나요?";
    }
    if (!userAnswers.duration) {
        return "여행 기간은 몇 박 며칠인가요?";
    }
    if (!userAnswers.theme) {
        return "여행의 테마는 어떤가요? (관광지 탐방 / 쇼핑 / 힐링)";
    }
    if (!userAnswers.peopleCount) {
        return "몇 명이서 가시나요?";
    }
    if (!userAnswers.nextActivity) {
        return "다음으로는 무엇을 하시겠어요? (여행지 관광 / 카페 / 숙소)";
    }
    return null;
}

// 사용자 메시지 처리 및 다음 질문을 묻는 함수
function handleUserMessage(message) {
    analyzeUserResponse(message).then(() => {
        const nextQuestion = getNextQuestion();
        if (nextQuestion) {
            askQuestion(nextQuestion);
        } else {
            askQuestion("모든 정보가 수집되었습니다. 이제 여행 일정을 세워드리겠습니다.");
        }
    });
}

// 질문을 화면에 출력하는 함수
function askQuestion(question) {
    const chatContainer = document.getElementById('chat-container');
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'opponent-message';
    botMessageDiv.innerHTML = `
        <div class="opponent-message">
            <div class="message-box">
                <p>${question}</p>
            </div>
        </div>
        <span class="text-xs text-gray-500 ml-2">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    `;
    chatContainer.appendChild(botMessageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 메시지를 전송하고 처리하는 함수
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (message) {
        const chatContainer = document.getElementById('chat-container');
        
        // 사용자 메시지 출력
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'user-message';
        userMessageDiv.innerHTML = `
            <span class="text-xs text-gray-500 mr-2">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <div class="user-message">
                <div class="message-box">
                    <p>${message}</p>
                </div>
            </div>
        `;
        chatContainer.appendChild(userMessageDiv);
        input.value = ''; // 입력 필드 초기화
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // 사용자 메시지를 처리
        handleUserMessage(message);
    }
}

// 엔터 키 입력 시 메시지 전송
document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
