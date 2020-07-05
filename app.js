//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + '/date.js');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Database
mongoose.connect("mongodb+srv://admin-mertcan:TestMert123!@cluster0.xymh6.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

//For Items
const itemsSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        }
    }
);

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item(
    {
        name: "Welcome to your todolist!"
    }
);

const item2 = new Item(
    {
        name: "Hit the + button to add a new item."
    }
);

const item3 = new Item(
    {
        name: "<-- Hit this to delete an item."
    }
);

const defaultItems = [item1, item2, item3];

//for URL
const listSchema = new mongoose.Schema(
    {
        name: String,
        items: [itemsSchema]
    }
);

const List = mongoose.model("List", listSchema);

//-------

let day = date.getDate();
app.get('/', (req, res) => {

    Item.find({}, (err, foundItems) => { //gives array
        if (err) {
            console.log(err);
        } else if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully added the default items to DB");
                }
            });
            res.redirect("/");
        } else {
            res.render('list', { listTitle: day, newListItems: foundItems });
            //console.log(foundItems); //empty array
        }
    });
});


app.get('/:customListName', (req, res) => {
    const customListName = _.capitalize(req.params.customListName); //params = url ayrıştırıcı

    List.findOne({ name: customListName }, (err, foundList) => { //gives object
        if (err) {
            console.log(err);
        } else if (!foundList) {
            //Create a new list
            const list = new List(
                {
                    name: customListName,
                    items: defaultItems
                }
            ).save(); //list.save()
            res.redirect('/' + customListName);
        } else {
            //Show an existing list
            res.render('list', { listTitle: foundList.name, newListItems: foundList.items });
        }
    });
});


//because form action = "/"
app.post('/', (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item(
        {
            name: itemName
        }
    );

    if (listName === day) {
        item.save();
        res.redirect('/');
    } else {
        List.findOne({ name: listName }, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect('/' + listName);
        });
    }
});

app.post('/delete', (req, res) => {
    //console.log(req.body.checkbox); //checkboxın valuesını verir.
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === day) {
        Item.findByIdAndRemove(checkedItemId, (err) => { //in order to get the and remove part, we have to provide the callback
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully deleted the checked item!");
                res.redirect('/');
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, (err, foundList) => {
            if (!err) {
                res.redirect('/' + listName);
            }
        });
    }
});


app.get('/about', (req, res) => {
    res.render('about', { name: 'Mertcan' });
});

//for Heroku
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {
    console.log("Server running on port 3000!");
});

