class Post {
    constructor(postData, user, comments) {
        this.id = postData.id;
        this.title = postData.title;
        this.body = postData.body;
        this.tags = postData.tags;
        this.reactions = postData.reactions;
        this.views = postData.views;
        this.user = user;
        this.comments = comments;
    }
}

class User {
    constructor(userData) {
        this.id = userData.id;
        this.name = `${userData.firstName} ${userData.lastName}`;
        this.email = userData.email;
        this.username = userData.username;
        this.address = userData.address;
    }
}

class Comment {
    constructor(commentData) {
        this.id = commentData.id;
        this.body = commentData.body;
        this.user = commentData.user;
        this.likes = commentData.likes;
    }
}

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function fetchAllData(url) {
    try {
        const firstBatch = await fetchData(`${url}?limit=1`);
        if (!firstBatch) return null;

        const total = firstBatch.total;
        const batchSize = 100;
        const requests = [];

        for (let skip = 0; skip < total; skip += batchSize) {
            requests.push(fetchData(`${url}?limit=${batchSize}&skip=${skip}`));
        }

        const responses = await Promise.all(requests);
        return responses.flatMap(response => response.posts || response.comments || response.users);
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return null;
    }
}

let allPosts = [];
let displayedPostsCount = 0;
const postsPerPage = 5;

async function loadAllData() {
    const [postsData, commentsData, usersData] = await Promise.all([
        fetchAllData('https://dummyjson.com/posts'),
        fetchAllData('https://dummyjson.com/comments'),
        fetchAllData('https://dummyjson.com/users')
    ]);

    if (!postsData || !commentsData || !usersData) {
        console.error("Failed to fetch all data");
        return;
    }

    const usersMap = new Map(usersData.map(user => [user.id, new User(user)]));
    const commentsMap = new Map(commentsData.map(comment => [comment.id, new Comment(comment)]));

    allPosts = postsData.map(post => {
        const user = usersMap.get(post.userId);
        const postComments = commentsData
            .filter(comment => comment.postId === post.id)
            .map(comment => commentsMap.get(comment.id));
        return new Post(post, user, postComments);
    });

    renderInitialPosts();
    renderUsers(usersData.map(user => new User(user)));
}

function renderInitialPosts() {
    displayedPostsCount = 0;
    renderMorePosts();
}

function renderMorePosts() {
    const container = document.getElementById('posts');
    const postsToDisplay = allPosts.slice(displayedPostsCount, displayedPostsCount + postsPerPage);

    container.innerHTML += postsToDisplay.map(post => 
        `<div class="post-card">
            <h2>${post.title}</h2>
            <p>${post.body}</p>
            <div class="post-tags">
                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="reactions">
                <span>👍 ${post.reactions.likes}</span>
                <span>👀 ${post.views}</span>
            </div>
            <p>Author: ${post.user?.name || 'Unknown'}</p>
            
            <button class="toggle-comments" onclick="toggleComments(${post.id})">
                Show Comments (${post.comments.length})
            </button>
            
            <div class="comments-section" id="comments-${post.id}" style="display: none;">
                ${post.comments.map(comment => 
                    `<div class="comment">
                        <div class="comment-user">${comment.user.fullName}</div>
                        <p>${comment.body}</p>
                        <div class="comment-likes">❤️ ${comment.likes}</div>
                    </div>`
                ).join('')}
            </div>
        </div>`
    ).join('');

    displayedPostsCount += postsPerPage;

    if (displayedPostsCount >= allPosts.length) {
        window.removeEventListener('scroll', handleScroll);
    }
}

function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    const button = commentsSection.previousElementSibling;
    
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
        button.textContent = `Hide Comments (${commentsSection.children.length})`;
    } else {
        commentsSection.style.display = 'none';
        button.textContent = `Show Comments (${commentsSection.children.length})`;
    }
}

function renderUsers(users) {
    const container = document.getElementById('users');
    container.innerHTML = users.map(user => 
        `<div class="user-card">
            <h3>${user.name}</h3>
            <p>Email: ${user.email}</p>
            <p>Username: ${user.username}</p>
            <p>Address: ${user.address.address}, ${user.address.city}</p>
        </div>`
    ).join('');
}

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.target).classList.add('active');
    });
});

const form = document.querySelector('.contact-form');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showError(element, message) {
    element.classList.add('invalid');
    element.nextElementSibling.textContent = message;
}

function clearError(element) {
    element.classList.remove('invalid');
    element.nextElementSibling.textContent = '';
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');

    if (nameInput.value.trim().length < 3) {
        showError(nameInput, 'Name must be at least 3 characters');
        isValid = false;
    } else {
        clearError(nameInput);
    }

    if (!emailRegex.test(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email address');
        isValid = false;
    } else {
        clearError(emailInput);
    }

    if (messageInput.value.trim().length < 10) {
        showError(messageInput, 'Message must be at least 10 characters');
        isValid = false;
    } else {
        clearError(messageInput);
    }

    if (isValid) {
        alert('Form submitted successfully!');
        form.reset();
    }
});

function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        renderMorePosts();
    }
}

window.addEventListener('scroll', handleScroll);
loadAllData();