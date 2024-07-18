const dotenv = require('dotenv')
const assert = require('assert')

dotenv.config()

const {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
} = process.env

assert(API_KEY, 'API_KEY required')
assert(AUTH_DOMAIN, 'AUTH_DOMAIN is required')
assert(PROJECT_ID, 'PROJECT_ID is required')
assert(STORAGE_BUCKET, 'STORAGE_BUCKET is required')
assert(MESSAGING_SENDER_ID, 'MESSAGING_SENDER_ID is required')
assert(APP_ID, 'APP_ID is required')

module.exports = {
  firebaseConfig: {
    apiKey: API_KEY,
    authDomain: AUTH_DOMAIN,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    messagingSenderId: MESSAGING_SENDER_ID,
    appId: APP_ID,
  },
}