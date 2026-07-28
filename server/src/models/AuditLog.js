import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    role: {
      type: String,
      required: true,
      immutable: true,
    },
    action: {
      type: String,
      required: true,
      immutable: true,
    },
    entity: {
      type: String,
      required: true,
      immutable: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      immutable: true,
    },
    metadata: {
      type: Object,
      immutable: true,
    },
    ip: {
      type: String,
      immutable: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 🚫 Prevent updates
auditLogSchema.pre("updateOne", function () {
  throw new Error("Audit logs are immutable");
});
auditLogSchema.pre("findOneAndUpdate", function () {
  throw new Error("Audit logs are immutable");
});
auditLogSchema.pre("deleteOne", function () {
  throw new Error("Audit logs cannot be deleted");
});
auditLogSchema.pre("findOneAndDelete", function () {
  throw new Error("Audit logs cannot be deleted");
});

export default mongoose.model("AuditLog", auditLogSchema);
