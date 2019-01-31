from flask import Flask, render_template, jsonify
from flask import request, Response
from google.cloud import translate
import json
import os
#import ssl
from flask import Flask, render_template, Response
from flask import request, abort

from linebot import (
    LineBotApi, WebhookHandler
)
from linebot.exceptions import (
    InvalidSignatureError
)
from linebot.models import (
    MessageEvent, TextMessage, TextSendMessage,
)

app = Flask(__name__)
#context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
#context.load_cert_chain('cert.crt', 'server_secret.key')
line_bot_api = LineBotApi(os.getenv("CHANNEL_ACCESS_TOKEN"))
handler = WebhookHandler(os.getenv("CHANNEL_SECRET"))

@app.route("/")
def home():
    return render_template("home.html")


@app.route("/english")
def english():
    return render_template("index.html")

@app.route("/line_notice_english", methods=['POST'])
def line_notice_english():
    to = os.getenv("MY_USER_ID")
    line_bot_api.push_message(to, TextSendMessage(text="one learner came in English room!! Please help him/her through https://www.leplat4m.com/english"))
    response = Response()
    response.status_code=200
    return response

@app.route('/toPostURL', methods=['POST'])
def testfunc():
    text=request.json['text']
    client = translate.Client(target_language='en')
    translated = client.translate(text)
    translatedText = translated["translatedText"]
    return_data = {"result":translatedText}
    return jsonify(ResultSet=json.dumps(return_data))

@app.route('/how-to-use', methods=['GET'])
def how_to_use():
    return render_template("how-to-use.html")


@app.route('/group')
def group():
    return render_template("test_group.html")

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)

