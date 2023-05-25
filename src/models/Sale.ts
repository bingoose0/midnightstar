import { Schema, model } from "mongoose";

const saleSchema = new Schema({
    sellerID: { type: String, required: true },
    buyer: { type: String, required: true, default: "N/A" },
    buyerGuild: { type: String, required: true, default: "N/A" },
    items: { type: String, required: true }, // json
    total: { type: Number, required: true },
    timestamp: { type: Number }
})

export default model("Sale", saleSchema);