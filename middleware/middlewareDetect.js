import ClientHints from 'node-device-detector/client-hints';

const DeviceDetector = require('node-device-detector');
// init app
const deviceDetector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
});

const clientHints = new ClientHints;


const middlewareDetect = (req, res, next) => {
    const useragent = req.headers['user-agent']; 
    const clientHintsData = clientHints.parse(res.headers);

  
    req.useragent = useragent;
    req.device = deviceDetector.detect(useragent, clientHintsData);
    // req.bot = deviceDetector.parseBot(useragent);
    next();
};

export default middlewareDetect;
  