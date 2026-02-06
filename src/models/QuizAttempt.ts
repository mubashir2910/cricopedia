import mongoose, { Schema, Model } from 'mongoose';

export interface IQuizAttempt {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    quizId: mongoose.Types.ObjectId;
    selectedOption: 'A' | 'B' | null;
    isCorrect: boolean | null;
    pointsAwarded: number;
    startedAt: Date;
    submittedAt: Date | null;
    isTimeout: boolean;
}

type QuizAttemptModel = Model<IQuizAttempt>;

const QuizAttemptSchema = new Schema<IQuizAttempt, QuizAttemptModel>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    quizId: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
        required: [true, 'Quiz ID is required'],
    },
    selectedOption: {
        type: String,
        enum: ['A', 'B', null],
        default: null,
    },
    isCorrect: {
        type: Boolean,
        default: null,
    },
    pointsAwarded: {
        type: Number,
        default: 0,
    },
    startedAt: {
        type: Date,
        required: [true, 'Start time is required'],
    },
    submittedAt: {
        type: Date,
        default: null,
    },
    isTimeout: {
        type: Boolean,
        default: false,
    },
});

// Compound index to ensure one attempt per user per quiz
QuizAttemptSchema.index({ userId: 1, quizId: 1 }, { unique: true });

// Index for user quiz history queries
QuizAttemptSchema.index({ userId: 1, startedAt: -1 });

const QuizAttempt = mongoose.models.QuizAttempt as QuizAttemptModel ||
    mongoose.model<IQuizAttempt, QuizAttemptModel>('QuizAttempt', QuizAttemptSchema);

export default QuizAttempt;
