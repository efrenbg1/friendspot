from flask import Flask, request, redirect, send_from_directory
import ddbb
import spotify
import requests
import json
import time

app = Flask(__name__)


@app.route('/')
def index():
    return '<a href="/register">Registrarse</a><br><a href="/home">Inicio</a>'


@app.route('/register')
def register():
    url = "https://accounts.spotify.com/authorize"
    url += "?client_id=9aeff168956d4c5e9b0cfa1c246d10dd"
    url += "&response_type=code"
    url += "&redirect_uri=http%3A%2F%2Flocalhost%2Fcallback"
    #url += "&state=code"
    url += "&scope=user-read-recently-played%20user-read-currently-playing%20user-read-email%20user-library-read"
    return redirect(url)


@app.route('/callback')
def callback():
    code = request.args.get('code')
    if spotify.register_user(code):
        return redirect('/home')
    return "Error"


@app.route('/home')
def home():
    return send_from_directory('static/', 'index.html')


@app.route('/listening')
def listening():
    return json.dumps(spotify.get_friends_listening(None))


@app.route('/history')
def history():
    return json.dumps(spotify.get_history(1))


@app.route('/songs')
def songs():
    return json.dumps(spotify.get_songs(1))


@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('static/', path)


@app.route('/index.html')
def redirectNoFile():
    return redirect('/')


if __name__ == '__main__':
    app.run(port=80)
