
import geoip from 'geoip-lite';

const ip = '117.201.50.92';
const geo = geoip.lookup(ip);

console.log(`Testing IP: ${ip}`);
console.log('Geo Result:', geo);
