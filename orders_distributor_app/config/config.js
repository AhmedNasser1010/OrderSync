const dotenv = require('dotenv')
const assert = require('assert')

dotenv.config()

const {
  FIREBASE_API,
  FIREBASE_AUTHDOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESS_SEND_ID,
  APP_ID,
  MEASUREMENT_ID
} = process.env

assert(FIREBASE_API, 'FIREBASE_API required')
assert(FIREBASE_AUTHDOMAIN, 'FIREBASE_AUTHDOMAIN is required')
assert(PROJECT_ID, 'PROJECT_ID is required')
assert(STORAGE_BUCKET, 'STORAGE_BUCKET is required')
assert(MESS_SEND_ID, 'MESS_SEND_ID is required')
assert(APP_ID, 'APP_ID is required')
assert(MEASUREMENT_ID, 'MEASUREMENT_ID is required')

module.exports = {
  firebaseConfig: {
    apiKey: FIREBASE_API,
    authDomain: FIREBASE_AUTHDOMAIN,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
    messagingSenderId: MESS_SEND_ID,
    appId: APP_ID,
    measurementId: MEASUREMENT_ID
  },
}
