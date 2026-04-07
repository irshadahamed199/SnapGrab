import qrcode from 'qrcode-terminal';
import os from 'os';

function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1'; // Fallback
}

const ip = getLocalIpAddress();
const port = 5173;
const url = `http://${ip}:${port}`;

console.log('\n=============================================');
console.log('📱 Scan this QR Code with your phone camera:');
console.log(`🔗 Direct Link: ${url}`);
console.log('=============================================\n');

qrcode.generate(url, { small: true });
