const { ipcRenderer } = require('electron');

const loginForm = document.getElementById('login-form');
const userInfoDiv = document.getElementById('user-info');
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userId = document.getElementById('user-id');

const openCsvButton = document.getElementById('open-csv');
const saveCsvButton = document.getElementById('save-csv');
const deleteRowButton = document.getElementById('delete-row');
const tableBody = document.getElementById('table-body');

let csvData = [];

function saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function showUser(user) {
    userPhoto.src = user.image;
    userName.textContent = `Name: ${user.firstName} ${user.lastName}`;
    userEmail.textContent = `Email: ${user.email}`;
    userId.textContent = `User ID: ${user.id}`;
    userInfoDiv.classList.remove('hidden');
}

function checkSavedUser() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        showUser(user);
    }
}

async function login(username, password) {
    try {
        const response = await fetch('https://dummyjson.com/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        const data = await response.json();
        
        if (data.token) {
            const userResponse = await fetch(`https://dummyjson.com/users/${data.id}`);
            const user = await userResponse.json();
            
            saveUser(user);
            showUser(user);
        } else {
            alert('Login failed!');
        }
    } catch (error) {
        console.error('Error logging in:', error);
    }
}

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    login(username, password);
});

checkSavedUser();

openCsvButton.addEventListener('click', async () => {
    const filePaths = await ipcRenderer.invoke('dialog:openFile');
    if (filePaths.length > 0) {
        const data = await ipcRenderer.invoke('file:readCsv', filePaths[0]);
        csvData = data;
        updateTable();
    }
});

saveCsvButton.addEventListener('click', async () => {
    const { filePath } = await ipcRenderer.invoke('dialog:saveFile');
    if (filePath) {
        await ipcRenderer.invoke('file:writeCsv', csvData, filePath);
    }
});

deleteRowButton.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const index = Array.from(tableBody.children).indexOf(row);
        csvData.splice(index, 1);
        tableBody.removeChild(row);
    });
});

function updateTable() {
    tableBody.innerHTML = '';
    csvData.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="row-checkbox"></td>
            <td contenteditable="true">${row.Column1}</td>
            <td contenteditable="true">${row.Column2}</td>
            <td contenteditable="true">${row.Column3}</td>
        `;
        tableBody.appendChild(tr);
    });
}
