import Enrollment from '../models/enrollModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

// Enroll Student
const enrollStudent = async (req, res) => {
    const { studentId, teacherId } = req.body;

    try {
        const student = await User.findById(studentId);
        const teacher = await User.findById(teacherId);

        if (!student || !teacher) {
            return res.status(400).json({ message: 'Invalid student or teacher.' });
        }

        const enrollmentPending = await Enrollment.findOne({
            student: studentId,
            teacher: teacherId,
            status: 'pending',
        });

        if (enrollmentPending) {
            return res.status(400).json({
                message: 'You have already requested enrollment with this teacher. Please wait for the teacher\'s response.',
            });
        }

        const existingEnrollment = await Enrollment.findOne({
            student: studentId,
            teacher: teacherId,
            status: { $ne: 'pending' },
        });

        if (existingEnrollment) {
            return res.status(400).json({
                message: 'You are already enrolled with this teacher.',
            });
        }

        const enrollment = new Enrollment({
            student: studentId,
            teacher: teacherId,
            status: 'pending',
        });

        await enrollment.save();

        const notification = new Notification({
            message: `You have a new enrollment request from ${student.firstName} ${student.lastName}.`,
            recipient: teacher._id,
            type: 'enrollment',
            relatedEntity: student._id,
        });

        await notification.save();

        teacher.notifications.push(notification._id);
        await teacher.save();

        res.status(200).json({ message: 'Enrollment request sent to teacher!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong with enrollment.' });
    }
};

// Handle Enrollment Status (Approve or Reject)
const handleEnrollmentStatus = async (req, res) => {
    const { enrollmentId, status } = req.body;

    try {
        const enrollment = await Enrollment.findById(enrollmentId).populate('student teacher');

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found.' });
        }

        if (enrollment.teacher._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this enrollment.' });
        }

        enrollment.status = status;
        await enrollment.save();

        const notification = new Notification({
            message: `Your enrollment request with ${enrollment.teacher.firstName} ${enrollment.teacher.lastName} has been ${status}.`,
            recipient: enrollment.student._id,
            type: 'enrollment',
            relatedEntity: enrollment.teacher._id,
        });

        await notification.save();

        const student = await User.findById(enrollment.student._id);
        student.notifications.push(notification._id);
        await student.save();

        res.status(200).json({ message: 'Enrollment status updated successfully.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong with status update.' });
    }
};

// Get Enrolled Students
const getEnrolledStudents = async (req, res) => {
    try {
        const teacherId = req.user.id; // Make sure you're using req.user._id, which is populated by the authUser middleware

        // Debugging: Log teacherId
        console.log('Teacher ID:', teacherId);

        const enrollments = await Enrollment.find({ teacher: teacherId, status: 'approved' })
            .populate('student', 'firstName lastName email');

        if (enrollments.length === 0) {
            return res.status(404).json({ message: 'No students enrolled with you.' });
        }

        const students = enrollments.map(enrollment => ({
            name: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
            email: enrollment.student.email,
        }));

        res.status(200).json(students);

    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: 'Something went wrong while fetching students.' });
    }
};

// Get Pending Enrollment Requests for a Teacher
const getPendingRequests = async (req, res) => {
    try {
        const teacherId = req.user.id;

        const requests = await Enrollment.find({
            teacher: teacherId,
            status: 'pending',
        })
            .populate('student', 'firstName lastName email')
            .sort({ createdAt: -1 });

        const formatted = requests.map(req => ({
            _id: req._id,
            student: {
                name: `${req.student.firstName} ${req.student.lastName}`,
                email: req.student.email,
            },
            createdAt: req.createdAt,
        }));

        res.status(200).json({ requests: formatted });

    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'Failed to fetch enrollment requests.' });
    }
};

// Approve or Reject Request via ID
const updateEnrollmentById = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const enrollment = await Enrollment.findById(id).populate('student teacher');

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment request not found.' });
        }

        if (enrollment.teacher.id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Unauthorized action.' });
        }

        // Delete the old notification for the teacher
        const notificationToDelete = await Notification.findOneAndDelete({
            recipient: enrollment.teacher.id,
            relatedEntity: enrollment.student.id,
            type: 'enrollment',
        });

        if (notificationToDelete) {
            await User.updateOne(
                { _id: enrollment.teacher.id },
                { $pull: { notifications: notificationToDelete.id } }
            );
        }

        // Update enrollment status
        enrollment.status = status;
        await enrollment.save();

        // Notify student
        const notification = new Notification({
            message: `Your enrollment request with ${enrollment.teacher.firstName} ${enrollment.teacher.lastName} was ${status}.`,
            recipient: enrollment.student.id,
            type: 'enrollment',
            relatedEntity: enrollment.teacher.id,
        });

        await notification.save();

        const student = await User.findById(enrollment.student.id);
        student.notifications.push(notification.id);
        await student.save();

        res.status(200).json({ message: `Enrollment request ${status}.` });

    } catch (error) {
        console.error('Failed to update enrollment:', error);
        res.status(500).json({ message: 'Failed to process request.' });
    }
};





export { handleEnrollmentStatus, enrollStudent, getEnrolledStudents, getPendingRequests, updateEnrollmentById };
