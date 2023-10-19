const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5001;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_KEY}@cluster0.ltwp59m.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const brandsCollection = client.db('brandsDB').collection('brands');
    const productsCollection = client.db('brandsDB').collection('products');

    app.get('/brands', async (req, res) => {
      const cursor = brandsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post('/brands', async (req, res) => {
      const brand = req.body;
      const result = await brandsCollection.insertOne(brand);
      res.send(result);
    });

    app.get('/brands/:name', async (req, res) => {
      const brand = req.params.name;
      const query = { brandName: brand };
      const result = await brandsCollection.findOne(query);
      res.send(result);
    });

    // Add Product
    app.post('/products', async (req, res) => {
      const products = req.body;
      const result = await productsCollection.insertOne(products);
      res.send(result);
    });

    app.get('/products', async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/products/:name', async (req, res) => {
      const brand = req.params.name;
      console.log(brand);
      const query = { brandName: brand };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Brands server is running');
});

app.listen(port, () => {
  console.log(`Brands server is running on port ${port}`);
});
