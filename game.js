'use strict';

/* global document, window, io */

let socket = io('http://localhost:8080/');


let id      = '';
let ready   = false;
let started = false;

let $toury  = document.querySelector('.toury');
let $koch   = document.querySelector('.koch');
let $lyrics = document.getElementById('lyricsShower');
let $speed  = document.getElementById('speed');
let $song   = document.getElementById('song');

socket.on('id', function (data) {
    id    = data.id;
    console.log('IM', id);
    ready = true;
});

socket.on('position', function (data) {
    if (id === 't') {
        $koch.style.left = data.x;
    } else {
        $toury.style.left = data.x;
    }
});

socket.on('end', function (data) {
    if (data.who === id) {
        ready = false;
        window.alert('Victoire');
        socket.disconnect();
    } else {
        ready = false;
        window.alert('Perdant');
        socket.disconnect();
    }
});

socket.on('countdown', function (data) {
    window.alert('Jeu commence dans 10 secondes, choisissez la chanson !');
});

socket.on('start', function () {
    started = true;
    window.alert('GO!');
});

// headStatus = -1 / 0 / 1 (left / center / right)
let headStatus = 0;
setInterval(function () {
    if (headStatus !== 1) {
        ++headStatus;
    } else {
        headStatus = -1;
    }

    if (headStatus === -1) {
        $toury.style.transform = 'rotate(-20deg)';
        $koch.style.transform  = 'rotate(-20deg)';
    } else if (headStatus === 0) {
        $toury.style.transform = 'rotate(0deg)';
        $koch.style.transform  = 'rotate(0deg)';
    } else {
        $toury.style.transform = 'rotate(20deg)';
        $koch.style.transform  = 'rotate(20deg)';
    }
}, 300);

let index      = 0;
let keyPressed = 0;
let song       = '';
document.addEventListener('keypress', function (e) {
    if (!ready || !started) {
        return;
    }

    let char         = String.fromCharCode(e.which).toLowerCase();
    let $letter      = document.getElementById('letter');
    let actualLetter = $letter.textContent.toLowerCase();

    if (char === actualLetter) {
        ++index;
        ++keyPressed;
        $lyrics.innerHTML = song.setLetterAt(index);
    }

    updatePosition();
});

function updatePosition () {
    $speed.textContent = keyPressed;
    keyPressed = 0;

    let percent = index / song.length;
    let pos     = (window.innerWidth - 55) * percent;

    if (id === 't') {
        $toury.style.left = pos + 'px';
    } else {
        $koch.style.left = pos + 'px';
    }

    if (percent === 1) {
        socket.emit('victory');
    }

    socket.emit('position', { x: pos + 'px' });
}

$song.addEventListener('change', function () {
    this.disabled = true;
    song = window.songs[this.value];
    $lyrics.innerHTML = song.setLetterAt(0);
});

String.prototype.setLetterAt = function (index_) {
    var char  = this.charAt(index_);

    if (char === '<') {
        index += 5;
        return this.setLetterAt(index);
    }

    var value = this.substr(0, index_) + '$' + this.substr(index_ + 1);
    value     = value.replace(/\$/, '<span id="letter">' + char + '</span>');

    return value;
};

// Disable backspace
document.addEventListener('keydown', function (e) { e.preventDefault(); return false; });
