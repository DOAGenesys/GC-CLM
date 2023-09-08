module.exports = (req, res) => {
    const { downloadId } = req.query;

    if (!downloadId) {
        return res.status(400).json({ error: 'downloadId is required' });
    }

    const url = `https://api.mypurecloud.ie/api/v2/downloads/${downloadId}`;
    res.json({ downloadUrl: url });
};
