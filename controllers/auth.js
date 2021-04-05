const User = require("../models/user");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const mailgun = require("mailgun-js");
const user = require("../models/user");

// const mailgun = require("mailgun-js");
const DOMAIN = "sandboxd30b3e9cd5284f93bb5c1f1d4de32be5.mailgun.org";
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN });

// only signup
// signuo controller
// exports.signup = (req, res) => {
//   console.log("REQ BODY ON SIGNUp", req.body);
//   //   res.json({ data: "you hit the signup endpoint from controllers" });
//   const { name, email, password } = req.body;

//   User.findOne({ email }).exec((err, user) => {
//     if (user) {
//       return res.status(400).json({ error: " Email is taken" });
//     }

//     let newUser = new User({ name, email, password });

//     newUser.save((err, success) => {
//       if (err) {
//         console.log("Signup error", err);
//         return res.status(400).json({ error: err });
//       }
//       res.json({ message: "Signup success" });
//     });
//   });
// };

// signup process with mailgun
// signup controller with email verificaition
// exports.signup = (req, res) => {
//   console.log("REQ BODY ON SIGNUp", req.body);
//   //   res.json({ data: "you hit the signup endpoint from controllers" });
//   const { name, email, password } = req.body;

//   User.findOne({ email }).exec((err, user) => {
//     if (user) {
//       return res.status(400).json({ error: " Email is taken" });
//     }

// const data = {
//   from: process.env.EMAIL_FROM,
//   to: email,
//   subject: "Account Activation link",
//   html: `
//   <p>please use the followinglink to activate your account</p>
//   <p>${process.env.CLIENT_URL}</p>
//   <hr/>
//   <p>this email may contain sensitive information</p>
//   <p>${process.env.CLIENT_URL}</p>`,
// };
// mg.messages().send(data, function (error, body) {
//       console.log(body);
//     });

//     let newUser = new User({ name, email, password });

//     newUser.save((err, success) => {
//       if (err) {
//         console.log("Signup error", err);
//         return res.status(400).json({ error: err });
//       }
//       res.json({ message: "Signup success" });
//     });
//   });
// };

// signup process with nodemailer
exports.signup = (req, res) => {
  console.log("REQ BODY ON SIGNUp", req.body);
  //   res.json({ data: "you hit the signup endpoint from controllers" });
  const { name, email, password } = req.body;

  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({ error: " Email is taken" });
    }

    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: "10m" }
    );
    // Step 1
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL || "nishantgangwar69@gmail.com", // TODO: your gmail account
        pass: process.env.PASSWORD || "9997810666", // TODO: your gmail password
      },
    });

    // Step 2

    let mailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Account Activation link",
      html: `
      <p>please use the followinglink to activate your account</p>
      <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
      <hr/>
      <p>this email may contain sensitive information</p>
      <p>${process.env.CLIENT_URL}</p>`,
    };
    // let mailOptions = {
    //   from: "nishantgangwar69@gmail.com", // TODO: email sender
    //   to: email, // TODO: email receiver
    //   subject: "Nodemailer - Test",
    //   text: "Wooohooo it works!!",
    // };

    // Step 3
    transporter.sendMail(mailData, (err, data) => {
      if (err) {
        return console.log("Email Not sent");
      }
      //  console.log("Email sent!!!");
      return res.json({
        message: `Email has been sent to ${email}  go and activate your account`,
      });
    });

    // let newUser = new User({ name, email, password });

    // newUser.save((err, success) => {
    //   if (err) {
    //     console.log("Signup error", err);
    //     return res.status(400).json({ error: err });
    //   }
    //   res.json({ message: "Signup success" });
    // });
  });
};

exports.accountActivation = (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(
      token,
      process.env.JWT_ACCOUNT_ACTIVATION,
      function (err, decoded) {
        if (err) {
          console.log("JWT Verify In Account ACtivation Error", err);
          return res.status(401).json({ error: "Expired Link. Signup Again" });
        }
        const { name, email, password } = jwt.decode(token);

        const user = new User({ name, email, password });

        user.save((err, user) => {
          if (err) {
            console.log("Saved User in Account Action Error", err);
            return res.status(401).json({
              error: "Error Saving user in database. Try again later.",
            });
          }
          return res.json({ message: "Signup Success. Please Signin " });
        });
      }
    );
  } else {
    return res.json({
      message: "Something went wrong. Try again.",
    });
  }
};

exports.signin = (req, res) => {
  const { email, password } = req.body;

  // check user exists
  User.findOne(
    { email }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "User with that email does not exist. Please Sign in Fast",
        });
      }
      // authenticate user
      if (!user.authenticate(password)) {
        return res
          .status(400)
          .json({ error: " EMail and Password does Not exist" });
      }

      //generate a token and send to clients
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "10m" });
      const { _id, name, email, role } = user;

      return res.json({
        token,
        user: { _id, name, email, role },
      });
    })
  
};
