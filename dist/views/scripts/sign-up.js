"use strict";
window.onload = function () {
    const form = document.querySelector('form');
    form.onsubmit = function (event) {
        event.preventDefault();
        const uname = form.uname.value;
        const email = form.email.value;
        const password = form.psw.value;
        const pswRepeat = form["psw-repeat"].value;
        console.log(`uname=${uname}&email=${email}&password=${password}`);
        if (password !== pswRepeat) {
            alert('Passwords do not match');
            return;
        }
        fetch('/sign-up', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uname: uname,
                email: email,
                password: password
            })
        }).then(response => response.json())
            .then(data => {
            console.log('Server response:', data);
            if (data.message === 'Signup successful') {
                window.location.href = './dashboard.html';
            }
            else {
                alert(data.error || 'Sign up failed');
            }
        });
    };
};
