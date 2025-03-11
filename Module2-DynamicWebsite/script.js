// Classes for Post, User, and Comment
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

// Fetch functions
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
            <p>Author: <span class="username" onclick="openUserProfile(${post.user.id})">${post.user?.name || 'Unknown'}</span></p>

            <div class="comments-section">
                ${post.comments.map(comment => 
                    `<div class="comment">
                        <div class="comment-user">${comment.user.fullName}</div>
                        <p>${comment.body}</p>
                        <div class="comment-likes">❤️ ${comment.likes}</div>
                    </div>`).join('')}
            </div>
        </div>`
    ).join('');

    displayedPostsCount += postsPerPage;

    if (displayedPostsCount >= allPosts.length) {
        window.removeEventListener('scroll', handleScroll);
    }
}

// Function to handle the modal
function openUserProfile(userId) {
    const user = allPosts.find(post => post.user.id === userId).user;

    // Populate the modal with user information
    document.getElementById('modalUserName').textContent = user.name;
    document.getElementById('modalUserEmail').textContent = `Email: ${user.email}`;
    document.getElementById('modalUserAddress').textContent = `Address: ${user.address.address}, ${user.address.city}`;

    // Display the modal
    document.getElementById('userProfileModal').style.display = 'block';
}

function closeUserProfileModal() {
    document.getElementById('userProfileModal').style.display = 'none';
}

// Scroll to load more posts
function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        renderMorePosts();
    }
}

window.addEventListener('scroll', handleScroll);
loadAllData();