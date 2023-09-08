function displayCsvInTable(csvContent) {
  const rows = csvContent.split('\n');
  const headers = rows[0].split(',');

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
    const cells = rows[i].split(',');
    cells.forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell;
      row.appendChild(td);
    });
    tbody.appendChild(row);
  }
  table.appendChild(tbody);

  const container = document.querySelector('#contactLists');
  container.innerHTML = '';
  
  container.appendChild(table);
}
