// Express route to verify Google reCAPTCHA token
import express from 'express';
import axios from 'axios';
const router = express.Router();

// POST /api/verify-recaptcha
router.post('/verify-recaptcha', async (req, res) => {
    const { token } = req.body;
    const secret = import.meta.env.VITE_RECAPTCHA_SECRET_KEY;
    if (!token) {
        return res.status(400).json({ success: false, error: 'No token provided' });
    }
    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret,
                    response: token,
                },
            }
        );
        if (response.data.success) {
            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, error: 'reCAPTCHA failed', details: response.data });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
    }
});

export default router;
