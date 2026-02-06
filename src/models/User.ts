import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    phoneNumber: string;
    displayName?: string;
    signupIP?: string;
    signupCoords?: {
        lat: number;
        lng: number;
    };
    points: number;
    correctPredictions: number;
    wrongPredictions: number;
    currentStreak: number;
    longestStreak: number;
    badges: string[];
    lastPredictionDate: Date | null;
    isFlagged: boolean;
    flagReason?: string;
    warningsSent: number;
    timesCaught: number;
    createdAt: Date;
}

interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
    },
    displayName: {
        type: String,
        trim: true,
        maxlength: [30, 'Display name cannot exceed 30 characters'],
    },
    signupIP: {
        type: String,
    },
    signupCoords: {
        lat: Number,
        lng: Number,
    },
    points: {
        type: Number,
        default: 0,
    },
    correctPredictions: {
        type: Number,
        default: 0,
    },
    wrongPredictions: {
        type: Number,
        default: 0,
    },
    currentStreak: {
        type: Number,
        default: 0,
    },
    longestStreak: {
        type: Number,
        default: 0,
    },
    badges: {
        type: [String],
        default: [],
    },
    lastPredictionDate: {
        type: Date,
        default: null,
    },
    isFlagged: {
        type: Boolean,
        default: false,
    },
    flagReason: {
        type: String,
    },
    warningsSent: {
        type: Number,
        default: 0,
    },
    timesCaught: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Index for leaderboard sorting (points DESC, correctPredictions DESC)
UserSchema.index({ points: -1, correctPredictions: -1 });

const User = mongoose.models.User as UserModel || mongoose.model<IUser, UserModel>('User', UserSchema);

export default User;

