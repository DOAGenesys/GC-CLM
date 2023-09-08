let selectedContactListId;
let csvData;

async function handleContactListSelection(platformClient, contactListId, clientId) {
  selectedContactListId = contactListId;
  return await initiateContactListExport(platformClient, contactListId, clientId);
}

async function initiateContactListExport(platformClient, contactListId, clientId) {
  const apiInstance = new platformClient.OutboundApi();
  try {
    const response = await apiInstance.postOutboundContactlistExport(contactListId);
    console.log('Export initiated:', response);
    return new Promise(resolve => {
      setTimeout(async () => {
        const csvContent = await getDownloadUrl(platformClient, contactListId, clientId);
        resolve(csvContent);
      }, 2000);
    });
  } catch (error) {
    console.error('Error iniciando contact list export:', error);
    throw error;
  }
}

async function getDownloadUrl(platformClient, contactListId, clientId, tries = 0) {
  const apiInstance = new platformClient.OutboundApi();
  try {
    const data = await apiInstance.getOutboundContactlistExport(contactListId);
    console.log(`getOutboundContactlistExport success! data: ${JSON.stringify(data, null, 2)}`);
    console.log('Download URL recuperada:', data.uri);
    const downloadId = data.uri.split('/').pop();
    return await getFinalDownloadUrl(downloadId);
  } catch (err) {
    console.log("Ha habido un fallo recuperando la URL de exportación");
    console.error(err);
    throw err;
  }
}

async function getFinalDownloadUrl(downloadId) {
    const response = await fetch(`/api/getDownloadUrl?downloadId=${downloadId}`);
    if (!response.ok) {
        throw new Error(`Failed to get download URL: ${response.statusText}`);
    }
    const data = await response.json();
    return await downloadExportedCsv(data.downloadUrl);
}

async function downloadExportedCsv(uri) {
    const response = await fetch(`/api/downloadCsv?uri=${encodeURIComponent(uri)}`);
    if (!response.ok) {
        throw new Error(`Failed to download CSV: ${response.statusText}`);
    }
    return await response.text();
}
