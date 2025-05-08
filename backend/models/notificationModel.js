import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['enrollment'], required: true },
    relatedEntity: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    read: { type: Boolean, default: false }, // Optionally track if the notification was read
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
