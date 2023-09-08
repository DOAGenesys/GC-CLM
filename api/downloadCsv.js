const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { uri } = req.query;

    if (!uri) {
        return res.status(400).json({ error: 'URI is required' });
    }

    try {
        const response = await fetch(uri);
        if (!response.ok) {
            throw new Error(`Failed to download the CSV: ${response.statusText}`);
        }

        const csvData = await response.text();
        res.setHeader('Content-Type', 'text/csv');
        res.send(csvData);

    } catch (error) {
        console.error(`Error occurred while fetching CSV:`, error);
        res.status(500).json({ error: 'Failed to fetch CSV', details: error.toString() });
    }
};
