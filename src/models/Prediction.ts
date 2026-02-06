import mongoose, { Schema, Model } from 'mongoose';

export interface IPrediction {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    matchId: mongoose.Types.ObjectId;
    predictedTeam: string;
    isCorrect: boolean | null;
    pointsEarned: number | null;
    createdAt: Date;
}

type PredictionModel = Model<IPrediction>;

const PredictionSchema = new Schema<IPrediction, PredictionModel>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    matchId: {
        type: Schema.Types.ObjectId,
        ref: 'Match',
        required: [true, 'Match ID is required'],
    },
    predictedTeam: {
        type: String,
        required: [true, 'Predicted team is required'],
        trim: true,
    },
    isCorrect: {
        type: Boolean,
        default: null,
    },
    pointsEarned: {
        type: Number,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound index to ensure one prediction per user per match
PredictionSchema.index({ userId: 1, matchId: 1 }, { unique: true });

// Index for faster user predictions queries
PredictionSchema.index({ userId: 1, createdAt: -1 });

const Prediction = mongoose.models.Prediction as PredictionModel || mongoose.model<IPrediction, PredictionModel>('Prediction', PredictionSchema);

export default Prediction;
