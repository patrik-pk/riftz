import mongoose from 'mongoose'
const db = process.env.mongoURI

const connectDb = async () => {
  if (!db) {
    console.error('No database found')
    return
  }

  try {
    await mongoose.connect(db)

    console.log('MongoDB connected')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

export default connectDb
