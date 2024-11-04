import os
import json
import re
from flask import Flask, request, jsonify, render_template
import openai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.after_request
def add_header(response):
    response.headers['Content-Security-Policy'] = "frame-ancestors 'self';"
    return response

user_answers = {
    "destination": None,
    "duration": None,
    "peopleCount": None,
    "theme": None,
    "nextActivity": None
}

def get_missing_info():
    required = ["destination", "duration", "peopleCount"]
    return [key for key in required if not user_answers.get(key) or user_answers[key] == 'None']

def extract_json_from_response(response_text):
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
    global user_answers

    user_message = request.json.get('message')

    try:
        # 최신 API 호출
        response = openai.ChatCompletion.create(
            model="gpt-4",  # 사용 가능한 모델
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

        gpt_response = response.choices[0].message['content'].strip()
        print("GPT 응답:", gpt_response)

        new_data = extract_json_from_response(gpt_response)

        for key, value in new_data.items():
            if value != 'None':
                user_answers[key] = value

        missing_info = get_missing_info()

        if missing_info:
            next_question = f"{', '.join(missing_info)} 정보가 필요합니다. 알려주시겠어요?"
            return jsonify({"question": next_question})

        collected_info = (
            f"여행지: {user_answers.get('destination', '알 수 없음')}\n"
            f"여행 기간: {user_answers.get('duration', '알 수 없음')}\n"
            f"여행 인원: {user_answers.get('peopleCount', '알 수 없음')}\n"
            f"여행 테마: {user_answers.get('theme', '알 수 없음')}\n"
            f"다음 활동: {user_answers.get('nextActivity', '알 수 없음')}"
        )

        user_answers = {key: None for key in user_answers}

        return jsonify({
            "message": f"기초 정보가 모두 수집되었습니다. 2단계로 진행합니다.\n\n수집된 정보:\n{collected_info}"
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "서버에서 오류가 발생했습니다."}), 500

if __name__ == '__main__':
    app.run(debug=True)
