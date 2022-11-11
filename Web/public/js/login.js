const form_reg = document.getElementById('reg-form')
form_reg.addEventListener('submit', registerUser)

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
        alert('Success')
    } else {
        alert(result.error)
    }
}

const form_log = document.getElementById('login')
form_log.addEventListener('submit', login)

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
        alert('Success')
        await checkToken()
    } else {
        alert(result.error)
    }
}

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

    if (result.status === 'ok') {
        // everythign went fine
        console.log(result)
        alert(`Username: ${result.data}`)
    } else {
        alert(result.error)
    }
}