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

async function loadAllData() {
    const [postsData, commentsData, usersData] = await Promise.all([
        fetchData('https://dummyjson.com/posts'),
        fetchData('https://dummyjson.com/comments'),
        fetchData('https://dummyjson.com/users')
    ]);

    const usersMap = new Map(usersData.users.map(user => [user.id, new User(user)]));
    const commentsMap = new Map(commentsData.comments.map(comment => [comment.id, new Comment(comment)]));

    const posts = postsData.posts.map(post => {
        const user = usersMap.get(post.userId);
        const postComments = commentsData.comments
            .filter(comment => comment.postId === post.id)
            .map(comment => commentsMap.get(comment.id));
        return new Post(post, user, postComments);
    });

    return { posts, users: usersData.users.map(user => new User(user)) };
}

function renderPosts(posts) {
        const container = document.getElementById('posts');
        container.innerHTML = posts.map(post => `
            <div class="post-card">
                <h2>${post.title}</h2>
                <p>${post.body}</p>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="reactions">
                    <span>👍 ${post.reactions.likes}</span>
                    <span>👎 ${post.reactions.dislikes}</span>
                    <span>👀 ${post.views}</span>
                </div>
                <p>Author: ${post.user?.name || 'Unknown'}</p>
                
                <button class="toggle-comments" onclick="toggleComments(${post.id})">
                    Show Comments (${post.comments.length})
                </button>
                
                <div class="comments-section" id="comments-${post.id}" style="display: none;">
                    ${post.comments.map(comment => `
                        <div class="comment">
                            <div class="comment-user">${comment.user.fullName}</div>
                            <p>${comment.body}</p>
                            <div class="comment-likes">❤️ ${comment.likes}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // Add this function to handle comment toggling
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
    container.innerHTML = users.map(user => `
        <div class="user-card">
            <h3>${user.name}</h3>
            <p>Email: ${user.email}</p>
            <p>Username: ${user.username}</p>
            <p>Address: ${user.address.address}, ${user.address.city}</p>
        </div>
    `).join('');
}

// Tab handling
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.target).classList.add('active');
    });
});

// Form validation
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

    // Name validation
    if (nameInput.value.trim().length < 3) {
        showError(nameInput, 'Name must be at least 3 characters');
        isValid = false;
    } else {
        clearError(nameInput);
    }

    // Email validation
    if (!emailRegex.test(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email address');
        isValid = false;
    } else {
        clearError(emailInput);
    }

    // Message validation
    if (messageInput.value.trim().length < 10) {
        showError(messageInput, 'Message must be at least 10 characters');
        isValid = false;
    } else {
        clearError(messageInput);
    }

    if (isValid) {
        // Submit form
        alert('Form submitted successfully!');
        form.reset();
    }
});

// Initialize
loadAllData().then(data => {
    renderPosts(data.posts);
    renderUsers(data.users);
});