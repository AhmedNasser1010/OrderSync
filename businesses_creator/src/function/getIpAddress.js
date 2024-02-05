const getIpAddress = () => {
    return fetch('https://api64.ipify.org?format=json')
      .then(response => response.json())
      .then(data => data.ip)
      .catch(error => console.error('Error fetching IP:', error));
}

export default getIpAddress;