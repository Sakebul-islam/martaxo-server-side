require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();
const cors = require('cors');

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

const dbConnect = async () => {
  try {
    client.connect();
    console.log(' Database Connected Successfully✅ ');
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();

const brandsCollection = client.db('brandsDB').collection('brands');
const productsCollection = client.db('brandsDB').collection('products');
const cartCollection = client.db('brandsDB').collection('carts');

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

// get all products
app.get('/products', async (req, res) => {
  const cursor = productsCollection.find();
  const result = await cursor.toArray();
  res.send(result);
});

// get single product info
app.get('/products/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await productsCollection.findOne(query);
  res.send(result);
});

app.get('/products/brands/:brandpath', async (req, res) => {
  const brand = req.params.brandpath;
  const query = { brandName: brand };
  const result = await productsCollection.find(query).toArray();
  res.send(result);
});

app.put('/products/:id', async (req, res) => {
  const id = req.params.id;
  const updatedProduct = req.body;
  const filter = { _id: new ObjectId(id) };
  const product = {
    $set: {
      itemName: updatedProduct.itemName,
      itemImage: updatedProduct.itemImage,
      brandName: updatedProduct.brandName,
      itemCatagory: updatedProduct.itemCatagory,
      itemPrice: updatedProduct.itemPrice,
      discription: updatedProduct.discription,
      rating: updatedProduct.rating,
    },
  };
  const result = await productsCollection.updateOne(filter, product);
  res.send(result);
});

// Cart Section
app.post('/cart', async (req, res) => {
  const cartData = req.body;
  const existingCartItem = await cartCollection.findOne({
    itemName: cartData.itemName,
    userEmail: cartData.userEmail,
  });

  if (existingCartItem) {
    const updatedQuantity = existingCartItem.quantity + 1;
    const result = await cartCollection.updateOne(
      { _id: existingCartItem._id },
      { $set: { quantity: updatedQuantity } }
    );
    res.send(result);
  } else {
    const result = await cartCollection.insertOne(cartData);
    res.send(result);
  }
});

app.put('/cart/:id', async (req, res) => {
  const itemId = req.params.id;
  const { quantity } = req.body;
  const updatedItem = await cartCollection.findOneAndUpdate(
    { _id: new ObjectId(itemId) },
    { $set: { quantity: quantity } },
    { returnOriginal: false }
  );
  res.send(updatedItem);
});

app.delete('/cart/delete/:id', async (req, res) => {
  const itemId = req.params.id;
  const result = await cartCollection.deleteOne({
    _id: new ObjectId(itemId),
  });
  res.send(result);
});

app.get('/cart/:email', async (req, res) => {
  const userMail = req.params.email;
  const query = { userEmail: userMail };
  const result = await cartCollection.find(query).toArray();
  res.send(result);
});

app.get('/', (req, res) => {
  res.send('Brands server is running');
});

app.listen(port, () => {
  console.log(`Brands server is running on port ${port}`);
});
