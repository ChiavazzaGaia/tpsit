let currentUser = null;
let currentSearch = "";
const msgInput = document.getElementById('msgInput');

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeBtn').onclick = toggleTheme;
    
    document.getElementById('searchInput').oninput = (e) => {
        currentSearch = e.target.value;
        refreshChat();
    };

    document.getElementById('newAvatar').onchange = function() {
        const [file] = this.files;
        if (file) {
            const previews = document.querySelectorAll('.profile-large-pfp');
            previews.forEach(img => img.src = URL.createObjectURL(file));
        }
    };

    updateAuth();
    refreshChat();
    setInterval(refreshChat, 10000);
});

function imgError(img) {
    img.onerror = null;
    img.src = "https://ui-avatars.com/api/?name=User&background=random";
}

// FIX: Hyperlinks now working
function parseText(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
}

async function refreshChat() {
    const res = await fetch(`/data?search=${encodeURIComponent(currentSearch)}`);
    const posts = await res.json();
    document.getElementById('chatFeed').innerHTML = posts.map(p => {
        const isOwner = currentUser && currentUser.username === p.username;
        return `
        <div class="card" id="post-${p.id}">
            <div class="post-meta">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${p.pfp}" class="mini-pfp" onerror="imgError(this)" onclick="viewProfile('${p.username}')">
                    <span class="user-tag" onclick="viewProfile('${p.username}')">@${p.username}</span>
                </div>
                ${isOwner ? `
                <div class="post-actions">
                    <button onclick="editPost('${p.id}')" class="text-btn">Edit</button>
                    <button onclick="deletePost('${p.id}')" class="text-btn delete">Delete</button>
                </div>` : ''}
            </div>
            <div class="post-body" id="body-${p.id}">${parseText(p.data)}</div>
            ${p.image ? `<img src="${p.image}" class="post-img">` : ''}
            <div class="timestamp">${p.timestamp}</div>
        </div>`;
    }).join('');
}

async function deletePost(id) {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/post/${id}`, { method: 'DELETE' });
    if (res.ok) refreshChat();
}

async function editPost(id) {
    const bodyElem = document.getElementById(`body-${id}`);
    const oldText = bodyElem.innerText;
    const newText = prompt("Edit your post:", oldText);
    if (newText === null || newText === oldText) return;

    const res = await fetch(`/post/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ data: newText })
    });
    if (res.ok) refreshChat();
}

async function updateAuth() {
    const res = await fetch('/status');
    const data = await res.json();
    currentUser = data.user;
    const ui = document.getElementById('auth-ui');
    if (currentUser) {
        ui.innerHTML = `
            <img src="${currentUser.pfp}" class="nav-pfp" onerror="imgError(this)" onclick="viewProfile('${currentUser.username}')">
            <button onclick="logout()" class="logout-pill">Logout</button>`;
        document.getElementById('post-box').style.display = 'block';
    } else {
        ui.innerHTML = `<button onclick="openModal('authModal')" class="login-trigger">Login</button>`;
        document.getElementById('post-box').style.display = 'none';
    }
}

async function auth(action) {
    const u = document.getElementById('u').value;
    const p = document.getElementById('p').value;
    const res = await fetch('/account', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username: u, password: p, action })
    });
    if (res.ok) { closeModal('authModal'); updateAuth(); refreshChat(); }
}

function insertFormat(open, close) {
    const start = msgInput.selectionStart;
    const end = msgInput.selectionEnd;
    msgInput.value = msgInput.value.substring(0, start) + open + msgInput.value.substring(start, end) + close + msgInput.value.substring(end);
    msgInput.focus();
}

async function viewProfile(username) {
    const res = await fetch(`/api/user/${username}`);
    const user = await res.json();
    document.getElementById('profileBody').innerHTML = `
        <div style="text-align:center;">
            <img src="${user.pfp}" class="profile-large-pfp" onerror="imgError(this)">
            <h2>${user.username}</h2>
            <p>${user.bio || 'No bio.'}</p>
        </div>`;
    document.getElementById('editProfileSection').style.display = (currentUser && currentUser.username === username) ? 'block' : 'none';
    openModal('profileModal');
}

async function saveProfile() {
    const formData = new FormData();
    formData.append('bio', document.getElementById('newBio').value);
    const file = document.getElementById('newAvatar').files[0];
    if (file) formData.append('avatar', file);
    await fetch('/update-profile', { method: 'POST', body: formData });
    location.reload();
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
}

function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
async function logout() { await fetch('/logout', {method: 'POST'}); updateAuth(); refreshChat(); }

document.getElementById('msgForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('data', msgInput.value);
    formData.append('image', document.getElementById('imgInput').files[0]);
    await fetch('/submit', { method: 'POST', body: formData });
    document.getElementById('msgForm').reset();
    refreshChat();
};