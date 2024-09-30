from flask import Flask, request, jsonify, render_template  # render_template 추가
import openai
import os
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv()

# 환경 변수에서 API 키 가져오기
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')  # index.html 렌더링

@app.route('/send_message', methods=['POST'])
def send_message():
    user_message = request.json.get('message')
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": user_message}]
    )
    bot_message = response['choices'][0]['message']['content']
    return jsonify({'response': bot_message})

if __name__ == '__main__':
    app.run(debug=True)
