import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to student
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to teacher
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Enrollment status
        dateEnrolled: { type: Date, default: Date.now }, // Date the student enrolled
    },
    { timestamps: true }
);

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
