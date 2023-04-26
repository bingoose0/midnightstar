import { Schema, model } from "mongoose";

const saleSchema = new Schema({
    sellerID: { type: Array, required: true },
    buyer: { type: String, required: true, default: "N/A" },
    buyerGuild: { type: String, required: true, default: "N/A" },
    items: { type: String, required: true }, // json
    total: { type: Number, required: true } 
})

export default model("Sale", saleSchema);