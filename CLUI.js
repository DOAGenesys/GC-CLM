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

    // Create KPIContainer
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
    let totalRecords = rows.length - 1;
    let callableRecords = 0;
    let uncallableRecords = 0;

    for (let i = 1; i < rows.length; i++) {
        const contactCallableValue = rows[i][headers.indexOf("ContactCallable")];
        if (contactCallableValue === "1") {
            callableRecords++;
        } else if (contactCallableValue === "0") {
            uncallableRecords++;
        }
    }

    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('uncallableRecords').textContent = uncallableRecords;
    document.getElementById('callableRecords').textContent = callableRecords;

    const uncallablePercentage = ((uncallableRecords / totalRecords) * 100).toFixed(2) + '%';
    const callablePercentage = ((callableRecords / totalRecords) * 100).toFixed(2) + '%';

    document.getElementById('uncallablePercentage').textContent = uncallablePercentage;
    document.getElementById('callablePercentage').textContent = callablePercentage;
}
