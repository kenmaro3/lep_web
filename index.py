from flask import Flask, render_template, jsonify
from flask import request, Response
from google.cloud import translate
import json
#import ssl

app = Flask(__name__)
#context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
#context.load_cert_chain('cert.crt', 'server_secret.key')

@app.route("/")
def home():
    return render_template("home.html")


@app.route("/english")
def english():
    return render_template("index.html")

# @app.route('/toPostURL', methods=['POST'])
# def get_user_info():
#     client = translate.Client(target_language='en')
#     sentence = request.form['input_text']
#     translated = client.translate(sentence)
#     translatedText = translated["translatedText"]
#
#     # resp = jsonify({"success":True, "result":translatedText})
#     # resp.status_code = 200
#     return jsonify(ResultSet=json.dumps(translated))

@app.route('/toPostURL', methods=['POST'])
def testfunc():
    text=request.json['text']
    client = translate.Client(target_language='en')
    translated = client.translate(text)
    translatedText = translated["translatedText"]
    return_data = {"result":translatedText}
    return jsonify(ResultSet=json.dumps(return_data))

# @app.route('/toPostURL', methods=['POST'])
# def get_user_info():
#     username =  request.form['username'];
#     age = request.form['age'];
#     response = Response()
#     response.status_code = 200
#     return response

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)

