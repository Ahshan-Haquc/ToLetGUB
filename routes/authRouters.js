const express = require("express");
const Model = require("../models/studentSchema");
const PostShareModel = require("../models/postShareSchema");
const route = express.Router();
const bcrypt = require("bcrypt");
const accessPermission = require("../middlewares/accessPermission");
const availableSeatFetch = require("../middlewares/availableSeatFetch");

//routers for signup
route.get("/signup", (req, res) => {
  res.render("signup");
});

route.post("/signup", async (req, res, next) => {
  try {
    //hashing password
    const hashPassword = await bcrypt.hash(req.body.password, 10);

    //taking input values from signup.ejs
    const studentInfo = new Model({
      firstName: req.body.fname,
      lastName: req.body.lname,
      studentId: req.body.studentId,
      email: req.body.email,
      password: hashPassword,
      phone: req.body.phone,
      gender: req.body.gender,
      department: req.body.department,
      batch: req.body.batch,
    });

    //generating token
    const token = await studentInfo.generateToken();

    //generating cookie using that token
    res.cookie("studentCookie", token, {
      expires: new Date(Date.now() + 600000),
      httpOnly: true,
    });

    await studentInfo.save();

    //rendering in login.ejs page
    console.log("Sign up succesful.");
    res.status(200).render("login",{ error: false });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      // Duplicate key error code
      res
        .status(400)
        .json({ error: "You entered duplicate value in the input." });
    } else {
      next(err);
    }
  }
});

//routers for login without error means studentId or password is correct while just want to see the login page
route.get("/login", (req, res) => {
  res.render("login", { error: false });
});

route.post("/login", availableSeatFetch, async (req, res, next) => {
  try {
    const user = await Model.findOne({ studentId: req.body.studentId });

    //generating token
    const token = await user.generateToken();

    //generating cookie using that token
    res.cookie("studentCookie", token, {
      expires: new Date(Date.now() + 600000),
      httpOnly: true,
    });

    if (user) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (isValidPassword) {
        res.redirect('/homePage');
      } else {
        res.status(400).render("login", { error: true });
      }
    }
  } catch (err) {
    // {error: true}
    //eitar mane jokhon kono input wrong dibo tokhon error namer akta flag dilam jate .ejs file a if condition diye bujte pari j error hoyese ajonno visibility property ta visible set kore dibo
    res.status(500).render("login", { error: true });
  }
});

//router for logout
route.post("/logout", accessPermission, async (req, res) => {
  req.studentInfo.tokens = []; //tokens array er sob delete kore dilam

  res.clearCookie("studentCookie");
  await req.studentInfo.save();

  res.render("login");
});

//router for home page
route.get("/homePage",
  accessPermission,
  availableSeatFetch,
  async (req, res) => {
    try {
      res.status(200).render("homePage", {
        student: req.studentInfo,
        availableSeat: req.availableSeatFetch,
      });
    } catch (error) {
      console.log(error);
      res.send("error");
    }
  }
);

//router for profile page
route.get("/profile", accessPermission, async (req, res) => {
  try {
    // .find({}) ----> eita ekta array of object return kore, ejs file a etake if else & loop diye access korte hobe
    // .findOne({}) ----> eita just akta  object return kore, tai etake ejs file a dirrectly access kora jabe
    const postInfo = await PostShareModel.find({
      studentPostedId: req.studentInfo._id,
    });
    console.log(postInfo);

    //ekhane aro kaj baki ase, res.render korte hobe
    res.status(200).render("profile", {
      student: req.studentInfo,
      studentPost: postInfo,
    });
  } catch (error) {
    console.log(error);
    res.send("Please check vs code.");
  }
});

//router for message
route.get("/messages", accessPermission, (req, res) => {
  res.send("welcome to message page. It will be inplement later.");
});

//router for get post share page
route.get("/postShare", accessPermission, (req, res) => {
  console.log("working get method.");
  res.status(200).render("postShare", { student: req.studentInfo });
});

//router for post share post
route.post("/postShare",accessPermission,availableSeatFetch,async (req, res, next) => {
    try {
      //this is for insert the post values into the post share collection
      const postModel = new PostShareModel(req.body);
      const savedPost = await postModel.save();

      console.log("after saving the post in db : ", savedPost);

      //post share collection a student field a j student post korse eita tar id push korlam, track rakhar jonno j ei post ta ke korsilo
      await PostShareModel.updateOne(
        { _id: savedPost._id },
        { $set: { studentPostedId: req.studentInfo._id } }
      );

      res.redirect('/homePage');

      // //this is for insert the post values into the post share collection (one to many)
      // const postModel = new PostShareModel(req.body);
      // const savedPost = await postModel.save();

      // console.log("after saving the post in db : ", savedPost);

      // //student collection a ei post tar info push korbo jokhon kono new post korbe se
      // await Model.updateOne({_id:req.studentInfo._id},{$push : {posts: savedPost._id}});

      // res.status(200).render('homePage',{student: req.studentInfo});
    } catch (error) {
      console.log("error occur during post share : ", error);
      next(error);
    }
  }
);

route.get("/seePostOne",accessPermission, async (req, res, next) => {
  try {
      //finding kon kon collection er rent 500tk theke 1500tk er moddhe
      const findSharedPostInRange = await PostShareModel.find({
        rent: { $gte: 1, $lt: 1500 }
        });
    
        console.log("Range post fetched successful.");

  res.status(200).render('seePostByRange',{
    student: req.studentInfo,
    seePost: findSharedPostInRange
  })
  
  } catch (error) {
      console.log(error);
      next(error);
  }
});
route.get("/seePostTwo",accessPermission, async (req, res, next) => {
  try {
      //finding kon kon collection er rent 500tk theke 1500tk er moddhe
      const findSharedPostInRange = await PostShareModel.find({
        rent: { $gte: 1500, $lt: 2000 }
        });
    
        console.log("Range post fetched successful.");

  res.status(200).render('seePostByRange',{
    student: req.studentInfo,
    seePost: findSharedPostInRange
  })
  
  } catch (error) {
      console.log(error);
      next(error);
  }
});
// aro 5 ta banate hobe see post

module.exports = route;

