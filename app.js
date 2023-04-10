const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
const logger = require("morgan");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
               
  //  Used for MongoDB Database
mongoose.connect("mongodb+srv://admin-Saurabh:Saurabh&21@cluster0.blvff.mongodb.net/todolistDB",{useNewUrlParser:true,})
.then(()=>{
  console.log("MongoDB connected Successfully");
})
.catch(err=>{
  console.log("Error in connecting MongoDB"+err);
});

// mongoose.connect("mongodb://localhost:27017/app");   
// Used for local Database
const ItemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", ItemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist",
});
const item2 = new Item({
  name: "Hit this + button to  add a new item",
});
const item3 = new Item({
  name: "Hit this to delete an item",
});
const defaultItems = [item1, item2, item3];

const listSchema={
    name:String,
    items:[ItemsSchema]
};
const List=mongoose.model("List", listSchema);
const dt=new Date();

app.get("/", function (req, res) {


  Item.find({}, function (err, foundItems) {
      if(foundItems.length==0)
      {
        Item.insertMany(defaultItems, function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log("Successfully added DefaultItems to todolistDB");
            }
          });
          res.redirect("/");
      }
      else
      { 
        res.render("list", { ListTitle: dt, newListItems: foundItems});
        console.log(foundItems);
      }

     
  });
});


app.post("/", function(req, res)
{
    const itemName=req.body.newItem;
    const listName=req.body.list;
    const item=new Item({
      name:itemName
    });

    if(listName ===dt)
    {
      item.save();
      res.redirect("/");
    }
    else
    {
      List.findOne({name:listName}, function(err, foundList)
      {
        if(err)
        {console.log(err);
        }
        else{
          foundList.items.push(item);
          foundList.save();
          
        }
        res.redirect("/"+listName);
         

      })
    }
    
});
app.post("/delete", function(req, res)
{
    const checkedItemId=req.body.checkonAList;
    const listName=req.body.listName;
    // console.log(req.body); //Use to console on checking a item in the list
    if(listName===dt)
    {

      Item.findByIdAndRemove(checkedItemId, function(err)
      {
          if(err)
          {
              console.log(err);
          }
          else
          {
              console.log("Successfully removed an item having ID :" +checkedItemId );
              res.redirect("/")
          }
      });
    }
    else
    {
     List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}, function(err,foundList)
     {
       if(!err)
       {
         res.redirect("/"+listName);
       }
     })
    }
  
});

app.get("/:customListName", function(req, res)
{const customListName1=_.capitalize(req.params.customListName);
    List.findOne({name:customListName1}, function(err, foundList)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
           if(!foundList){
               console.log("Doesn't exist !");
               //Create a new List
               const listNew=new List({
                name:customListName1,
                items:defaultItems
            });
            listNew.save();
            res.redirect("/"+customListName1);
           }
           else
           {
               console.log("Exists!!");
               //Show an existing list
               res.render("list", {ListTitle:foundList.name, newListItems:foundList.items});

           }
        }
    })
   
    
   
    
});
app.use(logger("dev"));
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function () {
  console.log("Server  started successfully");
});
