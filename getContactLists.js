let currentPage = 1;
let platformClientInstance;

const showLoading = () => {
  const loadingSection = document.getElementById('loading-section');
  loadingSection.style.display = 'block';
};

const hideLoading = () => {
  const loadingSection = document.getElementById('loading-section');
  loadingSection.style.display = 'none';
};

const contactListHandlers = {
  fetchContactLists(platformClient, clientId, pageNumber = 1, name = '') {
    currentPage = pageNumber;
    platformClientInstance = platformClient;
    console.log('getContactLists called');

    function displayContactLists(contactLists) {
      hideLoading(); 
      const contactListsTableBody = document.querySelector('#contactListsTable tbody');
      contactListsTableBody.innerHTML = '';

      contactLists.forEach(list => {
        const row = document.createElement('tr');
        const idCell = document.createElement('td');
        idCell.textContent = list.id;
        const nameCell = document.createElement('td');
        nameCell.textContent = list.name;
        const dateCreatedCell = document.createElement('td');
        dateCreatedCell.textContent = list.dateCreated;
        const divisionCell = document.createElement('td');
        divisionCell.textContent = list.division.name;

        const radioButtonCell = document.createElement('td');
        const radioButton = document.createElement('input');
        radioButton.type = 'radio';
        radioButton.name = 'contactListSelection';
        
        radioButton.onclick = async () => {
          const csvContent = await handleContactListSelection(platformClientInstance, list.id, clientId);
          displayCsvInTable(csvContent, list.id, platformClientInstance);
        };
        
        radioButtonCell.appendChild(radioButton);
        row.appendChild(idCell);
        row.appendChild(nameCell);
        row.appendChild(dateCreatedCell);
        row.appendChild(divisionCell);
        row.appendChild(radioButtonCell);
        contactListsTableBody.appendChild(row);
      });
    }

    function fetchContactListsFromApi(pageNumber, name) {
      showLoading();  
      const apiInstance = new platformClient.OutboundApi();
      const pageSize = 25;

      const opts = {
        "includeImportStatus": false,
        "includeSize": false,
        "pageSize": pageSize,
        "pageNumber": pageNumber,
        "allowEmptyResult": false,
        "filterType": "Prefix",
        "sortBy": "name",
        "sortOrder": "ascending"
      };

      if (name) {
        opts.name = name;
      }

      apiInstance.getOutboundContactlists(opts)
        .then(response => {
          const contactLists = response.entities;
          const totalPages = response.pageCount;
          displayContactLists(contactLists);
          contactListHandlers.updatePaginationButtons(totalPages);
        })
        .catch(error => {
          console.error('Error fetching contact lists:', error);
          hideLoading(); 
        });
    }

    fetchContactListsFromApi(pageNumber, name);
  },

  updatePaginationButtons(totalPages) {
    const previousPageBtn = document.querySelector('#previousPageBtn');
    const nextPageBtn = document.querySelector('#nextPageBtn');

    previousPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    previousPageBtn.onclick = () => {
      currentPage -= 1;
      contactListHandlers.fetchContactLists(platformClientInstance, currentPage);
    };
    nextPageBtn.onclick = () => {
      currentPage += 1;
      contactListHandlers.fetchContactLists(platformClientInstance, currentPage);
    };
  },

  addShowContactListsButtonListener(platformClient, clientId) {
    const showContactListsButton = document.querySelector('#showContactLists');
    const contactListsContainer = document.querySelector('#contactLists');
    const searchButton = document.querySelector('#searchButton');
    const searchInput = document.querySelector('#searchInput');

    searchButton.addEventListener('click', () => {
      const searchTerm = searchInput.value;
      if (searchTerm) {
        contactListsContainer.innerHTML = '';
        contactListHandlers.fetchContactLists(platformClient, clientId, 1, searchTerm);
      } else {
        alert('Please enter a search term.');
      }
    });

    showContactListsButton.addEventListener('click', () => {
      contactListsContainer.innerHTML = '';
      contactListHandlers.fetchContactLists(platformClient, clientId);
    });
  }
};

window.addEventListener('DOMContentLoaded', () => {
  window.contactListHandlers = contactListHandlers;
});
