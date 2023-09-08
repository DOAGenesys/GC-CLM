function displayCsvInTable(csvContent) {
    const rows = csvContent.trim().split('\n');
    const headers = rows[0].split(',').map(header => header.replace(/^"|"$/g, ''));

    const table = document.createElement('table');

    // Add headers
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Add data rows
    const tbody = document.createElement('tbody');
    for (let i = 1; i < rows.length; i++) {
        const row = document.createElement('tr');
        const cells = rows[i].split(',').map(cell => cell.replace(/^"|"$/g, ''));
        cells.forEach((cell, idx) => {
            const td = document.createElement('td');
            td.textContent = cell;
            if (headers[idx] !== 'inin-outbound-id') {
                td.contentEditable = "true";
                td.addEventListener('input', () => {
                    document.querySelector('#saveButton').style.display = 'inline-block';
                });
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    // Clean up the UI
    const container = document.querySelector('#contactLists');
    container.innerHTML = '';

    // Add back button
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to contact lists';
    backButton.addEventListener('click', () => {
        document.location.reload();
    });
    container.appendChild(backButton);

    // Add save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style.display = 'none'; // initially hidden
    saveButton.id = 'saveButton';
    saveButton.addEventListener('click', () => {
        // TODO: Implement saving logic
        alert('Save changes functionality is not implemented yet.');
    });
    container.appendChild(saveButton);

    // Add the table
    container.appendChild(table);
}
