const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
var mongodb = require('mongodb');
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'myproject';
var cors = require('cors');

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.sendFile('views/index.html', { root: __dirname })
});

app.get('/user', (req, res) => {
    MongoClient.connect(url, function (err, client) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        findDocuments(db, function (docs) {
            res.send(docs);
        });
    });

    const findDocuments = function (db, callback) {
        const collection = db.collection('documents');
        collection.find(
            // {name:"e"}
        ).toArray(function (err, docs) {
            assert.equal(err, null);
            callback(docs);
        });
    }
});

app.post('/user', (req, res) => {
    let data = req.body;
    MongoClient.connect(url, function (err, client) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        insertDocuments(db, function () {
            findDocuments(db, function (docs) {
                res.send(docs);
            });
        });
    });

    const insertDocuments = function (db, callback) {
        const collection = db.collection('documents');
        collection.insertOne(data.data, function (err, result) {
            console.log("Inserted 1 document into the collection");
            callback(result);
        });
    }

    const findDocuments = function (db, callback) {
        // Get the documents collection
        const collection = db.collection('documents');
        // Find some documents
        collection.find({}).toArray(function (err, docs) {
            assert.equal(err, null);
            callback(docs);
        });
    }
});

app.put('/user/:id', (req, res) => {
    MongoClient.connect(url, function(err, client) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
          editUser(db, function(docs) {
            res.send(docs);
          });
      });
    
    
    const editUser = function(db, callback) {
        const collection = db.collection('documents');
        collection.updateOne({ _id : new mongodb.ObjectID(req.params.id) }
          , { $set: { name : req.body.name, age : req.body.age, weight : req.body.weight, email : req.body.email } },
          function(err, result) {
            assert.equal(err, null);
            assert.equal(1, result.result.n);
            console.log("Updated the document with the field a equal to 2");
            callback(result.result.n ? true: false );
        });  
      }
});

app.delete('/user/:_id', (req, res) => {
    const _id = req.params._id;
    MongoClient.connect(url, function (err, client) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        deleteUser(db, function (docs) {
            res.send(docs);
        });
    });

    const deleteUser = function (db, callback) {
        const collection = db.collection('documents');
        collection.deleteOne({ _id:   new mongodb.ObjectID(_id) }, function(err, result) {
            callback(result.result.n ? true: false );
          });
    }
});


const port = process.env.PORT || 7000;
app.listen(port, () => console.log(`Listening on port ${port}....`));