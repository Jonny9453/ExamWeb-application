//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const { MongoClient } = require('mongodb');
require('dotenv').config()








async function createListing(client, newListing){
  const result = await client.db("Question").collection("Questions List").insertOne(newListing);
  console.log(`New listing created with the following id: ${result.insertedId}`);
}

async function listDatabases(client){
  databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};




const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
let contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

const posts=[];




app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


let choicesQuantity=1;
let gmail="Your email"
let phoneNumber="Your Phone Number"

async function main() {
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/drivers/node/ for more details
   */
  const password=process.env.SECRET;
  const username=process.env.USER;
  console.log(password)
  console.log(username+"me");
  const uri = "mongodb+srv://"+username+":"+password+"@myatlasclusteredu.08pvwoa.mongodb.net/Question?retryWrites=true&w=majority";
  
  /**
   * The Mongo Client you will use to interact with your database
   * See https://mongodb.github.io/node-mongodb-native/3.3/api/MongoClient.html for more details
   */
  const client = new MongoClient(uri);

  try {
      // Connect to the MongoDB cluster
      await client.connect();

      // Make the appropriate DB calls
      await printQuestions(client, "Australia", "Sydney", 10);

  } finally {
      // Close the connection to the MongoDB cluster
      await client.close();
  }
}

main().catch(console.error);

// Add functions that make DB calls here

async function printQuestions(client, country, market, maxNumberToPrint) {
  const pipeline = [
    
      {
        '$project': {
          '_id': 0
        }
      }
    
    ];

const aggCursor = client.db("Question")
                      .collection("Questions List")
                      .aggregate(pipeline);
                    
await aggCursor.forEach(Q => {
posts.push(Q)

});   


}

app.get("/",function(req,res){

  

  const postsf=posts;

  res.render('home', {startingContent: homeStartingContent, Posts:postsf , choicesNumber: choicesQuantity});
  
})


app.get("/about", function(req,res){
  res.render('about', {about: aboutContent});
})

app.get("/contact", function(req,res){
  res.render("contact", {contact: contactContent, updatedEmail:gmail, updatedNumber: phoneNumber});
})

app.post("/contact", function(req,res){
  gmail=req.body.email;
  phoneNumber=req.body.phoneNumber;
  contactContent=req.body.description;
  res.redirect("/contact")
})

app.get("/compose", function(req,res){
  res.render("compose", {choicesNumber: choicesQuantity});
})

app.post("/compose", function(req,res){
  console.log(req.body)
  if(req.body.button==="publish"){
    const post={
      title:req.body.postTitle,
      content:req.body.postBody,
      multipleChoiceQuestions: req.body.questionChoices
    }

    async function main() {
      const uri = "mongodb+srv://myAtlasDBUser:myatlas-001@myatlasclusteredu.08pvwoa.mongodb.net/?retryWrites=true&w=majority";
      const client = new MongoClient(uri);
      try{
        await client.connect();
        await createListing(client,post
          
      );
      
      } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
      
    }

    main().catch(console.error);
    
    console.log(post.multipleChoiceQuestions)
    // posts.push(post)
    // res.redirect('/')
  }
  
  choicesQuantity=req.body.quantity;
  console.log(choicesQuantity);
  res.redirect("/compose")
  
  
})


app.get("/posts/:topic",function(req,res){
  const requestedTitle=_.lowerCase(req.params.topic);
  posts.forEach(function(post){
    const storedTitle=_.lowerCase(post.title);
    if(storedTitle===requestedTitle){
      res.render("post", {
        title: post.title, content: post.content, multipleChoiceQuestions: post.multipleChoiceQuestions, updatePost:"notNow"
      })
    }else{
      console.log("Not Matched");
    }
  })
 
})

app.post('/post', function(req,res){
  const index=req.body.questionIndex;
  console.log(index)
  res.render('post',{updatePost: "updatePost", title: posts[0].title, content: posts[0].content, multipleChoiceQuestions: posts[0].multipleChoiceQuestions})
})




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
