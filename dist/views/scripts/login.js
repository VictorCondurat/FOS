"use strict";
window.onload = function () {
    const form = document.querySelector('form');
    form.onsubmit = function (event) {
        event.preventDefault();
        const uname = form.uname.value;
        const pass = form.pass.value;
        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `uname=${uname}&pass=${pass}`
        }).then(response => {
            if (response.ok) {
                window.location.href = '/index.html';
            }
            else {
                alert('Login failed');
            }
        });
    };
};
