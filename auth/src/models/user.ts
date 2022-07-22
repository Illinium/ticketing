import { Model, Document, Schema, model } from "mongoose";
import { Password } from "../services/password";

// An interface that describes the properties that are requried to creat a new User
interface UserAttrs {
    email: string;
    password: string;
}

// An interface that describes the properties that the User Model has
interface userModel extends Model<userDoc> {
    build(attrs: UserAttrs): userDoc;
}

// An interface that describes the properties that the User Document has
interface userDoc extends Document {
    email: string;
    password: string;
}

const userSchema = new Schema({
    email: {
        type: String,
        required: true,      
    },
    password: {
        type: String,
        required: true
    }
    },
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.password
                delete ret.__v
                ret.id = ret._id
                delete ret._id
            }
        }
    
});

userSchema.pre('save', async function(done){
    if(this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
}

const User = model<userDoc, userModel>('User', userSchema);

export {User};