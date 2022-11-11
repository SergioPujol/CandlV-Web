const User = require('../model/user');

const verify = async (data) => {
    console.log('login')
    const { key, email } = data
    const userData = await User.findOne({ email }).lean()
	console.log(userData)
	if (!userData) {
		return { status: 'error', error: 'Invalid credentials' }
	}

	if(userData.key === key) {
		// put instanceID
		return { status: 'ok', id: userData._id }
	} else if(userData.key != key) {
		return { status: 'error', error: 'Invalid credentials' }
	}
    
}

module.exports = {
    verify
}