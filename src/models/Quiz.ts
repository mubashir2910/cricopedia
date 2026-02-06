import mongoose, { Schema, Model } from 'mongoose';

export interface IQuiz {
    _id: mongoose.Types.ObjectId;
    questionNumber: number;
    questionText: string;
    optionA: string;
    optionB: string;
    correctOption: 'A' | 'B';
    startTime: Date;
    endTime: Date;
    status: 'draft' | 'scheduled' | 'live' | 'ended';
    correctPoints: number;
    wrongPenalty: number;
    createdAt: Date;
}

type QuizModel = Model<IQuiz>;

const QuizSchema = new Schema<IQuiz, QuizModel>({
    questionNumber: {
        type: Number,
        required: [true, 'Question number is required'],
        unique: true,
    },
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
    },
    optionA: {
        type: String,
        required: [true, 'Option A is required'],
        trim: true,
    },
    optionB: {
        type: String,
        required: [true, 'Option B is required'],
        trim: true,
    },
    correctOption: {
        type: String,
        enum: ['A', 'B'],
        required: [true, 'Correct option is required'],
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required'],
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required'],
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'live', 'ended'],
        default: 'draft',
    },
    correctPoints: {
        type: Number,
        default: 5,
    },
    wrongPenalty: {
        type: Number,
        default: 1,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for faster queries
QuizSchema.index({ questionNumber: 1 }, { unique: true });
QuizSchema.index({ status: 1 });
QuizSchema.index({ startTime: 1 });
QuizSchema.index({ status: 1, startTime: 1 });

const Quiz = mongoose.models.Quiz as QuizModel || mongoose.model<IQuiz, QuizModel>('Quiz', QuizSchema);

export default Quiz;
