function displayCsvInTable(csvContent, contactListId, platformClient) {
    const editedRows = new Set();
    const apiInstance = new platformClient.OutboundApi();

    const rows = csvContent.split('\n').filter(row => row.trim() !== "").map(row => row.split(',').map(cell => cell.replace(/"/g, '')));
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

                if (headers[index] === "ContactCallable") {
                    input.addEventListener('input', () => {
                        const value = input.value.trim();
                        if (value !== "1" && value !== "0") {
                            alert("Invalid value for ContactCallable! Please enter only '1' or '0'.");
                            input.value = cell;
                        } else {
                            document.getElementById('saveButton').style.display = 'block';
                            editedRows.add(row);
                        }
                    });
                } else {
                    input.addEventListener('input', () => {
                        document.getElementById('saveButton').style.display = 'block';
                        editedRows.add(row);
                    });
                }
                
                td.appendChild(input);
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    const contactListSearchInput = document.getElementById('contactListDetailsSearchInput');
    const contactListSearchButton = document.getElementById('contactListDetailsSearchButton');
    const resetSearchButton = document.getElementById('resetContactListDetailsSearchButton');
    const contactListSearchContainer = document.getElementById('contactListDetailsSearchContainer');

    contactListSearchContainer.style.display = 'block';

    contactListSearchButton.addEventListener('click', () => {
        const searchTerm = contactListSearchInput.value.toLowerCase();
        if (!searchTerm) {
            alert('Please enter a search term.');
            return;
        }
    
        for (let row of tbody.children) {
            let rowContainsTerm = Array.from(row.children).some(cell => cell.textContent.toLowerCase().includes(searchTerm));
            row.style.display = rowContainsTerm ? '' : 'none';
        }

        resetSearchButton.style.display = 'inline-block';
    });

    resetSearchButton.addEventListener('click', () => {
        for (let row of tbody.children) {
            row.style.display = '';
        }
        contactListSearchInput.value = ''; 
        resetSearchButton.style.display = 'none';
    });

    const bodyContent = document.body.children;
    for (let i = bodyContent.length - 1; i >= 0; i--) {
        if (bodyContent[i].tagName !== 'H1' && bodyContent[i].id !== 'contactListDetailsSearchContainer') {
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

    const KPIContainer = document.createElement('div');
    KPIContainer.id = "KPIContainer";

    const totalRecordsDiv = document.createElement('div');
    totalRecordsDiv.innerHTML = "Total Records: <span id='totalRecords'>0</span>";
    KPIContainer.appendChild(totalRecordsDiv);

    const uncallableRecordsDiv = document.createElement('div');
    uncallableRecordsDiv.innerHTML = "Uncallable Records: <span id='uncallableRecords'>0</span> (<span id='uncallablePercentage'>0%</span>)";
    KPIContainer.appendChild(uncallableRecordsDiv);

    const callableRecordsDiv = document.createElement('div');
    callableRecordsDiv.innerHTML = "Callable Records: <span id='callableRecords'>0</span> (<span id='callablePercentage'>0%</span>)";
    KPIContainer.appendChild(callableRecordsDiv);

    document.body.appendChild(KPIContainer);

    updateKPIs(rows);

    document.body.appendChild(table);
}


function updateKPIs(rows) {
    const contactCallableIndex = rows[0].indexOf("ContactCallable");
    let callableCount = 0;
    let uncallableCount = 0;

    for (let i = 1; i < rows.length; i++) {
        if (rows[i][contactCallableIndex] === "1") {
            callableCount++;
        } else if (rows[i][contactCallableIndex] === "0") {
            uncallableCount++;
        }
    }

    const totalRecords = rows.length - 1;
    const callablePercentage = ((callableCount / totalRecords) * 100).toFixed(2);
    const uncallablePercentage = ((uncallableCount / totalRecords) * 100).toFixed(2);

    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('callableRecords').textContent = callableCount;
    document.getElementById('uncallableRecords').textContent = uncallableCount;
    document.getElementById('callablePercentage').textContent = `${callablePercentage}%`;
    document.getElementById('uncallablePercentage').textContent = `${uncallablePercentage}%`;
}
