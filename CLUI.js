function displayCsvInTable(csvContent) {

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
        rows[i].forEach((cell, index) => {
            const td = document.createElement('td');
            if (headers[index] === 'inin-outbound-id') {
                td.textContent = cell;
            } else {
                const input = document.createElement('input');
                input.value = cell;
                input.addEventListener('input', () => {
                    document.getElementById('saveButton').style.display = 'block';
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
    backButton.addEventListener('click', () => {
        document.location.reload();
    });
    buttonsContainer.appendChild(backButton);


    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style.display = 'none';
    saveButton.id = 'saveButton';
    saveButton.addEventListener('click', () => {
        // TODO: Implement saving logic
        alert('Save changes functionality is not implemented yet.');
    });
    buttonsContainer.appendChild(saveButton);
    

    document.body.appendChild(buttonsContainer);
    document.body.appendChild(table);
}
