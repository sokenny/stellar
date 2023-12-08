import mongoose from "mongoose";
import { IVariant } from "../types";

const variantSchema = new mongoose.Schema<IVariant>({
    element: { type: mongoose.Schema.Types.ObjectId, ref: "element" },
    text: { type: String, required: false },
    fontSize: { type: String, required: false },
    color: { type: String, required: false },
    backgroundColor: { type: String, required: false },
    experiment: { type: mongoose.Schema.Types.ObjectId, ref: "experiment" },
});

const Variant = mongoose.model("variant", variantSchema);

export default Variant;