import { Document } from 'mongoose';

export default interface IUser extends Document {
    fullname: string;
    email: string;
    password: string;
}
