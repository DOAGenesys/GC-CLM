let currentPage = 1;
let platformClientInstance;
const contactListHandlers = {
  fetchContactLists(platformClient, clientId, pageNumber = 1, name = '') {
    currentPage = pageNumber;
    platformClientInstance = platformClient;
    console.log('getContactLists called');

    function displayContactLists(contactLists) {
      console.log('displayContactLists', contactLists);
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

    function fetchContactListsFromApi(pageNumber) {
      const apiInstance = new platformClient.OutboundApi();
      const pageSize = 25;

      const opts = {
        "pageSize": pageSize,
        "pageNumber": pageNumber
      };

      if (name) {
        opts.name = name;
      }

      apiInstance.getOutboundContactlists(opts)
        .then(response => {
          console.log('getOutboundContactlists response', response);
          const contactLists = response.entities;
          const totalPages = response.pageCount;
          displayContactLists(contactLists);
          contactListHandlers.updatePaginationButtons(totalPages);
        })
        .catch(error => console.error('Error al cargar las contact lists:', error));
    }

    fetchContactListsFromApi(pageNumber);
  },

  updatePaginationButtons(totalPages) {
    const previousPageBtn = document.querySelector('#previousPageBtn');
    const nextPageBtn = document.querySelector('#nextPageBtn');

    if (currentPage === 1) {
      previousPageBtn.disabled = true;
    } else {
      previousPageBtn.disabled = false;
    }

    if (currentPage === totalPages) {
      nextPageBtn.disabled = true;
    } else {
      nextPageBtn.disabled = false;
    }

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
    console.log('addShowContactListsButtonListener called');

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
