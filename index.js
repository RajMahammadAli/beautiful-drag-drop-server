require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.az1b78f.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("todoLists");
    const usersCollection = database.collection("todos");

    app.get("/todos", async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/todos", async (req, res) => {
      const todo = req.body;
      const result = await usersCollection.insertOne(todo);
      res.send(result);
      console.log(todo);
      // Your code to handle the request goes here
    });

    app.put("/todos/reorder", async (req, res) => {
      try {
        const { todos } = req.body;
        console.log(todos);
        // Iterate through the reordered todos and update them in the MongoDB collection
        for (const todo of todos) {
          await usersCollection.updateOne(
            { _id: todo._id },
            { $set: { order: todo.order } }
          );
        }

        res.status(200).json({ message: "Todos reordered successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
