var config = {
    openSocket: function(config) {
        var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/';

        config.channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
        var sender = Math.round(Math.random() * 999999999) + 999999999;

        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: config.channel,
            sender: sender
        });

        var socket = io.connect(SIGNALING_SERVER + config.channel);
        socket.channel = config.channel;
        socket.on('connect', function() {
            if (config.callback) config.callback(socket);
        });

        socket.send = function(message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };

        socket.on('message', config.onmessage);
    },
    onRemoteStream: function(media) {
        var video = media.video;
        if(participants.length==0)
        {     
         hostYa=true;
         video.width=500;
         participants.insertBefore(video, participants.firstChild);
        }
        else
        {
            video.width=200;
        }
        video.setAttribute('controls', true);
        video.controls=true;
        participants.insertBefore(video, participants.firstChild);

        video.play();
    },
    onRoomFound: function(room) {
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;

        if (typeof roomsList === 'undefined') roomsList = document.body;

        var tr = document.createElement('tr');
        tr.setAttribute('id', room.broadcaster);
        tr.innerHTML = '<td>' + room.roomName + '</td>' +
            '<td><button class="join" id="' + room.roomToken + '">Entra en la reunion</button></td>';
        roomsList.insertBefore(tr, roomsList.firstChild);
        tr.onclick = function() {
            tr = this;
            captureUserMedia(function() {
                broadcastUI.joinRoom({
                    roomToken: tr.querySelector('.join').id,
                    joinUser: tr.id
                });
            });
            hideUnnecessaryStuff();
        };
    }
};

function createButtonClickHandler() {
    captureUserMedia(function() {
        broadcastUI.createRoom({
            roomName: (document.getElementById('conference-name') || { }).value || 'Anonymous'
        });
    });
    hideUnnecessaryStuff();
}

function captureUserMedia(callback) {
    var video = document.createElement('video');
    var boton=document.createElement('button');
    video.setAttribute('autoplay', true);
    video.autoplay=true;
    video.setAttribute('controls', true);
    video.controls=true; 
    video.muted=true;
    participants.insertBefore(video, participants.firstChild);

    getUserMedia({
        video: video,
        onsuccess: function(stream) {
            config.attachStream = stream;
            callback && callback();
            //silenciar micros
            //stream.getAudioTracks()[0].enabled=false;

            video.muted=true;
        },
        onerror: function() {
            alert('No se puede acceder a tu camara.');
            callback && callback();
        }
    });
}

var broadcastUI = broadcast(config);
var hostYa=false;
var participants = document.getElementById("participants") || document.body;

var startConferencing = document.getElementById('start-conferencing');
var roomsList = document.getElementById('rooms-list');

if (startConferencing) startConferencing.onclick = createButtonClickHandler;

function hideUnnecessaryStuff() {
    var visibleElements = document.getElementsByClassName('visible'),
        length = visibleElements.length;
    for (var i = 0; i < length; i++) {
        visibleElements[i].style.display = 'none';
    }
}

(function() {
    var uniqueToken = document.getElementById('unique-token');
    if (uniqueToken)
        console.log(uniqueToken);
        if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Comparte este link '+location.href.toString()+'</a></h2>';
        else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
})();
