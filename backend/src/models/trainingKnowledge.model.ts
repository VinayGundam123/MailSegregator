import mongoose, { Schema, Document } from 'mongoose';

export interface ITrainingKnowledge extends Document {
  text: string;
  embedding: number[];
  createdAt: Date;
}

const TrainingKnowledgeSchema = new Schema<ITrainingKnowledge>({
  text: {
    type: String,
    required: true,
    index: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient vector search
TrainingKnowledgeSchema.index({ text: 'text' });

export default mongoose.model<ITrainingKnowledge>('TrainingKnowledge', TrainingKnowledgeSchema);
