import mongoose from "mongoose";
import { IElement, IElementProperties } from "../types";

const elementPropertiesSchema = new mongoose.Schema<IElementProperties>({
    innerText: String,
    fontSize: String,
    color: String,
    backgroundColor: String,
});

const elementSchema = new mongoose.Schema<IElement>({
    type: { type: String, required: true },
    page: { type: String, required: true },
    selector: { type: String, required: true },
    properties: elementPropertiesSchema,
    project: { type: mongoose.Schema.Types.ObjectId, ref: "project" },
});

const Element = mongoose.model("element", elementSchema);

export default Element;