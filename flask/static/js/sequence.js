// sequence.js

// 질문 수준에 따른 단계별 질문들
const questions = {
    level1: [
        "여행 기간은 몇 박 며칠인가요?",
        "어디로 여행을 가시나요?"
    ],
    level2: [
        "여행의 테마는 어떤가요? (관광지 탐방 / 쇼핑 홀릭 / 맛집 투어 / 호캉스 힐링 / 포토존 정복)",
        "몇 명이서 가시나요?"
    ],
    level3: [
        "다음으로는 무엇을 하시겠어요? (여행지 관광 / 카페 / 숙소)"
    ]
};

// 각 레벨에서 필요한 정보를 반환하는 함수
function getQuestionByLevel(level, step) {
    if (questions[`level${level}`] && questions[`level${level}`][step]) {
        return questions[`level${level}`][step];
    }
    return null; // 질문이 없을 경우
}

// 현재 레벨에서 질문 개수를 반환
function getQuestionCountByLevel(level) {
    return questions[`level${level}`] ? questions[`level${level}`].length : 0;
}

// 레벨과 단계를 올바르게 처리하는 로직 추가 가능
export { getQuestionByLevel, getQuestionCountByLevel };
