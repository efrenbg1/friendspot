import ddbb
import requests
import json
import time


def register_user(code):
    if code == None:
        return False

    r = requests.post("https://accounts.spotify.com/api/token", data={
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": "http://localhost/callback"
    }, headers={
        "Authorization": "Basic OWFlZmYxNjg5NTZkNGM1ZTliMGNmYTFjMjQ2ZDEwZGQ6NWNhNTU2MTY3ZjYzNGMxZWI5NzM1Njk1MTc0MGMzOTk="
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
    email = obj.get('email')
    url = obj['external_urls'].get('spotify')
    img = obj['images']
    if len(img):
        img = img[0].get('url')
    else:
        img = None

    ddbb.query("UPDATE user SET email=%s, name=%s, url=%s, img=%s, access=%s, refresh=%s, valid=NOW() WHERE id=1",
               email, name, url, img, access, refresh)
    return True


def get_token(user):
    q = ddbb.queryone("SELECT access, refresh, valid FROM user WHERE id=1")

    if q[2] == None:
        return None

    if (time.time() - q[2].timestamp()) > 3500 and q[1] != None:
        url = "https://accounts.spotify.com/api/token"
        r = requests.post(url, data={
            "grant_type": "refresh_token",
            "refresh_token": q[1],
        }, headers={
            "Authorization": "Basic OWFlZmYxNjg5NTZkNGM1ZTliMGNmYTFjMjQ2ZDEwZGQ6NWNhNTU2MTY3ZjYzNGMxZWI5NzM1Njk1MTc0MGMzOTk="
        })

        if r.status_code == 200:
            token = json.loads(r.text).get('access_token')
            ddbb.query(
                "UPDATE user SET access=%s, valid=NOW() WHERE id=1", token)
            return token
        return None

    return q[0]


def get_playing(user):
    token = get_token(user)
    print(token)
    if token == None:
        return None

    r = requests.get("https://api.spotify.com/v1/me/player/currently-playing", headers={
        'Authorization': "Bearer " + token
    })

    if r.status_code != 200:
        return None

    obj = json.loads(r.text)

    obj = {
        'timestamp': obj.get("timestamp"),
        'progress_ms': obj.get("progress_ms"),
        'is_playing': obj.get("is_playing"),
        'name': obj["item"].get("name"),
        'artist': obj["item"]["artists"][0].get("name"),
        'url': obj["item"]["external_urls"].get("spotify"),
        'album': obj["item"]["album"].get("name"),
        'album_img': obj["item"]["album"]["images"][2].get("url"),
        "user": "efrenbg1",
        "user_img": "https://i.scdn.co/image/ab6775700000ee856a1dfd7523ae4a01de83597a",
        "user_url": "https://open.spotify.com/user/efrenbg1"
    }
    return obj
    # "currently_playing_type": "track",
