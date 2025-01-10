const os = require('os');

function getLocalIPAddress() {
  const networkInterfaces = os.networkInterfaces();

  for (const interfaceName in networkInterfaces) {
    const interfaceDetails = networkInterfaces[interfaceName];

    for (const detail of interfaceDetails) {
      if (detail.family === 'IPv4' && !detail.internal) {
        console.log('Local IP Address:', detail.address);
        return detail.address;
      }
    }
  }

  return 'Unable to determine local IP address';
}

// const localIP = getLocalIPAddress();
// console.log('Your Local IP Address is:', localIP);

module.exports = getLocalIPAddress;
