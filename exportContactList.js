let selectedContactListId;
let csvData;

function handleContactListSelection(platformClient, contactListId, clientId) {
  selectedContactListId = contactListId;
  initiateContactListExport(platformClient, contactListId, clientId);
}

function initiateContactListExport(platformClient, contactListId, clientId) {
  const apiInstance = new platformClient.OutboundApi();
  apiInstance.postOutboundContactlistExport(contactListId)
    .then(response => {
      console.log('Export initiated:', response);
      setTimeout(() => {
        getDownloadUrl(platformClient, contactListId, clientId);
      }, 2000);
    })
    .catch(error => console.error('Error iniciando contact list export:', error));
}

function getDownloadUrl(platformClient, contactListId, clientId, tries = 0) {
  const apiInstance = new platformClient.OutboundApi();
  apiInstance.getOutboundContactlistExport(contactListId)
    .then((data) => {
      console.log(`getOutboundContactlistExport success! data: ${JSON.stringify(data, null, 2)}`);
      console.log('Download URL recuperada:', data.uri);

      // Extraer el downloadID de la URL
      const downloadId = data.uri.split('/').pop();

      // Realizar la siguiente llamada a la API
      getFinalDownloadUrl(downloadId);
    })
    .catch((err) => {
      console.log("Ha habido un fallo recuperando la URL de exportación");
      console.error(err);
    });
}

async function getFinalDownloadUrl(downloadId) {
    const response = await fetch(`/api/getDownloadUrl?downloadId=${downloadId}`);
    if (!response.ok) {
        throw new Error(`Failed to get download URL: ${response.statusText}`);
    }
    const data = await response.json();
    return data.downloadUrl;
}

async function downloadExportedCsv(uri) {
    const response = await fetch(`/api/downloadCsv?uri=${encodeURIComponent(uri)}`);
    if (!response.ok) {
        throw new Error(`Failed to download CSV: ${response.statusText}`);
    }
    return await response.text();
}
