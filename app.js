const { MongoClient } = require('mongodb')

const url = "mongodb+srv://hsmdev:hsmdev23@learn-mongo-db.hhfhunu.mongodb.net/?appName=learn-mongo-db"

const client = new MongoClient(url)

async function main() {
    try {
        await client.connect()
        console.log("connected!")
        const db = client.db('hsm')
        const collection = db.collection('courses')
        await collection.insertOne({
            title: "n8n",
            price: 5500
        })
        const data = await collection.find().toArray()

        console.log(data)
    }
    catch {
        console.log("error")
    }
}
main()