import mongoose, { Schema, Model } from 'mongoose';

export interface ITournament {
    _id: mongoose.Types.ObjectId;
    name: string;
    isActive: boolean;
    isCompleted: boolean;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
}

type TournamentModel = Model<ITournament>;

const TournamentSchema = new Schema<ITournament, TournamentModel>({
    name: {
        type: String,
        required: [true, 'Tournament name is required'],
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Tournament = mongoose.models.Tournament as TournamentModel || mongoose.model<ITournament, TournamentModel>('Tournament', TournamentSchema);

export default Tournament;
