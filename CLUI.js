function displayCsvInTable(csvContent, contactListId) {
    const rows = csvContent.split('\n').map(row => row.split(',').map(cell => cell.replace(/"/g, '')));
    const headers = rows[0];

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
        const cells = rows[i];
        cells.forEach((cell, index) => {
            const td = document.createElement('td');
            
            if (headers[index] === 'inin-outbound-id' || index > headers.indexOf('ContactCallable')) {
                td.textContent = cell;
            } else {
                const input = document.createElement('input');
                input.value = cell;
                input.dataset.columnName = headers[index];
                input.dataset.originalValue = cell;
                td.appendChild(input);
            }

            row.appendChild(td);
        });
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    const container = document.querySelector('#contactLists');
    container.innerHTML = '';
    
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to contact lists';
    backButton.addEventListener('click', () => {

    });
    container.appendChild(backButton);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style.marginLeft = '20px';
    container.appendChild(saveButton);

    container.appendChild(table);

    table.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT') {
            e.target.closest('tr').setAttribute('data-modified', 'true');
            
            if (e.target.dataset.columnName === 'ContactCallable' && !['0', '1'].includes(e.target.value)) {
                alert('Only "0" or "1" are valid values for ContactCallable column.');
                e.target.value = e.target.dataset.originalValue;
            }
        }
    });

    saveButton.addEventListener('click', () => {
        const modifiedRows = table.querySelectorAll('tr[data-modified="true"]');
        modifiedRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const contactId = cells[0].textContent;
            const body = {
                contactListId: contactListId,
                data: {},
                callable: null
            };

            cells.forEach((cell, index) => {
                const input = cell.querySelector('input');
                if (input) {
                    const columnName = headers[index];
                    if (columnName === 'ContactCallable') {
                        body.callable = input.value === '1';
                    } else {
                        body.data[columnName] = input.value;
                    }
                }
            });

            apiInstance.putOutboundContactlistContact(contactListId, contactId, body)
                .then((data) => {
                    console.log(`putOutboundContactlistContact success! data: ${JSON.stringify(data, null, 2)}`);
                })
                .catch((err) => {
                    console.log("There was a failure calling putOutboundContactlistContact");
                    console.error(err);
                });
        });
    });
}
