const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const PORT = 2121;
require("dotenv").config();

let db,
  dbConnectionStr = process.env.DB_STRING,
  //name of a db
  dbName = "rap";

//connect to db
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }).then(
  (client) => {
    console.log(`Connected to ${dbName} Database`);
    //and set a db name
    db = client.db(dbName);
  }
);

//What file is going to be served
app.set("view engine", "ejs");

//Makes folder "public" accessible from any file
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//What happens when i go to main url '/'
app.get("/", (request, response) => {
  //get collection of 'rappers', get all documents, push it to the array
  db.collection("rappers")
    .find()
    .sort({ likes: -1 })
    .toArray()
    //data is holding an array of objects from db
    .then((data) => {
      //responding with ejs file and passing array of objects in variable 'info' to ejs file
      response.render("index.ejs", { info: data });
    })
    .catch((error) => console.error(error));
});

//post request
app.post("/addRapper", (request, response) => {
  //go to db
  db.collection("rappers")
    //add new db document
    .insertOne({
      //stuff got from index.ejs inputs
      stageName: request.body.stageName,
      birthName: request.body.birthName,
      //lieks is hardcoded
      likes: 0,
    })
    //when stuff is collected and added just refresh to have updated collection on site
    .then((result) => {
      console.log("Rapper Added");
      response.redirect("/");
    })
    .catch((error) => console.error(error));
});

app.put("/addOneLike", (request, response) => {
  db.collection("rappers")
    .updateOne(
      {
        stageName: request.body.stageNameS,
        birthName: request.body.birthNameS,
        likes: request.body.likesS,
      },
      {
        $set: {
          likes: request.body.likesS + 1,
        },
      },
      {
        sort: { _id: -1 },
        upsert: true,
      }
    )
    .then((result) => {
      console.log("Added One Like");
      response.json("Like Added");
    })
    .catch((error) => console.error(error));
});

//request was sent via main.js file (i made a js request)
app.delete("/deleteRapper", (request, response) => {
  //go to db
  db.collection("rappers")
    //delete passed values in main.js (basically find an object that has a stageNameS clicked item)
    .deleteOne({ stageName: request.body.stageNameS })
    .then((result) => {
      console.log("Rapper Deleted");
      response.json("Rapper Deleted");
    })
    .catch((error) => console.error(error));
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
