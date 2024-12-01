const express = require('express');
const request = require('request');

const app = express();

app.use('/api', (req, res) => {
    const url = 'wss://nosedive-0gat.onrender.com/' + req.url; // URL do API externa
    req.pipe(request(url)).pipe(res);
});

app.listen(3000, () => console.log('Proxy running on port 3000'));
