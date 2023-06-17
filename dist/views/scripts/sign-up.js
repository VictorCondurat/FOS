"use strict";
window.onload = function () {
    const form = document.querySelector('form');
    form.onsubmit = function (event) {
        event.preventDefault();
        const uname = form.uname.value;
        const email = form.email.value;
        const psw = form.psw.value;
        const pswRepeat = form["psw-repeat"].value;
        if (psw !== pswRepeat) {
            alert('Passwords do not match');
            return;
        }
        fetch('/sign-up', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `uname=${uname}&email=${email}&psw=${psw}`
        }).then(response => {
            if (response.ok) {
                window.location.href = '/index.html';
            }
            else {
                alert('Sign up failed');
            }
        });
    };
};
