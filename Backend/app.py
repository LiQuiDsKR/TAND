import os
import json
import re
from flask import Flask, request, jsonify, render_template
import openai

app = Flask(__name__)
openai.api_key = os.getenv("OPENAI_API_KEY")

# 사용자 정보 누적 객체 (필수 정보가 누적됨)
user_answers = {
    "destination": None,
    "duration": None,
    "peopleCount": None,
    "theme": None,
    "nextActivity": None
}

def get_missing_info():
    """필수 정보 중 누락된 항목을 확인합니다."""
    required = ["destination", "duration", "peopleCount"]
    missing = [key for key in required if not user_answers.get(key) or user_answers[key] == 'None']
    return missing

def extract_json_from_response(response_text):
    """GPT 응답에서 JSON 부분만 추출합니다."""
    try:
        json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except json.JSONDecodeError as e:
        print(f"JSON 파싱 오류: {e}")
    return {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/send_message', methods=['POST'])
def send_message():
    global user_answers  # 전역 객체를 사용해 누적

    user_message = request.json.get('message')

    # GPT에 명확한 JSON 형식의 응답 요청
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful travel assistant."},
            {
                "role": "user",
                "content": (
                    f"사용자가 '{user_message}'라고 했을 때, 아래와 같은 JSON 형식으로 정보를 반환해 주세요:\n"
                    '{\n'
                    '  "destination": "<여행지>",\n'
                    '  "duration": "<여행 기간>",\n'
                    '  "peopleCount": "<여행 인원>",\n'
                    '  "theme": "<여행 테마>",\n'
                    '  "nextActivity": "<다음 활동>"\n'
                    '}\n'
                    "모든 필드는 큰따옴표를 사용해야 하며, 정보가 없으면 'None'을 반환하세요."
                )
            }
        ],
        temperature=0.7,
        max_tokens=150
    )

    gpt_response = response['choices'][0]['message']['content'].strip()
    print("GPT 응답:", gpt_response)  # 디버깅용

    # JSON 부분 추출
    new_data = extract_json_from_response(gpt_response)

    # 새로운 데이터를 기존 데이터에 누적
    for key, value in new_data.items():
        if value != 'None':  # 'None'이 아닌 값만 누적
            user_answers[key] = value

    # 누락된 필수 정보 확인
    missing_info = get_missing_info()

    if missing_info:
        next_question = f"{', '.join(missing_info)} 정보가 필요합니다. 알려주시겠어요?"
        return jsonify({"question": next_question})

    # 모든 필수 정보가 수집된 경우
    collected_info = (
        f"여행지: {user_answers.get('destination', '알 수 없음')}\n"
        f"여행 기간: {user_answers.get('duration', '알 수 없음')}\n"
        f"여행 인원: {user_answers.get('peopleCount', '알 수 없음')}\n"
        f"여행 테마: {user_answers.get('theme', '알 수 없음')}\n"
        f"다음 활동: {user_answers.get('nextActivity', '알 수 없음')}"
    )

    # 누적된 정보를 초기화 (필요 시)
    user_answers = {key: None for key in user_answers}

    return jsonify({
        "message": f"기초 정보가 모두 수집되었습니다. 2단계로 진행합니다.\n\n수집된 정보:\n{collected_info}"
    })

if __name__ == '__main__':
    app.run(debug=True)
