var express = require('express')
var app = express()
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser')

const token ='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9';


// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/',function(req,res){
    res.send('hello world')
})
app.get('/items',function(req,res){
    // send request to db to check  all items
    res.send('hello world')
})

app.get('/items/:id',function(req,res){
    // check item with id
    var id =req.params.id;
    var hostname = req.hostname;
    var ip = req.ip;
    // get the item from mongodb and your result
    console.log(req)

    res.send('insert finished')
})

app.get('/orders',function(req,res){
    //list all orders
})

app.get('/orders/:id',function (req,res){
    // get all order with id
})

app.post('/orders/',function(req,res){
    //request to order a specific item 
})

// for admin test here 
// if request with a header

// need a function to check for admins
function veriAdmin(req){
    if(req.get('token') ==token){
        console.log('success')
    return true;    
    }else{

        console.log('false')
    return false
    }
    
}

app.post('/items',function(req,res){
    var verify =veriAdmin(req);
    if(verify){
        // add new items
    }
    // res.send(req.body.token)
})

app.patch('/item/:id',function(req,res){
    var verify =veriAdmin(req);
    if(verify){
        // change stock :number 
    }
})

app.delete('/item/:id',function(req,res){
    var verify =veriAdmin(req);
    if(verify){
        // delete item
    }

})



app.listen(3000)
