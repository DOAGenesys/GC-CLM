let fetch;

module.exports = async (req, res) => {
    if (!fetch) {
        fetch = (await import('node-fetch')).default;
    }

    const { uri } = req.query;
    const bearerToken = req.headers.authorization;

    if (!uri) {
        return res.status(400).json({ error: 'URI is required' });
    }

    if (!bearerToken) {
        return res.status(401).json({ error: 'Authorization token is missing' });
    }

    try {
        const response = await fetch(uri, {
            headers: {
                'Authorization': bearerToken
            }
        });

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
