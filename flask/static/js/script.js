import { getQuestionByLevel, getQuestionCountByLevel } from './sequence.js';

let currentLevel = 1;  // 초기 레벨 설정
let currentStep = 0;   // 각 레벨 내 단계 추적

function handleUserMessage(message) {
    const chatContainer = document.getElementById('chat-container');
    
    // 질문 수준에 따라 질문 진행
    const question = getQuestionByLevel(currentLevel, currentStep);
    
    if (question) {
        askQuestion(question);
        currentStep++; // 다음 질문으로 넘어감

        // 현재 레벨에서 모든 질문이 완료되면 레벨 업
        if (currentStep >= getQuestionCountByLevel(currentLevel)) {
            currentLevel++;
            currentStep = 0; // 다음 레벨의 첫 질문으로 초기화
        }
    } else {
        // 관련 없는 질문 처리
        askQuestion("여행 일정에 도움이 되는 질문을 부탁드립니다.");
    }
}

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
    chatContainer.scrollTop = chatContainer.scrollHeight; // 스크롤을 아래로
}

// 페이지 로드 시 실행
window.onload = function() {
    // 상대방이 사용자에게 "어디로 떠나고 싶으세요?" 라고 메세지를 보냅니다.
    const chatContainer = document.getElementById('chat-container');
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'opponent-message';
    botMessageDiv.innerHTML = `
        <div class="opponent-message">
            <div class="message-box">
                <p>어디로 떠나고 싶으세요?</p>
            </div>
        </div>
        <span class="text-xs text-gray-500 ml-2">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                
    `;
    chatContainer.appendChild(botMessageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight; // 스크롤을 아래로
}

// 메시지 전송 함수
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (message) {
        const chatContainer = document.getElementById('chat-container');
        
        // 사용자 메시지
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'user-message'; // 사용자 메시지 스타일
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
        chatContainer.scrollTop = chatContainer.scrollHeight; // 스크롤을 아래로

        // GPT API에 메시지 전송
        fetch('/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            // GPT의 응답 메시지
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'opponent-message'; // 상대방 메시지 스타일
            botMessageDiv.innerHTML = `
                <div class="opponent-message">
                    <div class="message-box">
                        <p>${data.response.replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
                <span class="text-xs text-gray-500 ml-2">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            `;
            chatContainer.appendChild(botMessageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight; // 스크롤을 아래로
        });
    }
}

// 엔터 키 이벤트 리스너
document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
