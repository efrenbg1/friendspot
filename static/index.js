function playing() {
    let req = new XMLHttpRequest();
    var url = '/listening';
    req.open('GET', url, true);
    req.responseType = 'json';
    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            console.log(req.status, req.response)
            if (req.status == 200) {
                if (req.response) console.log("he")
                document.getElementById('grid').innerHTML = card.render(req.response);
            } else {
                console.log(req.status);
            }
        }
    }.bind(this);
    req.send();
}

playing();


var card = `<div class="card mx-2 my-1" style="width: 100%;">
    <div class="card-body">
        <div class="row d-flex justify-content-between">
            <div class="col-sm-2 justify-content-center my-2">
                <img src="{{album_img}}"
                    class="rounded mx-auto d-block" alt="{{album}}">
            </div>
            <div class="col-sm-8 mt-1">
                <div class="row ml-1">
                    <a class="h5 card-subtitle text-muted mt-2" href="{{user_url}}" target="_blank">
                        <img src="{{user_img}}" style="height: 1.5em;">
                        {{user}}
                    </a>
                </div>
                <div class="row ml-1">
                    <h5 class="card-title mb-3 mt-1">
                        {{state}}
                        {{name}}<small> - {{artist}}</small>
                    </h5>
                </div>
            </div>
            <div class="col-sm-2 mt-2 d-flex justify-content-center p-0">
                <button type="button" class="btn-play"
                    onclick="window.open('{{url}}', '_blank')">
                    <svg width="1em" height="1em" viewBox="0 0 16 16"
                        style="margin-left: 2px !important; margin-bottom: 6.5px !important;"
                        class="bi bi-play-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</div>`;

var user = `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-person-circle mb-1" fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path
        d="M13.468 12.37C12.758 11.226 11.195 10 8 10s-4.757 1.225-5.468 2.37A6.987 6.987 0 0 0 8 15a6.987 6.987 0 0 0 5.468-2.63z" />
    <path fill-rule="evenodd" d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z" />
</svg>`;

var playing = `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-headphones mb-1" fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" d="M8 3a5 5 0 0 0-5 5v4.5H2V8a6 6 0 1 1 12 0v4.5h-1V8a5 5 0 0 0-5-5z" />
    <path
        d="M11 10a1 1 0 0 1 1-1h2v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3zm-6 0a1 1 0 0 0-1-1H2v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-3z" />
</svg>`;

var pause = `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pause-fill mb-1" fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path
        d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
</svg>`;

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