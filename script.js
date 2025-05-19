document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle Functionality
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or use system preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<span class="material-icons">brightness_7</span><span>Modo claro</span>';
    } else if (currentTheme === 'light') {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<span class="material-icons">brightness_4</span><span>Modo oscuro</span>';
    } else if (prefersDarkScheme.matches) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<span class="material-icons">brightness_7</span><span>Modo claro</span>';
    }
    
    // Theme toggle button click event
    themeToggle.addEventListener('click', function() {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<span class="material-icons">brightness_4</span><span>Modo oscuro</span>';
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<span class="material-icons">brightness_7</span><span>Modo claro</span>';
        }
    });
    
    // Load random user data for profile pictures and usernames
    async function loadRandomUsers() {
        try {
            // Load main user data
            const userResponse = await fetch('https://randomuser.me/api/');
            const userData = await userResponse.json();
            const user = userData.results[0];
            
            // Set sidebar user info
            document.getElementById('sidebar-profile-pic').src = user.picture.large;
            document.getElementById('sidebar-username').textContent = `${user.name.first} ${user.name.last}`;
            document.getElementById('sidebar-userhandle').textContent = `@${user.login.username}`;
            
            // Set create post profile pic
            document.getElementById('main-profile-pic').src = user.picture.large;
            
            // Load posts with random users
            loadPosts();
            
            // Load suggested users to follow
            loadSuggestedUsers();
            
            // Set current user in localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                name: `${user.name.first} ${user.name.last}`,
                username: user.login.username,
                picture: user.picture.thumbnail
            }));
            
        } catch (error) {
            console.error('Error loading random users:', error);
            // Fallback images if API fails
            const fallbackImage = 'https://via.placeholder.com/150';
            document.getElementById('sidebar-profile-pic').src = fallbackImage;
            document.getElementById('main-profile-pic').src = fallbackImage;
            
            // Fallback current user
            localStorage.setItem('currentUser', JSON.stringify({
                name: 'Usuario Ejemplo',
                username: 'usuario',
                picture: fallbackImage
            }));
        }
    }
    
    // Load posts with random content
    async function loadPosts() {
        try {
            // Fetch random posts from JSONPlaceholder
            const postsResponse = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
            const posts = await postsResponse.json();
            
            // Fetch random users for each post
            const usersResponse = await fetch(`https://randomuser.me/api/?results=${posts.length}`);
            const usersData = await usersResponse.json();
            const users = usersData.results;
            
            const postsContainer = document.getElementById('posts-container');
            postsContainer.innerHTML = '';
            
            // Get liked posts from localStorage
            const likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
            const postComments = JSON.parse(localStorage.getItem('postComments')) || {};
            
            posts.forEach((post, index) => {
                const user = users[index];
                const postId = `post-${index}`;
                const isLiked = likedPosts.includes(postId);
                const postCommentsData = postComments[postId] || [];
                
                const postElement = document.createElement('div');
                postElement.className = 'post';
                postElement.dataset.postId = postId;
                
                // Format random date
                const hoursAgo = Math.floor(Math.random() * 24);
                const dateText = hoursAgo === 0 ? 'ahora' : `hace ${hoursAgo}h`;
                
                postElement.innerHTML = `
                    <img src="${user.picture.thumbnail}" alt="Profile" class="profile-pic">
                    <div class="post-content">
                        <div class="post-header">
                            <span class="post-username">${user.name.first} ${user.name.last}</span>
                            <span class="post-userhandle">@${user.login.username}</span>
                            <span class="post-time">· ${dateText}</span>
                        </div>
                        <p class="post-text">${post.title.charAt(0).toUpperCase() + post.title.slice(1)}</p>
                        ${Math.random() > 0.5 ? `<img src="https://picsum.photos/600/400?random=${index}" class="post-image" alt="Post image">` : ''}
                        <div class="post-actions">
                            <div class="post-action comment">
                                <span class="material-icons">chat_bubble_outline</span>
                                <span>${Math.floor(Math.random() * 100)}</span>
                            </div>
                            <div class="post-action">
                                <span class="material-icons">repeat</span>
                                <span>${Math.floor(Math.random() * 50)}</span>
                            </div>
                            <div class="post-action like ${isLiked ? 'active' : ''}">
                                <span class="material-icons">${isLiked ? 'favorite' : 'favorite_border'}</span>
                                <span>${Math.floor(Math.random() * 500) + (isLiked ? 1 : 0)}</span>
                            </div>
                            <div class="post-action">
                                <span class="material-icons">share</span>
                            </div>
                        </div>
                        <div class="comment-section">
                            <div class="comment-input">
                                <img src="" alt="Profile" class="profile-pic comment-profile-pic">
                                <textarea placeholder="Escribe un comentario..." class="comment-textarea"></textarea>
                                <button class="comment-submit">Comentar</button>
                            </div>
                            <div class="comments-list"></div>
                        </div>
                    </div>
                `;
                
                postsContainer.appendChild(postElement);
                
                // Set current user profile pic in comment input
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                const commentProfilePic = postElement.querySelector('.comment-profile-pic');
                if (commentProfilePic && currentUser) {
                    commentProfilePic.src = currentUser.picture;
                }
                
                // Load comments for this post if they exist
                if (postCommentsData.length > 0) {
                    const commentsList = postElement.querySelector('.comments-list');
                    postCommentsData.forEach(comment => {
                        const commentElement = document.createElement('div');
                        commentElement.className = 'comment';
                        commentElement.innerHTML = `
                            <img src="${comment.userPic}" alt="Profile" class="profile-pic">
                            <div class="comment-content">
                                <div class="comment-header">
                                    <span class="comment-username">${comment.userName}</span>
                                    <span class="comment-userhandle">@${comment.userHandle}</span>
                                    <span class="comment-time">· ${comment.time}</span>
                                </div>
                                <p class="comment-text">${comment.text}</p>
                            </div>
                        `;
                        commentsList.appendChild(commentElement);
                    });
                }
                
                // Add event listener for comment button
                const commentButton = postElement.querySelector('.post-action.comment');
                commentButton.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const commentSection = postElement.querySelector('.comment-section');
                    commentSection.style.display = commentSection.style.display === 'block' ? 'none' : 'block';
                });
                
                // Add event listener for like button
                const likeButton = postElement.querySelector('.post-action.like');
                likeButton.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const isActive = likeButton.classList.contains('active');
                    const likeCount = likeButton.querySelector('span:last-child');
                    
                    if (isActive) {
                        likeButton.classList.remove('active');
                        likeButton.querySelector('.material-icons').textContent = 'favorite_border';
                        likeButton.querySelector('.material-icons').style.fontVariationSettings = '';
                        likeCount.textContent = parseInt(likeCount.textContent) - 1;
                        
                        // Remove from localStorage
                        const index = likedPosts.indexOf(postId);
                        if (index > -1) {
                            likedPosts.splice(index, 1);
                            localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
                        }
                    } else {
                        likeButton.classList.add('active');
                        likeButton.querySelector('.material-icons').textContent = 'favorite';
                        likeButton.querySelector('.material-icons').style.fontVariationSettings = "'FILL' 1";
                        likeCount.textContent = parseInt(likeCount.textContent) + 1;
                        
                        // Add to localStorage
                        likedPosts.push(postId);
                        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
                    }
                });
                
                // Add event listener for comment submission
                const commentSubmit = postElement.querySelector('.comment-submit');
                const commentTextarea = postElement.querySelector('.comment-textarea');
                
                commentTextarea.addEventListener('input', function() {
                    commentSubmit.disabled = commentTextarea.value.trim() === '';
                });
                
                commentSubmit.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const commentText = commentTextarea.value.trim();
                    if (commentText === '') return;
                    
                    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    if (!currentUser) return;
                    
                    // Create new comment
                    const newComment = {
                        userName: currentUser.name,
                        userHandle: currentUser.username,
                        userPic: currentUser.picture,
                        text: commentText,
                        time: 'ahora'
                    };
                    
                    // Add comment to DOM
                    const commentsList = postElement.querySelector('.comments-list');
                    const commentElement = document.createElement('div');
                    commentElement.className = 'comment';
                    commentElement.innerHTML = `
                        <img src="${newComment.userPic}" alt="Profile" class="profile-pic">
                        <div class="comment-content">
                            <div class="comment-header">
                                <span class="comment-username">${newComment.userName}</span>
                                <span class="comment-userhandle">@${newComment.userHandle}</span>
                                <span class="comment-time">· ${newComment.time}</span>
                            </div>
                            <p class="comment-text">${newComment.text}</p>
                        </div>
                    `;
                    commentsList.appendChild(commentElement);
                    
                    // Update comment count
                    const commentCount = postElement.querySelector('.post-action.comment span:last-child');
                    commentCount.textContent = parseInt(commentCount.textContent) + 1;
                    
                    // Save comment to localStorage
                    if (!postComments[postId]) {
                        postComments[postId] = [];
                    }
                    postComments[postId].unshift(newComment);
                    localStorage.setItem('postComments', JSON.stringify(postComments));
                    
                    // Clear textarea
                    commentTextarea.value = '';
                    commentSubmit.disabled = true;
                });
            });
            
        } catch (error) {
            console.error('Error loading posts:', error);
            // Fallback content if API fails
            const postsContainer = document.getElementById('posts-container');
            postsContainer.innerHTML = `
                <div class="post">
                    <img src="https://via.placeholder.com/50" alt="Profile" class="profile-pic">
                    <div class="post-content">
                        <div class="post-header">
                            <span class="post-username">Usuario Ejemplo</span>
                            <span class="post-userhandle">@usuario</span>
                            <span class="post-time">· hace 2h</span>
                        </div>
                        <p class="post-text">Este es un ejemplo de publicación cuando la API no está disponible.</p>
                        <div class="post-actions">
                            <div class="post-action comment">
                                <span class="material-icons">chat_bubble_outline</span>
                                <span>24</span>
                            </div>
                            <div class="post-action">
                                <span class="material-icons">repeat</span>
                                <span>5</span>
                            </div>
                            <div class="post-action like">
                                <span class="material-icons">favorite_border</span>
                                <span>128</span>
                            </div>
                            <div class="post-action">
                                <span class="material-icons">share</span>
                            </div>
                        </div>
                        <div class="comment-section">
                            <div class="comment-input">
                                <img src="https://via.placeholder.com/50" alt="Profile" class="profile-pic comment-profile-pic">
                                <textarea placeholder="Escribe un comentario..." class="comment-textarea"></textarea>
                                <button class="comment-submit">Comentar</button>
                            </div>
                            <div class="comments-list"></div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add event listeners to fallback post
            const fallbackPost = postsContainer.querySelector('.post');
            const fallbackLikeButton = fallbackPost.querySelector('.post-action.like');
            const fallbackCommentButton = fallbackPost.querySelector('.post-action.comment');
            const fallbackCommentSubmit = fallbackPost.querySelector('.comment-submit');
            const fallbackCommentTextarea = fallbackPost.querySelector('.comment-textarea');
            
            // Like button functionality
            fallbackLikeButton.addEventListener('click', function(e) {
                e.stopPropagation();
                const isActive = fallbackLikeButton.classList.contains('active');
                const likeCount = fallbackLikeButton.querySelector('span:last-child');
                
                if (isActive) {
                    fallbackLikeButton.classList.remove('active');
                    fallbackLikeButton.querySelector('.material-icons').textContent = 'favorite_border';
                    likeCount.textContent = parseInt(likeCount.textContent) - 1;
                } else {
                    fallbackLikeButton.classList.add('active');
                    fallbackLikeButton.querySelector('.material-icons').textContent = 'favorite';
                    likeCount.textContent = parseInt(likeCount.textContent) + 1;
                }
            });
            
            // Comment button functionality
            fallbackCommentButton.addEventListener('click', function(e) {
                e.stopPropagation();
                const commentSection = fallbackPost.querySelector('.comment-section');
                commentSection.style.display = commentSection.style.display === 'block' ? 'none' : 'block';
            });
            
            // Comment submission functionality
            fallbackCommentTextarea.addEventListener('input', function() {
                fallbackCommentSubmit.disabled = fallbackCommentTextarea.value.trim() === '';
            });
            
            fallbackCommentSubmit.addEventListener('click', function(e) {
                e.stopPropagation();
                const commentText = fallbackCommentTextarea.value.trim();
                if (commentText === '') return;
                
                const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
                    name: 'Usuario Ejemplo',
                    username: 'usuario',
                    picture: 'https://via.placeholder.com/50'
                };
                
                // Create new comment
                const newComment = {
                    userName: currentUser.name,
                    userHandle: currentUser.username,
                    userPic: currentUser.picture,
                    text: commentText,
                    time: 'ahora'
                };
                
                // Add comment to DOM
                const commentsList = fallbackPost.querySelector('.comments-list');
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                    <img src="${newComment.userPic}" alt="Profile" class="profile-pic">
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-username">${newComment.userName}</span>
                            <span class="comment-userhandle">@${newComment.userHandle}</span>
                            <span class="comment-time">· ${newComment.time}</span>
                        </div>
                        <p class="comment-text">${newComment.text}</p>
                    </div>
                `;
                commentsList.appendChild(commentElement);
                
                // Update comment count
                const commentCount = fallbackPost.querySelector('.post-action.comment span:last-child');
                commentCount.textContent = parseInt(commentCount.textContent) + 1;
                
                // Clear textarea
                fallbackCommentTextarea.value = '';
                fallbackCommentSubmit.disabled = true;
            });
        }
    }
    
    // Load suggested users to follow
    async function loadSuggestedUsers() {
        try {
            const response = await fetch('https://randomuser.me/api/?results=3');
            const data = await response.json();
            const users = data.results;
            
            const suggestions = document.querySelectorAll('.user-suggestion');
            suggestions.forEach((suggestion, index) => {
                if (users[index]) {
                    const user = users[index];
                    const img = suggestion.querySelector('.suggestion-pic');
                    const username = suggestion.querySelector('.username');
                    const userhandle = suggestion.querySelector('.user-handle');
                    
                    img.src = user.picture.thumbnail;
                    username.textContent = `${user.name.first} ${user.name.last}`;
                    userhandle.textContent = `@${user.login.username}`;
                }
            });
            
        } catch (error) {
            console.error('Error loading suggested users:', error);
        }
    }
    
    // Post creation functionality
    const postTextarea = document.getElementById('post-textarea');
    const submitPostButton = document.getElementById('submit-post');
    
    postTextarea.addEventListener('input', function() {
        submitPostButton.disabled = postTextarea.value.trim() === '';
    });
    
    submitPostButton.addEventListener('click', function() {
        const postText = postTextarea.value.trim();
        if (postText === '') return;
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        const postsContainer = document.getElementById('posts-container');
        const newPostId = `post-${Date.now()}`;
        
        const newPostElement = document.createElement('div');
        newPostElement.className = 'post';
        newPostElement.dataset.postId = newPostId;
        
        newPostElement.innerHTML = `
            <img src="${currentUser.picture}" alt="Profile" class="profile-pic">
            <div class="post-content">
                <div class="post-header">
                    <span class="post-username">${currentUser.name}</span>
                    <span class="post-userhandle">@${currentUser.username}</span>
                    <span class="post-time">· ahora</span>
                </div>
                <p class="post-text">${postText}</p>
                <div class="post-actions">
                    <div class="post-action comment">
                        <span class="material-icons">chat_bubble_outline</span>
                        <span>0</span>
                    </div>
                    <div class="post-action">
                        <span class="material-icons">repeat</span>
                        <span>0</span>
                    </div>
                    <div class="post-action like">
                        <span class="material-icons">favorite_border</span>
                        <span>0</span>
                    </div>
                    <div class="post-action">
                        <span class="material-icons">share</span>
                    </div>
                </div>
                <div class="comment-section">
                    <div class="comment-input">
                        <img src="${currentUser.picture}" alt="Profile" class="profile-pic comment-profile-pic">
                        <textarea placeholder="Escribe un comentario..." class="comment-textarea"></textarea>
                        <button class="comment-submit">Comentar</button>
                    </div>
                    <div class="comments-list"></div>
                </div>
            </div>
        `;
        
        // Insert new post at the top
        postsContainer.insertBefore(newPostElement, postsContainer.firstChild);
        
        // Add event listeners to the new post
        const likeButton = newPostElement.querySelector('.post-action.like');
        const commentButton = newPostElement.querySelector('.post-action.comment');
        const commentSubmit = newPostElement.querySelector('.comment-submit');
        const commentTextarea = newPostElement.querySelector('.comment-textarea');
        
        // Like button functionality
        likeButton.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = likeButton.classList.contains('active');
            const likeCount = likeButton.querySelector('span:last-child');
            
            if (isActive) {
                likeButton.classList.remove('active');
                likeButton.querySelector('.material-icons').textContent = 'favorite_border';
                likeButton.querySelector('.material-icons').style.fontVariationSettings = '';
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
                
                // Remove from localStorage
                const likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
                const index = likedPosts.indexOf(newPostId);
                if (index > -1) {
                    likedPosts.splice(index, 1);
                    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
                }
            } else {
                likeButton.classList.add('active');
                likeButton.querySelector('.material-icons').textContent = 'favorite';
                likeButton.querySelector('.material-icons').style.fontVariationSettings = "'FILL' 1";
                likeCount.textContent = parseInt(likeCount.textContent) + 1;
                
                // Add to localStorage
                const likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
                likedPosts.push(newPostId);
                localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
            }
        });
        
        // Comment button functionality
        commentButton.addEventListener('click', function(e) {
            e.stopPropagation();
            const commentSection = newPostElement.querySelector('.comment-section');
            commentSection.style.display = commentSection.style.display === 'block' ? 'none' : 'block';
        });
        
        // Comment submission functionality
        commentTextarea.addEventListener('input', function() {
            commentSubmit.disabled = commentTextarea.value.trim() === '';
        });
        
        commentSubmit.addEventListener('click', function(e) {
            e.stopPropagation();
            const commentText = commentTextarea.value.trim();
            if (commentText === '') return;
            
            // Create new comment
            const newComment = {
                userName: currentUser.name,
                userHandle: currentUser.username,
                userPic: currentUser.picture,
                text: commentText,
                time: 'ahora'
            };
            
            // Add comment to DOM
            const commentsList = newPostElement.querySelector('.comments-list');
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <img src="${newComment.userPic}" alt="Profile" class="profile-pic">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-username">${newComment.userName}</span>
                        <span class="comment-userhandle">@${newComment.userHandle}</span>
                        <span class="comment-time">· ${newComment.time}</span>
                    </div>
                    <p class="comment-text">${newComment.text}</p>
                </div>
            `;
            commentsList.appendChild(commentElement);
            
            // Update comment count
            const commentCount = newPostElement.querySelector('.post-action.comment span:last-child');
            commentCount.textContent = parseInt(commentCount.textContent) + 1;
            
            // Save comment to localStorage
            const postComments = JSON.parse(localStorage.getItem('postComments')) || {};
            if (!postComments[newPostId]) {
                postComments[newPostId] = [];
            }
            postComments[newPostId].unshift(newComment);
            localStorage.setItem('postComments', JSON.stringify(postComments));
            
            // Clear textarea
            commentTextarea.value = '';
            commentSubmit.disabled = true;
        });
        
        // Clear post textarea
        postTextarea.value = '';
        submitPostButton.disabled = true;
    });
    
    // Initialize the app
    loadRandomUsers();
    
    // Mobile menu toggle (simplified for this example)
    const mobileIcons = document.querySelectorAll('.mobile-nav .material-icons');
    mobileIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            alert(`Navegando a ${icon.textContent.trim()}`);
        });
    });
});