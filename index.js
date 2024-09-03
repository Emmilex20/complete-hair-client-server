const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
console.log(process.env.DB_USER); // remove this after you've confirmed it is working
const User = require("../server/api/models/User"); // Import the User model
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../server/api/models/Payments"); // Adjust the path accordingly

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve static files from the 'public' directory

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.m2iadnv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`
  )
  .then(() => console.log("Successfully connected to MongoDB!"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err.message));

// jwt authentication
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  res.send({ token });
});

// MongoDB connection setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.m2iadnv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const userRoutes = require("./api/routes/UserRoutes");
app.use("/users", userRoutes);

// Function to get summary data
async function getSummaryData() {
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.m2iadnv.mongodb.net/Kachi-Store?retryWrites=true&w=majority`;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        
        const kachiStoreDB = client.db("Kachi-Store");
        const testDB = client.db("test");
        
        const hairItemsCount = await kachiStoreDB.collection("hairs").countDocuments();
        const paymentsCount = await testDB.collection("payments").countDocuments();
        
        console.log(`Total hair items: ${hairItemsCount}`);
        console.log(`Total payments: ${paymentsCount}`);
    } finally {
        await client.close();
    }
}

async function run() {
    try {
        console.log("Connecting to MongoDB...");
        await client.connect();
        console.log("Connected to MongoDB!");

        // Call getSummaryData function here
        await getSummaryData();

        const hairsCollection = client.db("Kachi-Store").collection("hairs");
        const cartCollections = client.db("Kachi-Store").collection("cartItems");
        const userCollections = client.db("Kachi-Store").collection("users");
        const paymentRoutes = require("./api/routes/paymentRoutes");
        const adminStats = require("./api/routes/AdminStats");
        const orderStats = require("./api/routes/orderStats");
        app.use("/payments", paymentRoutes);
        app.use("/adminStats", adminStats);
        app.use("/orderStats", orderStats);

        // Define a root route
        app.get("/", async (req, res) => {
            res.send("Hello, this is the root route!");
        });

        // Insert new hair data
        app.post("/all-hairs", async (req, res) => {
            try {
                const data = { ...req.body, createdAt: new Date() }; // Add timestamp
                const result = await hairsCollection.insertOne(data);
                res.status(201).send(result);
            } catch (error) {
                console.error("Error inserting document:", error);
                res.status(500).send({ error: "Failed to insert document" });
            }
        });

        // All carts operations

        // Posting cart to DB
        app.post("/carts", async (req, res) => {
            const cartItem = req.body;
            const result = await cartCollections.insertOne(cartItem);
            res.send(result);
        });

        // Get carts using email
        app.get("/carts", async (req, res) => {
            const email = req.query.email;
            const filter = { email: email };
            const result = await cartCollections.find(filter).toArray();
            res.send(result);
        });

        // Delete items from cart
        app.delete("/carts/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await cartCollections.deleteOne(filter);
            res.send(result);
        });

        // Update carts quantity
        app.put("/carts/:id", async (req, res) => {
            const id = req.params.id;
            const { quantity } = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: parseInt(quantity, 10),
                },
            };

            const result = await cartCollections.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // Get specific hair data
        app.get("/carts/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await hairsCollection.findOne(filter);
            res.send(result);
        });

        // Update hair data
        app.patch("/hair/:id", async (req, res) => {
            const id = req.params.id;
            const updateHairData = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: updateHairData,
            };

            try {
                console.log("Updating document with ID:", id);
                const existingDocument = await hairsCollection.findOne(filter);
                if (!existingDocument) {
                    return res.status(404).send({ error: "Document not found" });
                }

                const result = await hairsCollection.updateOne(filter, updateDoc, {
                    upsert: true,
                });
                res.status(200).send(result);
            } catch (error) {
                console.error("Error updating document:", error);
                res.status(500).send({ error: "Failed to update document" });
            }
        });

        // Delete hair data
        app.delete("/hair/:id", async (req, res) => {
            const id = req.params.id;

            if (!ObjectId.isValid(id)) {
                return res.status(400).send({ error: "Invalid ID format" });
            }

            const filter = { _id: new ObjectId(id) };

            try {
                const result = await hairsCollection.deleteOne(filter);
                if (result.deletedCount === 0) {
                    return res.status(404).send({ error: "Document not found" });
                }
                res.status(200).send({ message: "Document deleted successfully" });
            } catch (error) {
                console.error("Error deleting document:", error);
                res.status(500).send({ error: "Failed to delete document" });
            }
        });

        // Find by category
        app.get("/all-hairs", async (req, res) => {
            let query = {};
            if (req.query.category) {
                query = { category: req.query.category };
            }

            try {
                const result = await hairsCollection.find(query).sort({ createdAt: -1 }).toArray(); // Sort by createdAt in descending order
                res.status(200).send(result);
            } catch (error) {
                console.error("Error fetching documents:", error);
                res.status(500).send({ error: "Failed to fetch documents" });
            }
        });

        // Get single hair data
        app.get("/hair/:id", async (req, res) => {
            const id = req.params.id;

            // Validate the ObjectId
            if (!ObjectId.isValid(id)) {
                return res.status(400).send({ error: "Invalid ID format" });
            }

            const filter = { _id: new ObjectId(id) };

            try {
                const result = await hairsCollection.findOne(filter);

                if (!result) {
                    return res.status(404).send({ error: "Hair not found" });
                }

                res.status(200).send(result);
            } catch (error) {
                console.error("Error fetching document:", error);
                res.status(500).send({ error: "Failed to fetch document" });
            }
        });

        // Stripe payment gateway integration
        app.post("/create-payment-intent", async (req, res) => {
            const { price } = req.body;
            const amount = price * 100; // Convert to cents
        
            try {
                // Create a PaymentIntent with the order amount and currency
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amount,
                    currency: "ngn",
                    payment_method_types: ["card"],
                });
        
                res.send({
                    clientSecret: paymentIntent.client_secret,
                    dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
                });
            } catch (error) {
                console.error("Error creating payment intent:", error);
                res.status(500).send({ error: "Failed to create payment intent" });
            }
        });

        // Server and MongoDB readiness check
        await client.db("admin").command({ ping: 1 });
        console.log("Successfully connected to MongoDB!");

        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1); // Exit the process with failure
    }
}

// Run the server
run().catch(console.dir);
