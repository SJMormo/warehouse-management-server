const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json());

// db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u92dh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();

        const inventoryCollection = client.db('warehouse-management').collection('inventory');

        // load inventory data to frontend
        app.get('/inventory', async (req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const inventory = await cursor.toArray();
            res.send(inventory);
        });

        // for each of the inventory data
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const inventory = await inventoryCollection.findOne(query);
            res.send(inventory);
        });

        // update quantity 
        app.put('/updateQuantity/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: updatedQuantity
            };
            const result = await inventoryCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        // delete a inventory
        app.delete('/manageinventories/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        });

        // add new item
        app.post('/inventory', async (req, res) => {
            const newInventory = req.body;
            const result = await inventoryCollection.insertOne(newInventory);
            res.send(result);
        });

        // filtered getItem
        app.get('/inventoryfilter', async (req, res) => {
            const email = req.query.email;
            console.log(email);
            const query = { email: email };
            const cursor = inventoryCollection.find(query);
            const inventory = await cursor.toArray();
            res.send(inventory);
        });
    }
    finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('warehouse server is running');
});
app.listen(port, () => {
    console.log('server is running on port ', port);
})