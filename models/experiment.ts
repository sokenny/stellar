import mongoose from "mongoose";
import { IExperiment } from "../types";

const experimentSchema = new mongoose.Schema<IExperiment>({
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    element: { type: mongoose.Schema.Types.ObjectId, ref: "element" },
    variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "variant" }],
    journey: { type: mongoose.Schema.Types.ObjectId, ref: "journey" },
    url: { type: String, required: true },
});

const Experiment = mongoose.model("experiment", experimentSchema);

export default Experiment;