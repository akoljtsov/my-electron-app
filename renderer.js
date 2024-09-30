const loginForm = document.getElementById('login-form');
const userInfoDiv = document.getElementById('user-info');
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userId = document.getElementById('user-id');

// Збереження користувача в локальному сховищі
function saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Відображення користувача після логіну
function showUser(user) {
    userPhoto.src = user.image;
    userName.textContent = `Name: ${user.firstName} ${user.lastName}`;
    userEmail.textContent = `Email: ${user.email}`;
    userId.textContent = `User ID: ${user.id}`;
    userInfoDiv.classList.remove('hidden');
}

// Перевірка, чи зберігався користувач у локальному сховищі
function checkSavedUser() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        showUser(user);
    }
}

// Функція для логіну користувача
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
            // Отримати інформацію про користувача
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

// Обробка події логіну
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    login(username, password);
});

// Перевірити, чи є збережений користувач при завантаженні сторінки
checkSavedUser();
