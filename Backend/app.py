import os
import json
import re
from flask import Flask, request, jsonify, render_template, redirect, url_for
import openai
from flask_cors import CORS
import datetime
import sys

sys.stdout.reconfigure(encoding='utf-8')

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
    "essentialActivity": None
}

# 일정 샘플 데이터 저장
generated_schedule = {"days": []}

def get_missing_info():
    required = ["destination", "duration", "peopleCount"]
    return [key for key in required if not user_answers.get(key)]

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

    if user_message.lower() == "다음 단계":
        global generated_schedule
        generated_schedule = generate_schedule()  # 일정 생성

        # JSON 응답에 메시지와 하이퍼링크를 포함
        return jsonify({
            "message": (
                "네, 일정 편집 단계로 넘어가겠습니다.\n"
                "아래 링크를 클릭하여 일정 편집 페이지로 이동하세요:\n"
                "<a href='/edit' style='color: blue; text-decoration: underline;'>일정 편집으로 이동하기</a>"
            )
        })

    try:
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
                        '  "essentialActivity": "<필수 활동>"\n'
                        '}\n'
                        "모든 필드는 큰따옴표를 사용해야 하며, 정보가 없으면 '없음' 을 반환하세요."
                        "여행 기간은 반드시 일수, 즉 숫자 (정수)로 나타내야 합니다."
                        "여행 인원수 또한 사람 수, 즉 숫자 (정수)로 나타내야 합니다."
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
            if value != 'None' and value is not None and value != '없음':
                user_answers[key] = value

        missing_info = get_missing_info()

        if missing_info:
            next_question = f"{', '.join(missing_info)} 정보가 필요합니다. 알려주시겠어요?"
            return jsonify({"question": next_question})

        collected_info = (
            f"여행지: {user_answers.get('destination', '알 수 없음')}\n"
            f"여행 기간: {user_answers.get('duration', '알 수 없음')} 일\n"
            f"여행 인원: {user_answers.get('peopleCount', '알 수 없음')} 명\n"
            f"여행 테마: {user_answers.get('theme', '없음')}\n"
            f"필수 활동: {user_answers.get('essentialActivity', '없음')}\n\n"
        )

        final_message = (
            f"{collected_info} 여행 계획의 틀이 모두 작성되었다면, 다음 단계로 넘어가겠습니다.\n"
            "혹시 더 추가하고 싶은 내용이 있다면 얼마든지 추가해주세요.\n"
            "원하는 여행을 구체적으로 설명해주시면 보다 정확한 일정을 추천해드립니다!\n\n"
            "(기초 정보가 충분하다면, 다음 단계로 넘어가기 위해 '다음 단계'라고 채팅을 보내주세요.)\n\n"
            "[여행 테마 예시]\n"
            "- 관광지 위주\n"
            "- 맛집 탐방\n"
            "- SNS 및 사진 촬영\n"
            "- 휴식과 호캉스\n\n"
            "[필수 활동 예시]\n"
            "- 유니버셜 스튜디오 재팬 방문하기\n"
            "- 에펠탑 전망대에서 커피 마시기\n"
            "- 제주도 한라산 정상 등반하기\n"
        )

        return jsonify({"message": final_message})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "서버에서 오류가 발생했습니다."}), 500


# 일정 생성
import openai

def generate_schedule():
    try:
        user_destination = user_answers.get("destination", "알 수 없음")
        user_duration = user_answers.get("duration", 1)
        user_theme = user_answers.get("theme", "없음")
        user_essential_activity = user_answers.get("essentialActivity", "없음")

        prompt = (
            f"여행지: {user_destination}\n"
            f"여행 기간: {user_duration}일\n"
            f"여행 테마: {user_theme}\n"
            f"필수 활동: {user_essential_activity}\n\n"
            "위 정보를 바탕으로 하루에 2~3개의 일정 항목이 포함된 여행 일정을 생성해 주세요. "
            "각 일정 항목은 제목, 설명, 위치, 시작 시간, 종료 시간, 카테고리, 태그 정보를 포함해야 합니다. "
            "결과는 JSON 형식으로 반환해주세요. JSON 형식 예시는 다음과 같습니다:\n\n"
            "{\n"
            "  \"days\": [\n"
            "    {\n"
            "      \"day\": 1,\n"
            "      \"date\": \"2024-11-15\",\n"
            "      \"schedule_items\": [\n"
            "        {\n"
            "          \"title\": \"Activity 1\",\n"
            "          \"description\": \"설명\",\n"
            "          \"location\": \"위치\",\n"
            "          \"start_time\": \"09:00\",\n"
            "          \"end_time\": \"11:00\",\n"
            "          \"category\": \"관광\",\n"
            "          \"tag\": [\"photo\", \"landmark\"]\n"
            "        }\n"
            "      ]\n"
            "    }\n"
            "  ]\n"
            "}"
        )

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful travel planner."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )

        gpt_response = response['choices'][0]['message']['content'].strip()
        print("GPT 일정 생성 응답:", gpt_response)

        # JSON 형식으로 파싱하여 반환
        return json.loads(gpt_response)

    except Exception as e:
        print(f"일정 생성 중 오류 발생: {e}")
        return {"days": []}  # 오류 시 빈 일정 반환

@app.route('/edit')
def edit():
    return render_template('edit.html', schedule_data=generated_schedule)

@app.route('/save_schedule', methods=['POST'])
def save_schedule():
    data = request.json
    print(data)  # 저장된 데이터 확인 (DB나 파일 저장 가능)
    return jsonify({"status": "success"})


if __name__ == '__main__':
    app.run(debug=True)