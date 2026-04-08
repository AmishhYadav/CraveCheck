import { feedData } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const ageSelector = document.getElementById('age-selector');
  const splashView = document.getElementById('splash-view');
  const feedView = document.getElementById('feed-view');

  const renderFeed = () => {
    feedView.innerHTML = '';
    feedData.forEach(post => {
      const postEl = document.createElement('article');
      postEl.className = 'feed-post';
      postEl.innerHTML = `
        <header class="post-header">
          <img src="${post.avatarUrl}" alt="${post.authorName}" class="post-avatar" loading="lazy" />
          <div class="post-author-info">
            <h3 class="post-author-name">${post.authorName}</h3>
            <span class="post-author-handle">${post.authorHandle}</span>
          </div>
        </header>
        <div class="post-image-container">
          <img src="${post.imageUrl}" alt="Post image" class="post-image" loading="lazy" />
        </div>
        <div class="post-actions">
          <button class="action-btn heartbeat-btn" aria-label="Like">
            <svg viewBox="0 0 24 24" class="icon heart-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
          <button class="action-btn" aria-label="Comment">
            <svg viewBox="0 0 24 24" class="icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </button>
          <button class="action-btn" aria-label="Share">
            <svg viewBox="0 0 24 24" class="icon"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
        <div class="post-likes">
          <strong>${post.likes.toLocaleString()} likes</strong>
        </div>
        <div class="post-caption">
          <strong>${post.authorName}</strong> ${post.caption}
        </div>
      `;
      feedView.appendChild(postEl);
    });

    // Delegate heart interaction
    feedView.addEventListener('click', (e) => {
      const heartBtn = e.target.closest('.heartbeat-btn');
      if (heartBtn) {
        heartBtn.classList.toggle('liked');
      }
    });

    // Make sure styles and scroll works
    feedView.classList.add('active-feed');
  };

  // Check if age is already set in this session
  const storedAge = sessionStorage.getItem('cravecheck_age');
  if (storedAge) {
    splashView.style.display = 'none';
    feedView.style.display = 'block';
    console.log(`Resuming session for age group: ${storedAge}`);
    renderFeed();
  }

  startBtn.addEventListener('click', () => {
    const selectedAge = ageSelector.value;
    sessionStorage.setItem('cravecheck_age', selectedAge);
    
    // Transition views
    splashView.style.display = 'none';
    feedView.style.display = 'block';
    
    console.log(`Age group ${selectedAge} selected. Starting feed...`);
    renderFeed();
  });
});

