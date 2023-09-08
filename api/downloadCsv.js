let fetch;

module.exports = async (req, res) => {
    if (!fetch) {
        fetch = (await import('node-fetch')).default;
    }

    const { uri } = req.query;
    const bearerToken = req.headers.authorization;

    console.log(`Received URI: ${uri}`);
    console.log(`Received Bearer Token: ${bearerToken}`);

    if (!uri) {
        console.log("URI missing from query parameters");
        return res.status(400).json({ error: 'URI is required' });
    }

    if (!bearerToken) {
        console.log("Authorization token missing from headers");
        return res.status(401).json({ error: 'Authorization token is missing' });
    }

    try {
        console.log("Attempting to fetch CSV from URI...");
        const response = await fetch(uri, {
            headers: {
                'Authorization': bearerToken
            }
        });

        console.log(`Fetch Response Status: ${response.status}`);
        console.log(`Fetch Response Status Text: ${response.statusText}`);

        if (!response.ok) {
            throw new Error(`Failed to download the CSV: ${response.statusText}`);
        }

        const csvData = await response.text();
        console.log("Successfully fetched CSV data.");
        
        res.setHeader('Content-Type', 'text/csv');
        res.send(csvData);

    } catch (error) {
        console.error(`Error occurred while fetching CSV:`, error);
        res.status(500).json({ error: 'Failed to fetch CSV', details: error.toString() });
    }
};
