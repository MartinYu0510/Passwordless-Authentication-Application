var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const port = 8080;

var app = express();
//Database
var mongoose = require("mongoose");
mongoose.set("strictQuery", false);
mongoose
  .connect("mongodb://mongodb/Gradebook", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("MongoDB connection error: " + err);
  });

//set Schema
var userSchema = mongoose.Schema({
  uid: Number,
  email: String,
  secret: String,
  timestamp: Number,
});
var courseSchema = mongoose.Schema({
  uid: Number,
  course: String,
  assign: String,
  score: Number,
});

//create Model
var userModel = mongoose.model("user", userSchema, "users");
var courseModel = mongoose.model("course", courseSchema, "courseinfo");

//nodeMailer
var nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "testmail.cs.hku.hk",
  port: 25,
  secure: false,
});

//session
var session = require("express-session");
app.use(session({ secret: "bruh" }));

//crypto
var crypto = require("crypto");
/* GET home page. */
// view engine setup
app.set("view engine", "pug");
app.set("views", "views");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/login", async (req, res) => {
  var token = req.query.token;
  if (token) {
    console.log("Receive query token: " + token);
    let tokenDecode = JSON.parse(
      Buffer.from(token, "base64").toString("utf-8")
    );
    console.log("Decoded token: " + tokenDecode + " uid: " + tokenDecode.uid);
    let record = await userModel.find({ uid: tokenDecode.uid });
    if (record.length < 0) {
      console.log("Fail to authenticate - unknow user");
      //   res.send({ msg: "Fail to authenticate - unknow user" });
      res.render("login", { errorMsg: "Fail to authenticate - unknow user" });
      return;
    } else {
      console.log("Found record: " + record[0]);
      if (record[0].secret != tokenDecode.secret) {
        console.log("Fail to authenticate - incorrect secret");
        // res.send({ msg: "Fail to authenticate - incorrect secret" });
        res.render("login", {
          errorMsg: "Fail to authenticate - incorrect secret",
        });
        return;
      } else if (Date.now() - record[0].timestamp > 60000) {
        console.log("Fail to authenticate - token expired");
        // res.send({ msg: "Fail to authenticate - token expired" });
        res.render("login", {
          errorMsg: "Fail to authenticate - token expired",
        });
        return;
        ``;
      } else {
        console.log("Successfully authenticated");
        let courseInfo = await courseModel
          .find({ uid: tokenDecode.uid }, { course: 1, assign: 1, score: 1 })
          .sort({ course: 1 });
        console.log("Course info data: " + courseInfo);
        req.session.courseinfo = courseInfo;
        req.session.timestamp = Date.now();
        req.session.login = true;
        console.log("Session id: " + req.session.id);
        let updatedUser = await userModel.findOneAndUpdate(
          { uid: tokenDecode.uid },
          { secret: null, timestamp: null },
          { new: true }
        );
        console.log("Updated user: " + updatedUser);
        res.redirect("/courseinfo/mylist");
      }
    }
  } else {
    if (req.session && req.session.login) {
      console.log(
        "Session id: " + req.session.id + " login: " + req.session.login
      );
      res.render("login");
    } else if (req.session && !req.session.login) {
      console.log(
        "Session id: " + req.session.id + " login: " + req.session.login
      );
      req.session.destroy();
      res.render("login", { errorMsg: "Session expired. Please login again." });
    } else {
      console.log("No session");
      res.render("login");
    }
  }
});

app.get("/courseinfo/mylist", (req, res) => {
  console.log("Session id: " + req.session.id + " login: " + req.session.login);
  if (req.session.login) {
    if (Date.now() - req.session.timestamp > 300000) {
      req.session.login = false;
      res.redirect("/login");
    }
    var courseInfo = req.session.courseinfo;
    var courseCode = [];
    for (var course of courseInfo) {
      if (!courseCode.includes(course.course)) {
        courseCode.push(course.course);
      } else {
        continue;
      }
    }
    console.log("Course code: " + courseCode);
    res.render("mylist", { courses: courseCode });
  } else {
    res.redirect("/login");
  }
});

app.get("/courseinfo/getscore", async (req, res) => {
  console.log("Session id: " + req.session.id + " login: " + req.session.login);
  if (req.session.login) {
    if (Date.now() - req.session.timestamp > 300000) {
      req.session.login = false;
      res.redirect("/login");
    }
    var courseCode = req.query.course;
    var courseInfo = req.session.courseinfo;
    var courseData = [];
    var hasData = true;
    var totalScore = 0;
    console.log("Query course code: " + courseCode);
    for (var course of courseInfo) {
      if (course.course === courseCode) {
        courseData.push(course);
        totalScore += course.score;
      }
    }
    console.log("Course data: " + courseData);
    if (courseData.length === 0) {
      hasData = false;
    }
    res.render("getscore", {
      courseData: courseData,
      hasData: hasData,
      course: courseCode,
      totalScore: totalScore,
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/login", async (req, res) => {
  console.log("received post request");
  console.log(req.body);
  var inputEmail = req.body.email;
  console.log(inputEmail);
  try {
    let result = await userModel.find({ email: inputEmail });
    console.log(result);
    if (result.length > 0) {
      console.log("Successfully find the user");
      console.log(result[0].uid);
      res.send({ msg: "successful" });
      let secret = crypto.randomBytes(8).toString("base64");
      console.log(secret);
      let token = {
        uid: result[0].uid,
        secret: secret,
      };
      let tokenEncode = Buffer.from(JSON.stringify(token)).toString("base64");
      console.log(tokenEncode);
      let accessLink = "http://localhost:8080/login?token=" + tokenEncode;
      let message = {
        from: "sender@connect.hku.hk",
        to: inputEmail,
        subject: "Access token for the course info page",
        html:
          "<p>Dear student</p>" +
          "<br>" +
          "<p>You can log on to the system via the following link:</p>" +
          "<a href='" +
          accessLink +
          "'>" +
          accessLink +
          "</a>",
      };
      try {
        transporter.sendMail(message);
        console.log("Email sent with link " + accessLink);
      } catch (err) {
        console.log("Erro in sending email with " + err);
      }
      userModel
        .findOneAndUpdate(
          { email: inputEmail },
          { secret: secret, timestamp: Date.now() },
          { new: true }
        )
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log("No user found");
      res.send({ msg: "bruh" });
    }
  } catch (err) {
    res.send({ msg: err });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
module.exports = app;
