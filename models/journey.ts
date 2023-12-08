import mongoose from "mongoose";
import { IJourney } from "../types";

const journeySchema = new mongoose.Schema<IJourney>({
    name: { type: String, required: true },
    page: { type: String, required: true },
    experiments: [{ type: mongoose.Schema.Types.ObjectId, ref: "experiment" }],
    project: { type: mongoose.Schema.Types.ObjectId, ref: "project" },
});

const Journey = mongoose.model("journey", journeySchema);

export default Journey;