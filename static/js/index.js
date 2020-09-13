function listening() {
    req('/listening', function (status, response) {
        if (status == 200) {
            var html = "";
            response.forEach((r) => {
                if (r.is_playing == undefined) {
                    html += card_no_data.render(r);
                } else {
                    r.state_img = r.is_playing ? playing : pause;
                    r.state = r.is_playing ? 'Listening right now' : 'On pause';
                    html += card.render(r);
                }
            });
            document.getElementById('grid').innerHTML = html + card_me.render({
                id: id,
                username: username,
                url: url,
                img: img
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            console.log(status);
        }
    });
}

function history(id) {
    req('/history?id=' + id, function (status, response) {
        if (status == 200) {
            var html = "";
            response.title = "'s last 5 played tracks"
            response.history.forEach((r) => {
                html += song_entry.render(r);
            });
            document.getElementById('modal_list').innerHTML = html;
            document.getElementById('modal_title').innerHTML = modal_title.render(response);
            $('#modal').modal({ show: true });
        } else {
            console.log(status);
        }
    });
}

function songs(id) {
    req("/songs?id=" + id, function (status, response) {
        if (status == 200) {
            var html = "";
            response.title = "'s last 5 favorite tracks";
            response.songs.forEach((r) => {
                html += song_entry.render(r);
            });
            document.getElementById('modal_list').innerHTML = html;
            document.getElementById('modal_title').innerHTML = modal_title.render(response);
            $('#modal').modal({ show: true });
        } else {
            console.log(status);
        }
    });
}

function friend() {
    var username = document.getElementById('username').value;
    var id = document.getElementById('id').value;
    if (!username.length || !id.length) return;
    var url = "/friend";
    url += "?username=" + encodeURIComponent(username);
    url += "&id=" + id;
    req(url, function (status, response) {
        if (status == 200) {
            if (response.done) {
                alert('Friend added!');
                listening();
            } else {
                alert("Could not find the user! Make sure your friend has and account and that the username is correct.");
            }
        } else {
            alert("Something went wrong (" + status + ")!");
        }

    });
}

function logout() {
    setCookie('id', '', 0);
    setCookie('username', '', 0);
    setCookie('url', '', 0);
    setCookie('img', '', 0);
    setCookie('session', '', 0);
    document.getElementById('grid').innerHTML = login;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function unfriend(id) {
    if (!confirm("Are you sure you want to unfriend?")) return;
    req("/unfriend?id=" + id, function (status, response) {
        if (status == 200) {
            if (response.done) {
                alert('Friend removed!');
                listening();
            } else {
                alert("Could not find the user!");
            }
        } else {
            alert("Something went wrong (" + status + ")!");
        }

    });
}




String.prototype.render = function (args) {
    var reg = "";
    Object.keys(args).forEach(n => {
        reg += (reg != "" ? "|" : "") + "{{" + n + "}}";
    });
    var re = new RegExp(reg, "gi");
    return this.replace(re, function (match) {
        var str = args[match.substring(2, match.length - 2)];
        return str != null ? str : "";
    });
};

function req(url, callback) {
    let req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.responseType = 'json';
    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            if (req.status == 401) {
                logout();
            } else {
                callback(req.status, req.response);
            }
        }
    }.bind(this);
    req.send();
}

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2)
        return parts
            .pop()
            .split(";")
            .shift();
}

function setCookie(name, data, minutes) {
    if (minutes === 0) {
        document.cookie = name + "=" + data + ";";
    } else {
        var d = new Date();
        d.setTime(d.getTime() + minutes * 60 * 1000);
        /////// Include ¡¡¡¡¡ secure; !!!!!! //////////
        document.cookie =
            name + "=" + data + "; expires=" + d.toUTCString() + ";path=/";
    }
}

var card = `<div class="card mx-2 my-1" style="width: 100%;">
    <div class="card-body">
        <div class="row d-flex justify-content-between">
            <div class="col-sm-2 justify-content-center d-flex align-items-center">
                <img src="{{album_img}}" class="rounded mx-auto d-block" title="{{album}}">
            </div>
            <div class="col-sm-8 mt-1">
                <div class="row mx-1">
                    <a class="h5 card-subtitle text-muted mt-2" href="{{user_url}}" target="_blank">
                        <img src="{{user_img}}" style="height: 1.2em;">
                        {{user}}
                    </a>
                </div>
                <div class="row mx-1">
                    <h5 class="card-title mb-3 mt-1" title="{{state}}">
                        {{state_img}}
                        {{name}}<small> - {{artist}}</small>
                    </h5>
                </div>
            </div>
            <div class="col-sm-2 justify-content-center d-flex align-items-center">
                <button type="button" class="btn-play" onclick="window.open('{{url}}', '_blank')">
                    <svg width="1em" height="1em" viewBox="0 0 16 16"
                        style="margin-left: 2px !important; margin-bottom: 6.5px !important;" class="bi bi-play-fill"
                        fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                    </svg>
                </button>
            </div>
        </div>
        <div class="row d-flex justify-content-around mt-4">
            <a class="h6" href="javascript:history({{id}})">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-music-note-list mb-1" fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z" />
                    <path fill-rule="evenodd" d="M12 3v10h-1V3h1z" />
                    <path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z" />
                    <path fill-rule="evenodd"
                        d="M0 11.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 7H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 3H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5z" />
                </svg>
                History
            </a>
            <a class="h6" href="javascript:songs({{id}})">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-music-note-beamed mb-1"
                    fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z" />
                    <path fill-rule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z" />
                    <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z" />
                </svg>
                Tracks
            </a>
            <a class="text-danger h6" href="javascript:unfriend({{id}})">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-trash-fill mb-1" fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                        d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z" />
                </svg>
                Remove
            </a>
        </div>
    </div>
</div>`;
var card_me = `<div class="card mx-2 my-1" style="width: 100%;">
    <div class="card-body">
        <div class="separator text-muted mt-2 mb-4">
            <span class="mb-1">Add new friend:</span>
        </div>
        <div class="input-group mt-1">
            <input class="form-control w-85" type="text" placeholder="Username" id="username">
            <div class="input-group-prepend input-group-append">
                <div class="input-group-text">#</div>
            </div>
            <input class="form-control col-3" placeholder="Number" type="number" id="id"></input>
            <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button" onclick="friend()">
                    <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-person-plus-fill" fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                            d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.5-3a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z" />
                    </svg>
                </button>
            </div>
        </div>
        <div class="separator text-muted mt-5 mb-4">
            <span class="mb-1">My account:</span>
        </div>
        <div class="row d-flex justify-content-center">
            <img src="{{img}}" class="rounded d-block mr-2" height="66">
            <a class="h5 card-subtitle my-3" href="{{url}}" target="_blank">
                {{username}}<span class="text-muted">#{{id}}</span>
            </a>
        </div>
        <div class="row d-flex justify-content-around mt-4">
            <a class="h6" href="javascript:logout()">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-door-open-fill mb-1" fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                        d="M1.5 15a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1H13V2.5A1.5 1.5 0 0 0 11.5 1H11V.5a.5.5 0 0 0-.57-.495l-7 1A.5.5 0 0 0 3 1.5V15H1.5zM11 2v13h1V2.5a.5.5 0 0 0-.5-.5H11zm-2.5 8c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1z" />
                </svg>
                Logout<br>this device
            </a>
            <a class="h6 text-dark" href="javascript:">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-globe mb-1" fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                        d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4H2.255a7.025 7.025 0 0 1 3.072-2.472 6.7 6.7 0 0 0-.597.933c-.247.464-.462.98-.64 1.539zm-.582 3.5h-2.49c.062-.89.291-1.733.656-2.5H3.82a13.652 13.652 0 0 0-.312 2.5zM4.847 5H7.5v2.5H4.51A12.5 12.5 0 0 1 4.846 5zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5H7.5V11H4.847a12.5 12.5 0 0 1-.338-2.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12H7.5v2.923c-.67-.204-1.335-.82-1.887-1.855A7.97 7.97 0 0 1 5.145 12zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11H1.674a6.958 6.958 0 0 1-.656-2.5h2.49c.03.877.138 1.718.312 2.5zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12h2.355a7.967 7.967 0 0 1-.468 1.068c-.552 1.035-1.218 1.65-1.887 1.855V12zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5h-2.49A13.65 13.65 0 0 0 12.18 5h2.146c.365.767.594 1.61.656 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4H8.5V1.077c.67.204 1.335.82 1.887 1.855.173.324.33.682.468 1.068z" />
                </svg>
                Logout<br>everywhere
            </a>
            <a class="text-danger h6" href="javascript:">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-trash-fill mb-1" fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                        d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z" />
                </svg>
                Delete<br>this account
            </a>
        </div>
    </div>
</div>
</div>`;
var card_no_data = `<div class="card mx-2 my-1" style="width: 100%;">
    <div class="card-body">
        <div class="row d-flex justify-content-center">
            <img src="{{user_img}}" class="rounded d-block mr-2" height="66">
            <a class="h5 card-subtitle my-3" href="{{user_url}}" target="_blank">
                {{user}}
            </a>
        </div>
        <div class="row d-flex justify-content-around mt-4">
            <a class="h6" href="javascript:history({{id}})">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-music-note-list mb-1" fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z" />
                    <path fill-rule="evenodd" d="M12 3v10h-1V3h1z" />
                    <path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z" />
                    <path fill-rule="evenodd"
                        d="M0 11.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 7H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 3H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5z" />
                </svg>
                History
            </a>
            <a class="h6" href="javascript:songs({{id}})">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-music-note-beamed mb-1"
                    fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z" />
                    <path fill-rule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z" />
                    <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z" />
                </svg>
                Tracks
            </a>
            <a class="text-danger h6" href="javascript:unfriend({{id}})">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-trash-fill mb-1" fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                        d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z" />
                </svg>
                Remove
            </a>
        </div>
    </div>
</div>
</div>`;
var login = `<div class="col-sm">
    <div class="jumbotron my-4">
        <h1 class="display-4"><span class="logotron">🎧</span> Friends' spot</h1>
        <p class="lead">~ See what your friends are listening to. Anywhere, anytime ~</p>
        <div class="text-center mt-5">
            <p class="mb-2">Log in with:</p>
            <button type="button" class="btn btn-light" onclick="location.href = '/register'">
                <img src="img/spotify.svg" height="40" class="mb-1">
            </button>
        </div>
        <hr class="mb-4 mt-5">
        <h5>🤔 Why:</h5>
        <p>
            Spotify on 📱 does not support friends list. This app just fixes it but also adds many things 🥳!
        </p>
        <br>
        <h5>🕵️ Security:</h5>
        <p>
            &rarr; Somewhere in the middle of the 🌍 this app stores only your <b>username</b>.
        </p>
        <p>
            &rarr; You have the right to completely 🗑 all your data. Just click on the <a href="javascript:"
                class="text-danger">Delete this account</a>
        </p>
        <p>
            &rarr; Your profile is 🔐 as it requires your username + code to follow you. (Spotify is way less private
            🤔)
        </p>
        <br>
        <h5>📄 Source:</h5>
        <p>All the source code can be found under my <a href="https://github.com/efrenbg1/friendspot">GitHub
                repository</a>:</p>
        <img src="img/socialcoding.jpg" class="rounded mx-auto d-block mb-3" height="150"
            onclick="window.open('https://github.com/efrenbg1/friendspot', '_blank')">
        <br>
        <h5>☠️ Licence:</h5>
        <p>
            Copyright © 2020 Efrén Boyarizo <a href="mailto:efren@boyarizo.es" target="_blank">efren@boyarizo.es</a>
            <br>
            This work is free. You can redistribute it and/or modify it under the terms of the Do
            What The Fuck You Want To Public License, Version 2, as published by Sam Hocevar. See
            <a href="http://www.wtfpl.net/" target="_blank">http://www.wtfpl.net/</a> for more
            details.
        </p>
    </div>
</div>`;
var modal_title = `<h5 class="modal-title"><a class="text-muted" href="{{url}}" target="_blank">
        <img src="{{img}}" style="height: 1.2em;">
        {{name}}<small>{{title}}</small>
    </a></h5>
<button type="button" class="close" data-dismiss="modal" aria-label="Close">
    <span aria-hidden="true">&times;</span>
</button>`;
var pause = `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pause-fill mb-1" fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path
        d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
</svg>`;
var playing = `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-headphones mb-1" fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" d="M8 3a5 5 0 0 0-5 5v4.5H2V8a6 6 0 1 1 12 0v4.5h-1V8a5 5 0 0 0-5-5z" />
    <path
        d="M11 10a1 1 0 0 1 1-1h2v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3zm-6 0a1 1 0 0 0-1-1H2v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-3z" />
</svg>`;
var song_entry = `<li class="list-group-item d-flex justify-content-between align-items-center">
    <h5 class="mb-0">
        <img src="{{album_img}}" class="rounded mr-3" title="{{album}}" height="40">{{name}}<small> - {{artist}}</small>
    </h5>
    <button type="button" class="btn-play-sm" onclick="window.open('{{url}}', '_blank')">
        <svg width="1em" height="1em" viewBox="0 0 16 16"
            style="margin-left: 2.5px !important; margin-bottom: 4.5px !important;" class="bi bi-play-fill"
            fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z">
            </path>
        </svg>
    </button>
</li>`;


var id = getCookie('id');
var username = getCookie('username');
var url = getCookie('url');
var img = getCookie('img');
var session = getCookie('session');
if (id && username && url && img && session) {
    listening();
} else {
    if ((new URL(location.href)).searchParams.get("error") != null) alert("Could not login with Spotify! Please try again")
    logout();
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function () {
            console.log("Service Worker Registered");
        });
}