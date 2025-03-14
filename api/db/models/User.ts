import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  discordAuth: {
    id: { type: String, },
    username: { type: String, },
    globalName: { type: String, },
    avatar: { type: String, },
  },
  googleAuth: {
    id: { type: String, },
    name: { type: String },
    picture: { type: String }
  },
})

const User = mongoose.model('user', UserSchema)

export default User
