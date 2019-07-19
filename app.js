var express = require('express')
var app = express()
var bodyParser = require('body-parser')
// TOKEN was put into .env file
require('dotenv').config();
//alternatively you may read token from a local file as well 
// var TOKEN= require('./token')

var mongoose = require('mongoose')
const Message = require('./messages')

mongoose.connect('mongodb://localhost/'+process.env.DB_NAME, {useNewUrlParser: true});
// schema for two tables
const Item = new mongoose.Schema({
    id:String,
    type: String,
    color: String,
    size: { type: String, enum: ['S', 'M', 'L'] },
    stock: Number,
    },{versionKey:false}
)
const Order =new mongoose.Schema(
{
    id:String,
    itemId: String,
    quantity: Number,
    },{versionKey:false}
)
// Model of two tables
const ItemModel = mongoose.model('Item',Item);
const OrderModel = mongoose.model('Order',Order);
// server preset
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// items route
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
// items/{id}
app.get('/items/:id',function(req,res){
    // check item with id
    var id =req.params.id;
    ItemModel.find({_id:id},function (err,data){
        if(err){
            console.log(err)
        }
        if(data.length){
            res.send('succes:true,item:'+JSON.stringify(data))
        }else{
            res.send('success:false, message:'+Message['ItemNotFound']);
        }
    })
})
// /orders route
app.get('/orders',function(req,res){
    ItemModel.find().exec(function(err,data){
        if(err) console.log(err)
        if(data.length){
            res.send('sucess:true,order:'+JSON.stringify(data))
        }
    })
})
// /orders/id 
app.get('/orders/:id',function (req,res){
    ItemModel.find({id:req.params.id},function(err,data){
        if(err) console.log(err)
        if(data.length){
            res.send('sucess:true,\n order:'+JSON.stringify(data))
        }else{
            res.send('sucess:false,message:'+Message['OrderNotFound'])
        }
    })
})
// /orders post route 
app.post('/orders',function(req,res){
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
function verifyAdmin(req,res){
    if(req.get('token') ==process.env.TOKEN){
        return 'OK';
    }else if(req.body===undefined){
        res.send('success:false, messsage:'+Message['InvalidRequest']);   
        return false
    }else{
        res.send("success:false,message:"+Message['Unauthorized']);
        return false 
    }
}

// should be able to received multiple items?
app.post('/items',function(req,res){
    var verify =verifyAdmin(req,res);
    if(verify){           
    // test for input an array active following code should be working 
    // req.body.items.forEach(body => {
    //     console.log(body)
    let body = req.body
    let itemIds=[];
        ItemModel.find({
            type:body.type,
            color:body.color,
            size:body.size,
        },function(err,data){
            if(err) console.log(err)
            // logic need to check out use an id field 
            let id ,stock;
            if(data.length){
                id=data[0].id
                stock=parseInt(data[0].stock)+parseInt(body.stock)
                ItemModel.update({
                    id:id},{stock:stock},function(err,data){
                        if(err) console.log(err)
                    })
                    itemIds.push(id)
            }else{
                ItemModel.find().select('id').sort([['updatedAt', 'ascending']]).exec(function(err,data){
                    if(err) console.log(err)
                    id = data.length+1
                    stock =body.stock
                    ItemModel({
                        id:id,
                        type:body.type,
                        color:body.color,
                        size:body.size,
                        stock:stock
                    }).save(function(err,data){
                        if(err) console.log(err)
                    })
                })
                itemIds.push(body.id)
            }
            res.send('success:true,message:'+itemIds);
        // })
    });
    }
})
// patch for item
app.patch('/item/:id',function(req,res){
    var verify =verifyAdmin(req,res);
    if(verify){
            ItemModel.update({
                id:req.params.id},{stock:req.body.stock},function(err,data){
                    if(err) console.log(err)
                    console.log(data)
                    res.send('You have changed '+data.nModified+' records')
                })
    }
})
// delete items
app.delete('/item/:id',function(req,res){
    var verify =verifyAdmin(req,res);
    if(verify){
        ItemModel.deleteOne({id:req.params.id},function(err,data){
            if(err) console.log(err)
            console.log(data)
            if(data.deletedCount){
                res.send('sucess:true')
            }else{
                res.send('sucess:false,message '+Message['ItemNotFound'])
            }
        })
    }
})

app.listen(3000)
