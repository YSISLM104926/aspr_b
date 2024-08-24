const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.b0di4c5.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: 'https://aspr.vercel.app', // Update this with your client URL
    allowedHeaders: ['Authorization', 'Content-Type'],
}));


async function run() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB");
        // database
        const db = client.db('aspr');
        // Collections
        const animalCollection = db.collection('animal');
        const categoryNameCollection = db.collection('categoryName');

        app.get('/categories', async (req, res) => {
            try {
                const result = await categoryNameCollection.find({ name: { $ne: 'AllAnimal' } }).toArray();
                res.send(result);
            } catch (error) {
                console.error("Error fetching categories:", error);
                res.status(500).send({ error: "An error occurred while fetching categories" });
            }
        });


        app.post('/categories', async (req, res) => {
            const categories = req.body;
            const result = await categoryNameCollection.insertOne(categories);
            res.send(result);
        })

        app.post('/animal', async (req, res) => {
            const categories = req.body;
            const result = await animalCollection.insertOne(categories);
            res.send(result);
        })

        app.get('/animal', async (req, res) => {
            try {
                const name = req.query.selectedName;
                console.log(name);

                let categories = {};

                // If the query parameter 'selectedName' exists, filter by category
                if (name) {
                    categories = { category: name };
                }

                if (categories.category === 'undefined' || categories.category === 'AllAnimal') {
                    categories = {};
                }

                console.log('cate', categories)
                // Find animals based on the query, or return all if no query is provided
                const result = await animalCollection.find(categories).toArray();
                res.send(result);
                console.log(result);
            } catch (error) {
                console.error("Error fetching animals:", error);
                res.status(500).send({ error: "An error occurred while fetching data" });
            }
        });

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

    } finally {
    }
}
run().catch();