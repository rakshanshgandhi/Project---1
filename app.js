import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

const accSid = "";
const authToken = "";
const twilioPhone = "";

const client = new twilio(accSid, authToken);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}

const otpMap = new Map();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/sendOTP", (req, res) => {
  const phoneNumber = req.body.phoneNumber;

  if (!phoneNumber) {
    return res.send("Phone number is required");
  }

  const otp = generateOTP();
  otpMap.set(phoneNumber, otp);

  client.messages
    .create({
      body: `Your OTP is: ${otp}`,
      from: twilioPhone,
      to: phoneNumber,
    })
    .then(() => res.send("OTP Sent Successfully"))
    .catch((error) => res.status(500).send("Error sending OTP"));
});

app.post("/verifyOTP", (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const otpFromUser = req.body.OTP;

  if (!phoneNumber || !otpFromUser) {
    return res.send("Phone number and OTP are required");
  }

  const storedOTP = otpMap.get(phoneNumber);

  // console.log("Stored OTP:", storedOTP);

  if (!storedOTP || parseInt(otpFromUser) !== storedOTP) {
    return res.send("Invalid OTP");
  }

  res.send("OTP Verified Successfully");
  otpMap.delete(phoneNumber);
});

app.listen(port, () =>
  console.log(`Server is running at http://localhost:${port}`)
);
