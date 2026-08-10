import https from 'https';

const options = {
  hostname: 'api.github.com',
  path: '/repos/Oxil05/UtangHandler/actions/jobs/93357850437',
  headers: {
    'User-Agent': 'Node.js'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('JOB NAME:', parsed.name);
      console.log('JOB CONCLUSION:', parsed.conclusion);
      console.log('STEPS:');
      parsed.steps.forEach(s => console.log(`${s.number}: ${s.name} -> ${s.conclusion}`));
    } catch(e) {
      console.log(e);
    }
  });
});
