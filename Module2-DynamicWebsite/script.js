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

// Render functions
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
            .map(comment => {
                comment.user = usersMap.get(comment.user.id);
                return new Comment(comment);
            });

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
        `<section class="post-card">
            <h2>${post.title}</h2>
            <p>${post.body}</p>
            <section class="post-tags">
                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </section>
            <section class="reactions">
                <span>👍 ${post.reactions.likes}</span>
                <span>👀 ${post.views}</span>
            </section>
            <p>By: <span class="username" onclick="openUserProfile(${post.user.id})">${post.user?.name || 'Unknown'}</span></p>

            <section class="comments-section">
                ${post.comments.map(comment => 
                    `<section class="comment">
                        <section class="comment-user" onclick="openCommentUserProfile(${comment.user.id})">
                            ${comment.user.name}
                        </section>
                        <p>${comment.body}</p>
                        <section class="comment-likes">❤️ ${comment.likes}
                        </section>
                    </section>`).join('')}
            </section>
        </section>`
    ).join('');

    displayedPostsCount += postsPerPage;

    if (displayedPostsCount >= allPosts.length) {
        window.removeEventListener('scroll', handleScroll);
    }
}

function openUserProfile(userId) {
    const user = allPosts.find(post => post.user.id === userId)?.user;

    if (!user) {
        console.error('User not found');
        return;
    }

    document.getElementById('modalUserName').textContent = user.name;
    document.getElementById('modalUserEmail').textContent = `Email: ${user.email}`;
    document.getElementById('modalUserAddress').textContent = `Address: ${user.address.address}, ${user.address.city}`;
    document.getElementById('userProfileModal').style.display = 'block';
}

function openCommentUserProfile(userId) {
    const user = allPosts.flatMap(post => post.comments)
                         .find(comment => comment.user.id === userId)?.user;

    if (!user) {
        console.error('User not found');
        return;
    }

    document.getElementById('modalUserName').textContent = user.name;
    document.getElementById('modalUserEmail').textContent = `Email: ${user.email}`;
    document.getElementById('modalUserAddress').textContent = `Address: ${user.address.address}, ${user.address.city}`;

    document.getElementById('userProfileModal').style.display = 'block';
}

function closeUserProfileModal() {
    document.getElementById('userProfileModal').style.display = 'none';
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const nameInput = document.getElementById("nameInput");
    const emailInput = document.getElementById("emailInput");
    const messageInput = document.getElementById("messageInput");
    const checkbox = document.querySelector("input[type='checkbox']");
    const submitButton = document.getElementById("submit");

    form.addEventListener("submit", function (event) {
        let isValid = true;
        
        const namePattern = /^[A-Za-z]+$/;
        if (!namePattern.test(nameInput.value.trim())) {
            alert("Name must not contain numbers.");
            isValid = false;
        }
        
        if (!emailInput.value.includes("@") || !emailInput.value.includes(".")) {
            alert("Please enter a valid email address.");
            isValid = false;
        }

        if (!checkbox.checked) {
            alert("You must confirm that your details are correct.");
            isValid = false;
        }

        if (!isValid) {
            event.preventDefault();
        } else {
            event.preventDefault();
            alert("Your message has been sent successfully!");
            form.reset();
        }
    });
});

function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        renderMorePosts();
    }
}

window.addEventListener('scroll', handleScroll);
loadAllData();
