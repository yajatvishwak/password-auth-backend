const express = require("express"); //import statement
const morgan = require("morgan");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
require("dotenv").config();
const app = express();

app.use(morgan("tiny"));
app.use(express.json());
app.use(cors());

var transport = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

function sendMail(email, id) {
  var mailOptions = {
    from: '"Vibha Miniproject" <test@vibhaminiproject.ml>',
    to: email,
    subject: "Sign in Mail",
    html:
      "<b>Hey there! </b><br> This is a test mail to log you in to your account. <br> " +
      "http://localhost:3000/verify/" +
      id,
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
}

// replace with a database
let accounts = [];
let loginAttempt = [];

app.get("/", (req, res) => {
  res.send("online");
});

// first register the user
app.post("/signup", (req, res) => {
  accounts.push({ email: req.body.email });
  console.log(req.body.email + " signed up");
  res.send({ status: "success" });
});

// when the user enters the email this route is called
app.post("/signin", (req, res) => {
  const email = req.body.email;
  const account = accounts.find((item) => item.email === email);
  console.log(account + "is trying to sign in");
  if (account) {
    const id = uuidv4();
    console.log("generated code");
    loginAttempt.push({ email: email, id: id });
    console.log(loginAttempt);
    res.send({ message: "success", id: id });
    sendMail(email, id);
  } else {
    res.send({ message: "failure" });
  }
});

// route that handles all the links sent in the mail
app.post("/verify", (req, res) => {
  const id = req.body.id;
  const account = loginAttempt.find((item) => item.id === id);
  if (account) {
    // authenticated
    res.send({ message: "signed in", status: "successful" });
  } else {
    res.status(401).json({ message: "Oops something went wrong" });
  }
});

app.listen(1231, () => {
  console.log("listening on 1231");
});
