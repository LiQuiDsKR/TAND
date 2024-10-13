from flask import Flask, request, jsonify, render_template
import os
import openai

app = Flask(__name__)

# GPT API 키 설정 (여기서는 환경변수나 설정 파일에서 API 키를 불러와야 함)
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/send_message', methods=['POST'])
def send_message():
    user_message = request.json.get('message')

    # GPT 모델에 사용자 메시지 분석 요청
    response = openai.Completion.create(
        model="gpt-4",
        prompt=f"사용자가 '{user_message}'라고 했을 때, 여행지(destination), 기간(duration), 인원 수(peopleCount), "
               f"테마(theme), 다음 활동(nextActivity)을 추출해 주세요.",
        max_tokens=150
    )

    gpt_response = response['choices'][0]['text'].strip()

    # GPT 응답을 분석해 필요한 정보를 추출
    result = {
        "duration": extract_info(gpt_response, 'duration'),
        "destination": extract_info(gpt_response, 'destination'),
        "theme": extract_info(gpt_response, 'theme'),
        "peopleCount": extract_info(gpt_response, 'peopleCount'),
        "nextActivity": extract_info(gpt_response, 'nextActivity')
    }

    return jsonify(result)

def extract_info(text, key):
    # GPT의 응답에서 원하는 키워드 정보를 추출하는 함수
    if key in text:
        return text.split(f"{key}:")[1].split('\n')[0].strip()
    return None

if __name__ == '__main__':
    app.run(debug=True)
