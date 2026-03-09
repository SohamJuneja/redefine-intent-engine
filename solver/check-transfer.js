const https = require('https');
async function fetchFile(ref, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/fatlabsxyz/tongo/contents/packages/contracts/src/${path}?ref=${ref}`,
      method: 'GET',
      headers: { 'User-Agent': 'node', 'Accept': 'application/vnd.github.v3+json' }
    };
    https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (!json.content) { reject(new Error(JSON.stringify(json).slice(0, 200))); return; }
        resolve(Buffer.from(json.content, 'base64').toString('utf-8'));
      });
    }).on('error', reject).end();
  });
}

async function main() {
  const verifier = await fetchFile('cd353798', 'verifier/transfer.cairo');
  console.log('=== verifier/transfer.cairo at cd353798 ===');
  console.log(verifier.slice(0, 3000));
}
main().catch(console.error);
