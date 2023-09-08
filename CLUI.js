function displayCsvInTable(csvContent, contactListId, platformClient) {
    const editedRows = new Set();
    const apiInstance = new platformClient.OutboundApi();

    const rows = csvContent.split('\n').map(row => row.split(',').map(cell => cell.replace(/"/g, '')));
    const headers = rows[0];
    const doubleId = rows[1][headers.indexOf("inin-outbound-id")] === rows[1][headers.indexOf("id")];

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    for (let i = 1; i < rows.length; i++) {
        const row = document.createElement('tr');
        rows[i].forEach((cell, index) => {
            const td = document.createElement('td');
            if (headers[index] === 'inin-outbound-id' || index > headers.indexOf("ContactCallable")) {
                td.textContent = cell;
            } else {
                const input = document.createElement('input');
                input.value = cell;
                input.addEventListener('input', () => {
                    document.getElementById('saveButton').style.display = 'block';
                    editedRows.add(row);
                });
                td.appendChild(input);
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    const bodyContent = document.body.children;
    for (let i = bodyContent.length - 1; i >= 0; i--) {
        if (bodyContent[i].tagName !== 'H1') {
            document.body.removeChild(bodyContent[i]);
        }
    }

    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'center';
    buttonsContainer.style.gap = '10px';

    const backButton = document.createElement('button');
    backButton.textContent = 'Back to contact lists';
    backButton.addEventListener('click', () => document.location.reload());
    buttonsContainer.appendChild(backButton);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style.display = 'none';
    saveButton.id = 'saveButton';
    saveButton.addEventListener('click', () => {
        const promises = [];
        editedRows.forEach(editedRow => {
            const cells = Array.from(editedRow.children);
            const contactId = cells[headers.indexOf("inin-outbound-id")].textContent;
            let body = {
                "contactListId": contactListId,
                "data": {},
                "callable": cells[headers.indexOf("ContactCallable")].firstChild.value === "1"
            };
            if (doubleId) {
                body.id = contactId;
            }
            cells.forEach((cell, index) => {
                const currentValue = cell.firstChild ? cell.firstChild.value : cell.textContent;
                if (index !== headers.indexOf("inin-outbound-id") && index < headers.indexOf("ContactCallable")) {
                    body.data[headers[index]] = currentValue;
                }
            });
            promises.push(apiInstance.putOutboundContactlistContact(contactListId, contactId, body));
        });
        Promise.all(promises).then(() => {
            alert('All changes saved!');
        }).catch(err => {
            console.error('Error while updating contacts:', err);
        });
    });
    buttonsContainer.appendChild(saveButton);
    document.body.appendChild(buttonsContainer);
    document.body.appendChild(table);
}
