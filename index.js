const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config();

// middle wares
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qbh9oi5.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const recipeCollection = client.db('unique-recipe').collection('recipe');
        const reviewCollection = client.db('unique-recipe').collection('review');
        
        
        app.get('/recipes', async (req, res) => {
            const query = {};
            const cursor = recipeCollection.find(query).sort( { _id: -1 } );
            const recipe = await cursor.toArray();
            res.send(recipe);
        });

        app.post('/recipes', async (req, res) => {
            const recipes = req.body;
            const recipe = await recipeCollection.insertOne(recipes);
            res.send(recipe);
        });

        app.get('/recipe', async (req, res) => {
            const query = {};
            const cursor = recipeCollection.find(query);
            const recipe = await cursor.limit(3).toArray();
            res.send(recipe);
        });

        app.get('/recipes/:id', async(req,res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const recipeDetails = await recipeCollection.findOne(query);
            res.send(recipeDetails);
        });

        app.get('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewCollection.findOne(query);
            res.send(result);
        })

        app.post('/review', async(req, res) => {
            const review = req.body;
            const result =await reviewCollection.insertOne(review);
            res.send(result);
        });

        app.get('/reviews', async (req, res) => {          
            let query = {};
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }

            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/specificreviews', async (req, res) => {          
            let query = {};
            console.log('Recipe', req.query.recipe);
            if(req.query.recipe){

                query = {
                    recipe: req.query.recipe
                }

            }

            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.put('/review/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const review = req.body;
            const option = {upsert: true};
            const updatedReview = {
                $set: {
                    review: review.review
                }
            }
            const result = await reviewCollection.updateOne(filter, updatedReview, option);
            res.send(result);
        })


        app.delete('/reviews/:id', async (req,res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally {

    }
}

run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('Unique Recipe Server is running');
});

app.listen(port, () => {
    console.log(`Unique Recipe Server running on ${port}`);
})