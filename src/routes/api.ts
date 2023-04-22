import * as express from 'express';
import { Account } from "../models/Account"
import mongoose from 'mongoose';

const router = express.Router();
const version = 1;

router.get(`/${version}`, function(req, res) {
    res.json({
        version: version
    });
});

router.get(`/${version}/accounts/:userId`, async function(req, res) {
    const userID = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userID)) {
        return res.status(400).json({ error: "INVALID_ID" });
    }

    const account = await Account.findById(userID);
    if (!account) {
        return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    res.json(account.getPublicProfile());
})

router.post(`/${version}/accounts`, function(req, res) {

})

export default router