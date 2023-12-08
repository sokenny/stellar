import mongoose from "mongoose";
import { IProject } from "../types";

const projectSchema = new mongoose.Schema<IProject>({
    name: { type: String, required: true },
    domain: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});

const Project = mongoose.model("project", projectSchema);

export default Project;