from flask import request
from app import app
import ddbb
import requests
import json
import time
import string
import random


def register_user(code):
    if code == None:
        return False

    r = requests.post("https://accounts.spotify.com/api/token", data={
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": app.redirect_uri
    }, headers={
        "Authorization": "Basic " + app.auth
    })

    if r.status_code != 200:
        return False

    obj = json.loads(r.text)
    access = obj.get('access_token')
    refresh = obj.get('refresh_token')

    r = requests.get('https://api.spotify.com/v1/me', headers={
        "Authorization": "Bearer " + access
    })

    if r.status_code != 200:
        return False

    obj = json.loads(r.text)

    name = obj.get('display_name')
    username = obj.get('id')
    url = obj['external_urls'].get('spotify')
    img = obj['images']
    if len(img):
        img = img[0].get('url')
    else:
        img = '/img/user.png'

    q = ddbb.queryone(
        "SELECT id, username, url, img, session FROM user WHERE username=?", username)

    if q:
        ddbb.query("UPDATE user SET username=?, name=?, url=?, img=?, access=?, refresh=?, valid=? WHERE id=?",
                   username, name, url, img, access, refresh, time.time(), q[0])
        return q
    else:
        alnum = string.ascii_letters + string.digits
        session = ''.join((random.choice(alnum) for i in range(64)))

        id = ddbb.insert("INSERT INTO user (username, name, url, img, session, access, refresh, valid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                         username, name, url, img, session, access, refresh, time.time())
        return [id, username, url, img, session]


def get_friends(user):
    q = ddbb.query(
        "SELECT id, name, url, img, access, refresh, valid FROM user WHERE id IN (SELECT friend FROM friends WHERE user=?)", user)

    if not len(q):
        return []

    friends = []
    for friend in q:
        token = friend[4]
        if (time.time() - friend[6]) > 3500 and friend[5] != None:
            url = "https://accounts.spotify.com/api/token"
            r = requests.post(url, data={
                "grant_type": "refresh_token",
                "refresh_token": friend[5],
            }, headers={
                "Authorization": "Basic " + app.auth
            })

            if r.status_code == 200:
                token = json.loads(r.text).get('access_token')
                ddbb.query(
                    "UPDATE user SET access=?, valid=? WHERE id=?", token, time.time(), friend[0])
            else:
                continue
        friends.append({
            'id': friend[0],
            'name': friend[1],
            'url': friend[2],
            'img': friend[3],
            'token': token
        })
    return friends


def get_friends_listening(user):
    r = []

    for friend in get_friends(user):
        playing = requests.get("https://api.spotify.com/v1/me/player/currently-playing", headers={
            'Authorization': "Bearer " + friend['token']
        })

        if playing.status_code == 204:
            r.append({
                'id': friend['id'],
                "user": friend['name'],
                "user_url": friend['url'],
                "user_img": friend['img']
            })
            continue

        if playing.status_code != 200:
            continue

        playing = json.loads(playing.text)

        r.append({
            'timestamp': playing.get("timestamp"),
            'progress_ms': playing.get("progress_ms"),
            'is_playing': playing.get("is_playing"),
            'name': playing["item"].get("name"),
            'artist': playing["item"]["artists"][0].get("name"),
            'url': playing["item"]["external_urls"].get("spotify"),
            'album': playing["item"]["album"].get("name"),
            'album_img': playing["item"]["album"]["images"][2].get("url"),
            'id': friend['id'],
            "user": friend['name'],
            "user_url": friend['url'],
            "user_img": friend['img']
        })
    return r


def get_history(user):
    q = ddbb.queryone(
        "SELECT name, url, img, access, refresh, valid FROM user WHERE id=?", user)

    if not len(q):
        return None

    token = q[3]
    if (time.time() - q[5]) > 3500 and q[4] != None:
        r = requests.post("https://accounts.spotify.com/api/token", data={
            "grant_type": "refresh_token",
            "refresh_token": q[4],
        }, headers={
            "Authorization": "Basic " + app.auth
        })

        if r.status_code == 200:
            token = json.loads(r.text).get('access_token')
            ddbb.query(
                "UPDATE user SET access=?, valid= WHERE id=?", token, user)
        else:
            return None

    history = requests.get("https://api.spotify.com/v1/me/player/recently-played?limit=5", headers={
        'Authorization': "Bearer " + token
    })

    if history.status_code != 200:
        return None

    history = json.loads(history.text)

    r = {
        'name': q[0],
        'url': q[1],
        'img': q[2],
        'history': []
    }
    for song in history.get('items'):
        r['history'].append({
            'name': song["track"].get("name"),
            'artist': song["track"]["artists"][0].get("name"),
            'url': song["track"]["external_urls"].get("spotify"),
            'album': song["track"]["album"].get("name"),
            'album_img': song["track"]["album"]["images"][2].get("url"),
        })
    return r


def get_songs(user):
    q = ddbb.queryone(
        "SELECT name, url, img, access, refresh, valid FROM user WHERE id=?", user)

    if not len(q):
        return None

    token = q[3]
    if (time.time() - q[5]) > 3500 and q[4] != None:
        r = requests.post("https://accounts.spotify.com/api/token", data={
            "grant_type": "refresh_token",
            "refresh_token": q[4],
        }, headers={
            "Authorization": "Basic " + app.auth
        })

        if r.status_code == 200:
            token = json.loads(r.text).get('access_token')
            ddbb.query(
                "UPDATE user SET access=?, valid=? WHERE id=?", token, time.time(), user)
        else:
            return None

    history = requests.get("https://api.spotify.com/v1/me/tracks?limit=5", headers={
        'Authorization': "Bearer " + token
    })

    if history.status_code != 200:
        return None

    history = json.loads(history.text)

    r = {
        'name': q[0],
        'url': q[1],
        'img': q[2],
        'songs': []
    }
    for song in history.get('items'):
        r['songs'].append({
            'name': song["track"].get("name"),
            'artist': song["track"]["artists"][0].get("name"),
            'url': song["track"]["external_urls"].get("spotify"),
            'album': song["track"]["album"].get("name"),
            'album_img': song["track"]["album"]["images"][2].get("url"),
        })
    return r


def add_friend(user, username, id):
    friends = ddbb.query("SELECT friend FROM friends WHERE user=?", user)
    for friend in friends:
        if friend[0] == id:
            return True
    if len(friends) > 4:
        return False
    q = ddbb.queryone(
        "SELECT id FROM user WHERE username=? AND id=?", username, id)
    if q == None or q[0] != id:
        return False
    ddbb.insert("INSERT INTO friends (user, friend) VALUES (?, ?)", user, id)
    return True


def check_user():
    id = request.cookies.get('id')
    name = request.cookies.get('username')
    session = request.cookies.get('session')
    if not isinstance(id, str) or not isinstance(name, str) or not isinstance(session, str):
        return False
    if len(id) > 10 or len(name) > 50 or len(session) > 150:
        return False
    q = ddbb.queryone(
        "SELECT id FROM user WHERE id=? AND name=? AND session=?", id, name, session)
    if q != None and str(q[0]) == id:
        return True
    return False
