import firebase from '../firebase.js';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';

const db = getFirestore(firebase);

export const newOrder = async (req, res, next) => {
  console.log('/new-order | was called');
  try {

    const data = req.body;
    const secretKey = req.headers['x-secret-key'];

    const orderRef = doc(db, 'orders', secretKey);

    await updateDoc(orderRef, {
      open: arrayUnion(data)
    });

    res.status(200).send('order created successfully');

  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getMenu = async (req, res, next) => {
  console.log('/menu | was called');
  try {
    const secretKey = req.headers['x-secret-key'];
    const menu = doc(db, 'menus', secretKey);
    const data = await getDoc(menu);
    if (data.exists()) {
      res.status(200).send(data.data());
    } else {
      res.status(404).send('product not found');
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};