var express = require('express')
var app = express()
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser')
require('dotenv').config();
var mongoose = require('mongoose')
const Message = require('./messages')

 mongoose.connect('mongodb://localhost/'+process.env.DB_NAME, {useNewUrlParser: true});
// schema for two tables
const Item = new mongoose.Schema({
    id: String,
    type: String,
    color: String,
    size: "S" | "M" | "L",
    stock: Number,
    }
)
const Order =new mongoose.Schema(
{
    id: String,
    itemId: String,
    quantity: Number,
    }
)

const ItemModel = mongoose.model('Item',Item);
const OrderModel = mongoose.model('Order',Order);

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/',function(req,res){
    res.send('hello world')
})
app.get('/items',function(req,res){
    var query =ItemModel.find()
    query.exec(function(err,data){
        if(err){
            console.log(err)
        }
        try{
            res.send('succes\n,Item:\n'+JSON.stringify(data));
        }catch(err){
            console.log(err)
            res.send(err)
        }
  })
})

app.get('/items/:id',function(req,res){
    // check item with id
    var id =req.params.id;
    ItemModel.find({id:id},function (err,data){
        if(err){
            console.log(err)
        }
        if(data.length){
            console.log(data)
            res.send('succes:true,item:'+JSON.stringify(data))
        }else{
            res.send('success:false, message:'+Message['ItemNotFound']);
        }
    })
})

app.get('/orders',function(req,res){
    //list all orders
    ItemModel.find().exec(function(err,data){
        if(err) console.log(err)

        if(data.length){
            res.send('sucess:true,order:'+JSON.stringify(data))
        }
    })
})

app.get('/orders/:id',function (req,res){
    // get all order with id
    ItemModel.find({id:req.params.id},function(err,data){
        if(err) console.log(err)
        if(data.length){
            res.send('sucess:true,\n order:'+JSON.stringify(data))
        }else{
            res.send('sucess:false,message:'+Message['OrderNotFound'])
        }
    })
})

// this is going need to change to item document as well 
app.post('/orders',function(req,res){
    //request to order a specific item
    if(typeof(req.body.itemId)=='string'||typeof(req.body.itemId)=='number' &&typeof(req.body.quantity)=='number'){
        ItemModel.find({'id':req.body.itemId},function(err,data){
            if(data.length){
                 if(data.stock< req.body.quantity){
                     res.send("sucess:false,message"+Message['ItemNotEngouh'])
                 }else{
                    var order =new OrderModel({
                        itemId:req.body.itemId,
                        quantity:req.body.quantity
                    })
                    order.save(function(err,result){
                        if(err) console.log(err)
                    })
                    // console.log(req.body)
                    res.setHeader('Content-Type', 'application/json');
                    res.send('sucess:true, message'+JSON.stringify(req.body))
                 }
            }else{
                res.send('sucess:false,message:'+Message['ItemNotFound'])
            }
        })
    }else{
        res.send('sucess:failed,message:'+Message['InvalidRequest'])
    }
})

// for admin test here 
// if request with a header

// need a function to check for admins
function verifyAdmin(req){
    if(req.get('token') ==process.env.TOKEN){
        console.log('success')
    return true;    
    }else{
        console.log('false')
    return false
    }
    
}

app.post('/',function (req,res){
    var verify=verifyAdmin(req)
    if(verify){
    }
})

app.post('/items',function(req,res){
    var verify =verifyAdmin(req);
    if(verify){            
            var item = new ItemModel({
                type:req.body.type,
                color:req.body.color,
                size:req.body.size,
                stock:req.body.stock
            })
            ItemModel.find({
                type:req.body.type,
                color:req.body.color,
                size:req.body.size,
            },function(err,data){
                if(err) console.log(err)
                if(data.length){
                    data.stock=data.stock+req.body.quantity
                }
                ItemModel({
                    type:req.body.type,
                    color:req.body.color,
                    size:req.body.size,
                    stock:req.body.stock
                }).save(function(err,data){
                    if(err) console.log(err)
                })
                console.log(data)
            })
        // add new items
    }
    // res.send(req.body.token)
})

app.patch('/item/:id',function(req,res){
    var verify =verifyAdmin(req);
    if(verify){
        // change stock :number 
    }
})

app.delete('/item/:id',function(req,res){
    var verify =verifyAdmin(req);
    if(verify){
        // delete item
    }

})



app.listen(3000)
