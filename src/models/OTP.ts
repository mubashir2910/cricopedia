import mongoose, { Schema, Model } from 'mongoose';

export interface IOTP {
    _id: mongoose.Types.ObjectId;
    email: string;
    otp: string;
    createdAt: Date;
    expiresAt: Date;
}

type OTPModel = Model<IOTP>;

const OTPSchema = new Schema<IOTP, OTPModel>({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }, // Auto-delete when expired
    },
});

// Create compound index for faster lookups
OTPSchema.index({ email: 1, otp: 1 });

const OTP = mongoose.models.OTP as OTPModel || mongoose.model<IOTP, OTPModel>('OTP', OTPSchema);

export default OTP;
