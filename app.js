//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://AdityaKher:Aditya@9811@cluster0.x1yod75.mongodb.net/todoListDB", {
  useNewUrlParser: true, useUnifiedTopology:true
});

const itemsSchema = {
  name: "String",
};

const Item = mongoose.model("Item", itemsSchema);

const Item1 = new Item({
  name: "Welcome todo List",
});
const Item2 = new Item({
  name: "click + to add an item",
});
const Item3 = new Item({
  name: "<-- Hit this to delete an item",
});

const defaultItems = [Item1, Item2, Item3];

const listsSchema = {
  name:"String",
   items:[itemsSchema]
}

const List = mongoose.model("List", listsSchema);

app.get("/", function (req, res) {
  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");
        }
      });
      res.redirect("/");
      
    } else {
      res.render("lists", { listTitle: "Today", newListItems: foundItems});
    }
    
  });
});

app.get("/:customListName", function(req, res){
  const customListName= _.capitalize(req.params.customListName);

  List.findOne({name:customListName}, function(err,listItems){
    if(!err){
      if(!listItems){
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("lists", { listTitle: listItems.name , newListItems: listItems.items});
      }
    }
  })

})

app.post("/", function (req, res) {
  let itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  })

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }
 
});

app.post("/delete", function(req,res){
  const getItemById = req.body.checkbox;
  const listTitle= req.body.listName;

  if(listTitle === "Today"){
    Item.findByIdAndRemove(getItemById, function(err){
      if(!err){
        console.log("Successfully deleted checked item");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listTitle},{$pull: {items: {_id:getItemById}}}, function(err){
      if(!err){
        console.log("Successfully deleted checked item");
        res.redirect("/"+listTitle);
      }
    })
  }
 
})


app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000.");
});
