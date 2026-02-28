const express = require('express');
const app = express();

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/does-not-exist.html', err => {
    if(err) {
      console.log("Error sending file");
      // res.status(500).send("Something broke");
    }
  });
});

app.listen(9999, () => console.log('Listening on 9999'));
