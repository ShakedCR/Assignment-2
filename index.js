const express = require('express')
const app = express();
const port = process.env.PORT;
const sendersRoute = require("./routes/sendersRoute");
const postsRoute = require("./routes/postsRoute");
const commentsRoute = require("./routes/commentsRoute");



app.use(express.json());

app.get('/', (req, res) => {
res.send('Welcome to Ron and Shaked\'s Comments and Posts API!')
});
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));   


//controllers
app.use("/post", postsRoute);
app.use("/sender", sendersRoute);
app.use("/comment", commentsRoute);


app.listen(port, () => {
console.log(`Example app listening at http://localhost:${port}`)
});
