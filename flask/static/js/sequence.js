const questions = {
    level1: ["여행 장소는 어디인가요?", "몇 박 며칠 동안 여행할 계획인가요?"],
    level2: ["여행 테마는 무엇인가요? (관광, 힐링 등)", "몇 명이 여행에 참여하나요?"]
};

export function getQuestionByLevel(level, step) {
    return questions[`level${level}`]?.[step] || null;
}
