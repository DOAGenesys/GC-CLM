const fetch = require('node-fetch');

async function handleContactListSelection(platformClient, contactListId, clientId) {
    try {
        await initiateContactListExport(platformClient, contactListId, clientId);
        const downloadId = await getDownloadUrl(platformClient, contactListId, clientId);
        const finalUri = await getFinalDownloadUrl(downloadId);
        const csvData = await downloadExportedCsv(finalUri);
        return csvData;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function initiateContactListExport(platformClient, contactListId, clientId) {
    const apiInstance = new platformClient.OutboundApi();
    const response = await apiInstance.postOutboundContactlistExport(contactListId);
    console.log('Export initiated:', response);
    await new Promise(resolve => setTimeout(resolve, 2000));
}

async function getDownloadUrl(platformClient, contactListId, clientId) {
    const apiInstance = new platformClient.OutboundApi();
    const data = await apiInstance.getOutboundContactlistExport(contactListId);
    console.log(`getOutboundContactlistExport success! data: ${JSON.stringify(data, null, 2)}`);
    const downloadId = data.uri.split('/').pop();
    return downloadId;
}

async function getFinalDownloadUrl(downloadId) {
    const url = `https://api.mypurecloud.ie/api/v2/downloads/${downloadId}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error fetching final download URL: ${response.statusText}`);
    }
    const data = await response.json();
    return data.uri;
}

async function downloadExportedCsv(uri) {
    const response = await fetch(uri);
    if (!response.ok) {
        throw new Error(`Error downloading CSV: ${response.statusText}`);
    }
    return await response.text();
}

module.exports = async (req, res) => {
    const { platformClient, contactListId, clientId } = req.body;
    
    try {
        const csvData = await handleContactListSelection(platformClient, contactListId, clientId);
        res.json({ csvData });
    } catch (error) {
        console.error(`Error occurred:`, error.toString());
        res.status(500).json({ error: 'An error occurred while processing request', details: error.toString() });
    }
};
