from flask import Flask, request, redirect, send_from_directory, make_response
import ddbb
import spotify
import requests
import json
import time
import datetime
import urllib
import os
from base64 import b64encode

# TODO fix buttons and add titles

app = Flask(__name__)

settings = "/etc/friendspot/settings.json"
if not os.path.isfile(settings):
    settings = "settings.json"

with open(settings) as f:
    settings = json.loads(f.read())
    app.client_id = settings.get('client_id')
    app.auth = app.client_id + ":" + settings.get('client_secret')
    app.auth = b64encode(app.auth.encode('utf-8')).decode('utf-8')
    app.redirect_uri = settings.get('redirect_uri')


@app.route('/')
def home():
    return send_from_directory('static/', 'index.html')


@app.route('/register')
def register():
    url = "https://accounts.spotify.com/authorize"
    url += "?client_id=" + app.client_id
    url += "&response_type=code"
    url += "&redirect_uri=" + urllib.parse.quote(app.redirect_uri, safe='')
    url += "&scope=user-read-recently-played%20user-read-currently-playing%20user-library-read"
    return redirect(url)


@app.route('/callback')
def callback():
    code = request.args.get('code')
    user = spotify.register_user(code)
    if user:
        response = make_response(redirect('/'))
        expires = datetime.datetime.now() + datetime.timedelta(days=15)
        response.set_cookie('id', str(user[0]), expires=expires)
        response.set_cookie('username', user[1], expires=expires)
        response.set_cookie('url', user[2], expires=expires)
        response.set_cookie('img', user[3], expires=expires)
        response.set_cookie('session', user[4], expires=expires)
        return response
    return redirect('/?error')


@app.route('/listening')
def listening():
    if not spotify.check_user():
        return "401 (Unauthorized)", 401

    user = request.cookies.get('id')

    return json.dumps(spotify.get_friends_listening(user))


@app.route('/history')
def history():
    if not spotify.check_user():
        return "401 (Unauthorized)", 401

    user = request.cookies.get('id')
    id = request.args.get('id')
    if id == None:
        return "400 (Bad Request)", 400
    if not id.isdigit():
        return "400 (Bad Request)", 400

    q = ddbb.query("SELECT * FROM friends WHERE user=? AND friend=?", user, id)

    if not len(q):
        return "400 (Bad Request)", 400

    return json.dumps(spotify.get_history(id))


@app.route('/songs')
def songs():
    if not spotify.check_user():
        return "401 (Unauthorized)", 401

    user = request.cookies.get('id')
    id = request.args.get('id')
    if id == None:
        return "400 (Bad Request)", 400
    if not id.isdigit():
        return "400 (Bad Request)", 400

    q = ddbb.query("SELECT * FROM friends WHERE user=? AND friend=?", user, id)

    if not len(q):
        return "400 (Bad Request)", 400

    return json.dumps(spotify.get_songs(id))


@app.route('/friend')
def friend():
    if not spotify.check_user():
        return "401 (Unauthorized)", 401

    user = request.cookies.get('id')
    username = request.args.get('username')
    id = request.args.get('id')

    if username == None or id == None:
        return "400 (Bad Request)", 400
    if len(username) > 50 or len(id) > 50 or not id.isdigit():
        return "400 (Bad Request)", 400

    return json.dumps({
        'done': spotify.add_friend(user, username, int(id))
    })


@app.route('/unfriend')
def unfriend():
    if not spotify.check_user():
        return "401 (Unauthorized)", 401

    user = request.cookies.get('id')
    id = request.args.get('id')
    if id == None:
        return "400 (Bad Request)", 400
    if not id.isdigit():
        return "400 (Bad Request)", 400

    ddbb.query("DELETE FROM friends WHERE user=? AND friend=?", user, id)

    return json.dumps({
        'done': True
    })


@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('static/', path)


@app.route('/index.html')
def redirectNoFile():
    return redirect('/')


@app.errorhandler(404)
def not_found(e):
    return redirect('/')


if __name__ == '__main__':
    app.run(port=80)
