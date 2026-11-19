module.exports = {
    login: async (req, res) => {
        try {
            const { passcode } = req.body;
            const validPasscode = process.env.ADMIN_PASSCODE || '1234';

            if (passcode === validPasscode) {
                return res.status(200).json({ success: true, message: 'Authorized' });
            } else {
                return res.status(401).json({ success: false, message: 'Invalid passcode' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};