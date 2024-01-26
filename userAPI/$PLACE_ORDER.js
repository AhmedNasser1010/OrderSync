const accessToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjViNjAyZTBjYTFmNDdhOGViZmQxMTYwNGQ5Y2JmMDZmNGQ0NWY4MmIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcG9zLXN5c3RlbS0wIiwiYXVkIjoicG9zLXN5c3RlbS0wIiwiYXV0aF90aW1lIjoxNzA2MjI3Mjg2LCJ1c2VyX2lkIjoiSlFNSTRRbmZ0N1dLZTU2WWc1YmtqdFRRc0FBMyIsInN1YiI6IkpRTUk0UW5mdDdXS2U1NllnNWJranRUUXNBQTMiLCJpYXQiOjE3MDYyMjcyODYsImV4cCI6MTcwNjIzMDg4NiwiZW1haWwiOiJhaG1lZC5taXguZ2FtZXNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFobWVkLm1peC5nYW1lc0BnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.mtvIUd0DoX5tAQScR6haaHkAHFSF_6XSZxszYo5RodmDwpX1Au6xtEJ_C-xS9zN2BAlNrXkv1wQB0-sO8yr3nD7ZfMZUV7OYI9G7xTj3XDhlpnEBlBWPDJRhB_A0Gbpd7pcZZr1AVHWuEpWyFNYrXwaO2Z-wio_fx-znAYS-PdSEvW1CFkUKdx0a4wHHCJiQlEKIPv4teRppYrTu1dDN5pQKS0rkOIWyNpQqmhG5L2sqw6bfgZ44PA97LfpvLQbm9E1mcwLjBHSW6FVwxwVX1HIxtia4OdjHJylOef-io1X5ZBHW0MhjiYQ3O_ldU0TdYaAvvrOQUuoTXJwSarUCzA";


const endpoint = "https://firestore.googleapis.com/v1/projects/pos-system-0/databases/(default)/documents";
const subCollection = "6e3d32ad-2bf3-40b1-b573-7fe308d4ecab_JQMI4Qnft7WKe56Yg5bkjtTQsAA3"

// ${endpoint}/yourCollection?documentId=${subCollection}

const $PLACE_ORDER = async () => {
  const data = {
    fields: {
      Field1: {
        arrayValue: {
          values: [{stringValue: "test"}]
        }
      }
    }
  }

  try {

    // `${endpoint}/orders?documentId=${subCollection}`
    // `${endpoint}/orders/${subCollection}`
    // `${endpoint}/orders?&key=${accessToken}`
    const response = await fetch(`${endpoint}/orders/subCollection?&key=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });

    const res = await response.json();
    console.log(res);

  } catch (error) {
    console.error('Fetching error $PLACE_ORDER:', error);
  }
};

export default $PLACE_ORDER;