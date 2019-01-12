import os
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
#import ssl

app = Flask(__name__)
line_bot_api = LineBotApi(os.getenv("CHANNEL_ACCESS_TOKEN"))
handler = WebhookHandler(os.getenv("CHANNEL_SECRET"))
#context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
#context.load_cert_chain('cert.crt', 'server_secret.key')

@app.route("/")
def home():
    return render_template("home.html")


@app.route("/english")
def english():
    return render_template("index.html")

@app.route("/linetest")
def linetest():
    to = os.getenv("MY_USER_ID")
    line_bot_api.push_message(to, TextSendMessage(text="hey, this is awesome!!"))
#    return "seems good huh"

@app.route("/line_notice_english", methods=['POST'])
def line_notice_english():
    to = os.getenv("MY_USER_ID")
    line_bot_api.push_message(to, TextSendMessage(text="one learner came in English room!! You can also join from https://www.leplat4m.com/english"))
    response = Response()
    response.status_code=200
    return response

@app.route("/callback", methods=['POST'])
def callback():
    # get X-Line-Signature header value
    signature = request.headers['X-Line-Signature']

    # get request body as text
    body = request.get_data(as_text=True)
    app.logger.info("Request body: " + body)

    # handle webhook body
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        abort(400)

    return 'OK'


@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    line_bot_api.reply_message(
        event.reply_token,
        TextSendMessage(text=event.message.text))



if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)







