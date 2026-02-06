import mongoose, { Schema, Model } from 'mongoose';

export interface IMatch {
    _id: mongoose.Types.ObjectId;
    title: string;
    teamA: string;
    teamB: string;
    teamAFlag?: string;
    teamBFlag?: string;
    matchDate: Date;
    predictionStartDate: Date;
    predictionDeadline: Date;
    status: 'upcoming' | 'live' | 'completed';
    winner: string | null;
    createdAt: Date;
}

export interface SerializedMatch extends Omit<IMatch, '_id'> {
    _id: string;
}

type MatchModel = Model<IMatch>;

const MatchSchema = new Schema<IMatch, MatchModel>({
    title: {
        type: String,
        required: [true, 'Match title is required'],
        trim: true,
    },
    teamA: {
        type: String,
        required: [true, 'Team A is required'],
        trim: true,
    },
    teamB: {
        type: String,
        required: [true, 'Team B is required'],
        trim: true,
    },
    teamAFlag: {
        type: String,
        default: '',
    },
    teamBFlag: {
        type: String,
        default: '',
    },
    matchDate: {
        type: Date,
        required: [true, 'Match date is required'],
    },
    predictionStartDate: {
        type: Date,
        required: [true, 'Prediction start date is required'],
    },
    predictionDeadline: {
        type: Date,
        required: [true, 'Prediction deadline is required'],
    },
    status: {
        type: String,
        enum: ['upcoming', 'live', 'completed'],
        default: 'upcoming',
    },
    winner: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for faster queries
MatchSchema.index({ matchDate: 1 });  // For sorting by date
MatchSchema.index({ status: 1 });     // For filtering by status
MatchSchema.index({ status: 1, matchDate: 1 });  // Compound for common queries

const Match = mongoose.models.Match as MatchModel || mongoose.model<IMatch, MatchModel>('Match', MatchSchema);

export default Match;
