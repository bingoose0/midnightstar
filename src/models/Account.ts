import { Schema, model, Model } from "mongoose";
import * as bcrypt from "bcrypt";

const SALT_WORK_FACTOR = 10;

export interface IAccount {
    name: string,
    password: string,
    steamID: string
}

interface IAccountMethods {
    comparePassword(candidate: string, callback: any): void,
    getPublicProfile(): any
}

export type AccountModel = Model<IAccount, {}, IAccountMethods>;

const AccountSchema = new Schema<IAccount, AccountModel, IAccountMethods>({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    steamID: { type: String, required: true, unique: true },
})

AccountSchema.pre("save", function(next) {
    const user = this;

    if (!user.isModified("password")) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        })
    })
})

AccountSchema.methods.comparePassword = function(candidate: string, callback: any) {
    bcrypt.compare(candidate, this.password, function(err, match) {
        if (err) return callback(err);

        callback(null, match);
    })
}

AccountSchema.methods.getPublicProfile = function() {
    return { id: this._id, name: this.user }
}

export const Account = model<IAccount, AccountModel>("Account", AccountSchema);