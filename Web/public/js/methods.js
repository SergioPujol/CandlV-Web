var username_gbl = '';

var strategies = {
    '2EMA': {
        ema_short_period: 3, // default value
        ema_long_period: 6 // default value
    },
    'MACD': {
        ema_short_period: 12, // default value
        ema_long_period: 26, // default value
        signal_period: 9 // default value
    },
    'Bollinger': {
        period: 20, // default value
        times: 2, // default value
    }
};
var nonCustomStrategies = strategies;

async function checkToken() {
    const result = await fetch('/api/checktoken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: localStorage.getItem('token')
        })
    }).then((res) => res.json())

    return result;
}

function toggleContainer(bool) {
    if(bool) { // logged-user block / non-logged-user hide
        document.getElementById('non-logged-user').classList.add("login-container-hide");
        document.getElementById('logged-user').classList.remove("login-container-hide");
        document.getElementById('logout').onclick = logout
    } else {
        document.getElementById('non-logged-user').classList.remove("login-container-hide");
        document.getElementById('logged-user').classList.add("login-container-hide");
    }
}

async function checkLoginStatus() {
    if(!localStorage.getItem('token')) {
        toggleContainer(false)
        return false
    } 
    const tokenRes = await checkToken();
    console.log(tokenRes)
    if(tokenRes.status == 'ok') {
        document.getElementById('usernameButton').textContent = tokenRes.data
        username_gbl = tokenRes.data
        console.log(username_gbl)
        toggleContainer(true)
        return true
    } else {
        toggleContainer(false)
        return false
    }
}

function logout() {
    localStorage.removeItem('token');
    location.href = 'home.html'
}

const form_settings = document.getElementById('form_settings')
form_settings.addEventListener('submit', registerKeys)
async function registerKeys() {
    event.preventDefault()
    const pb_bkey = document.getElementById('pb_bkey').value
    const pv_bkey = document.getElementById('pv_bkey').value
    const testnet = document.getElementById('testnetCheckbox').checked

    const result = await fetch('/api/registerKeys', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pb_bkey,
            pv_bkey,
            testnet,
            userId: localStorage.getItem('wstoken')
        })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        showSuccess('Saved keys');
    } else {
        showError(result.error)
    }
}

/** REGISTER FORM */
//const form_reg = document.getElementById('form_reg')
//form_reg.addEventListener('submit', registerUser)

async function registerUser(event) {
    event.preventDefault()
    const username = document.getElementById('username_reg').value
    const password = document.getElementById('password_reg').value

    const result = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        showSuccess('Registered')
    } else {
        showError(result.error)
    }
}

/** LOGIN FORM */
//const form_log = document.getElementById('form_login')
//form_log.addEventListener('submit', login)

async function login(event) {
    event.preventDefault()
    const username = document.getElementById('username_log').value
    const password = document.getElementById('password_log').value

    const result = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    }).then((res) => res.json())

    if (result.status === 'ok') {
        // everythign went fine
        console.log('Got the token: ', result.data)
        localStorage.setItem('token', result.data)
        showSuccess('Logged')
        location.reload()
    } else {
        showError(result.error)
    }
}

function showError(message) {
    buildToast(message, 'Error', '#B53737');
}

function showSuccess(message) {
    buildToast(message, 'Success', '#00FF00');
}

function buildToast(text, type, color) {
    const div = document.createElement('div');
    div.classList.add('temp-div-container', 'position-fixed', 'bottom-0', 'end-0', 'p-3');
    div.style.zIndex = 11;
    div.innerHTML = `
        <div id="liveToast" class="toast hide" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <svg class="bd-placeholder-img rounded me-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="${color}"></rect></svg>
                <strong class="me-auto">${type}</strong>
                <!--<small>Just now</small>-->
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${text}
            </div>
        </div>`
    document.body.appendChild(div)
    var toast = bootstrap.Toast.getOrCreateInstance(div.querySelector('.toast'))
    toast.show();
    setTimeout(()=> { 
        toast.hide();
        setTimeout(() => div.remove(), 1000)
    }, 2500);

}

function appendOptionsToStrategySelect(element) {
    Object.keys(strategies).forEach(strategy => {
        let opt = document.createElement('option');
        opt.value = strategy;
        opt.innerHTML = strategy;
        element.appendChild(opt)
    })
}

function stopBot(botId) {
    if(document.URL.includes('simulation.html')) return
    if(document.getElementById(`status-bot-${botId}`).checked) {
        const statusElement = document.getElementById(`status-bot-${botId}`);
        statusElement.checked = false;
        let change = new Event('change');
        statusElement.dispatchEvent(change)
    }
}