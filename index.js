const express = require("express");
const cors = require('cors');
require('dotenv').config()
const Pusher=require('pusher')
const { connectToDb, getDb } = require("./db");
const PORT = process.env.PORT || 4000;
const app = express();
let db;
var pusher = new Pusher({
  appId: process.env.PUSHER_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  encrypted: true
});
connectToDb((err) => {
  if (!err) {
    app.listen(PORT, () => {
      console.log(`app listening on port ${PORT}`);
    });
    db = getDb();
  }
});
// app.use("*",(req,res,next)=>{
//   res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
//   res.setHeader("Access-Control-Allow-Methods", "*");
//   res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization, access-control-allow-method, access-control-allow-origin, content-type');
//   next();
// })
app.use(cors({
  origin:"*"
}));
app.use(express.json());


app.post("/team", async (req, res) => {
  let { teamName,password } = req.body;
  console.log(teamName,password,req.body)
  console.log("A")
  console.log("B")
  console.log("C")
  const alreadyExists = await db
    .collection("teams")
    .findOne({$and:[{teamName:teamName},{password:password}]});
    console.log(alreadyExists);
  if (alreadyExists){
    if(alreadyExists.startTime===0)
    {
    await db.collection("teams").updateOne({
      teamName:teamName
    },
    {
      $set:{
        startTime:Date.now()
      }
    })
  }
    console.log(alreadyExists)
    res.send({
      status: 200,
      msg: "Success.Team Exists",
    });
  }
  else {
    // await db.collection("teams").insertOne({
    //   teamName: teamName,
    //   startTime: Date.now(),
    //   totalTime: 0,
    //   questionSolved:0
    // });
    res.send({
      status: 404,
      msg: "Team does not exist",
    });
  }
});

app.post("/submit", async (req, res) => {
   let { teamName, questionId, userAnswer} = req.body;
   console.log(req.body)
   const team = await db.collection("teams").findOne({ teamName: teamName });
   if(team)
   {
    if (questionId>= team.questionSolved) {
      console.log(questionId);
      let answer=await db.collection("answers").findOne({questionId:questionId})
      console.log(answer)
      if(userAnswer.toLowerCase()===answer.answer.toLowerCase()){
      await db.collection("teams").updateOne(
        {
          teamName: teamName,
        },
        {$set:{
          totalTime: Math.floor((Date.now() - team.startTime)/1000),
          questionSolved:team.questionSolved+1
        }
    }
      );
      const newTeam=await db.collection("teams").findOne({teamName:teamName})
      pusher.trigger('leaderboard','answer',{
        data:newTeam
      })
      res.send({
        status: 200,
        msg: "Correct answer.Score Updated!!",
      });
    }
    else
    {
      res.send({
        status:200,
        msg:"Wrong answer!!"
      })
    }
  }
    else if (questionId<team.questionSolved) {
      res.send({
        status:409,
        msg:"You have already attempted the question"
      })
   }
  }
   else
   {
     res.send({
       status:404,
       msg:"Something went wrong"
     })
   }
});

app.get("/leaderboard", async (req, res) => {
  db.collection("teams")
    .find()
    .sort({ questionSolved: -1, totalTime:1})
    .toArray(function (err, result) {
      if (err) res.send({ status: 500, msg: "Something went wrong" });
      res.send({ status: true, res: result });
    });
});
