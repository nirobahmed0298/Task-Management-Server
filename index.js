require('dotenv').config();
let express = require('express');
let app = express();
let cors = require('cors');
require('dotenv').config()

let port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


let { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
let uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z7tru.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
let client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// JWT  require('crypto').randomBytes(64).toString('hex')

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        let tasksCollection = client.db("TaskManagement").collection("tasks");
        let usersCollection = client.db("TaskManagement").collection("users");
        // Task
        app.post("/tasks", async (req, res) => {
            let tasks = req.body;
            let result = await tasksCollection.insertOne(tasks);
            res.send(result);
        });
        app.get("/tasks", async (req, res) => {
            let result = await tasksCollection.find().toArray();
            res.send(result);
        });
        app.get("/tasks/:id", async (req, res) => {
            let id = req.params.id;
            let query = { _id: new ObjectId(id) }
            let result = await tasksCollection.findOne(query);
            res.send(result)
        })
        app.put('/tasks/:id', async (req, res) => {
            let id = req.params.id
            let filter = { _id: new ObjectId(id) }
            let options = { upsert: true };
            let TaskData = req.body;
            let updateTask = {
                $set: {
                    title: TaskData.title,
                    description: TaskData.description,
                    category: TaskData.category,
                    timestamp: TaskData.timestamp,
                }
            }
            let result = await tasksCollection.updateOne(filter, updateTask, options);
            console.log(result);
            res.send(result)
        })
        app.delete('/tasks/:id', async (req, res) => {
            let id = req.params.id;
            let query = { _id: new ObjectId(id) }
            let result = await tasksCollection.deleteOne(query);
            res.send(result)
        })

        // Users
        app.post("/users", async (req, res) => {
            let user = req.body;
            let query = { email: user.email };
            let existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: "user already exists", insertedId: null });
            }
            let result = await usersCollection.insertOne(user);
            res.send(result);
        });




        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Task Management Running')
})

app.listen(port, () => {
    console.log(`Task Management is sitting on port ${port}`);
})