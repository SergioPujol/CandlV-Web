document.getElementById('authenticate').onclick = authenticate

function authenticate() {
    const keyValue = document.getElementById('auth_key').value;
    const emailValue = document.getElementById('auth_email').value;

    if(!keyValue || !emailValue) showError('Insert credentials');
    else {
        verifyUser(keyValue, emailValue)
    }
}

async function verifyUser(key, email) {
    const result = await fetch('/api/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            key,
            email
        })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        console.log('Verified')
        localStorage.setItem('wstoken', result.id);
        location.href = 'trading.html'
    } else {
        showError(result.error)
    }
}