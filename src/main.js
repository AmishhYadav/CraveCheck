import { feedData } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const ageSelector = document.getElementById('age-selector');
  const splashView = document.getElementById('splash-view');
  const feedView = document.getElementById('feed-view');

  let currentScore = 100;
  let completedPosts = 0;
  const TOTAL_POSTS = feedData.length;
  let surveyData = [];

  // Super simple CSV parser
  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
      const values = line.split(regex);
      let obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] ? values[i].replace(/^"|"$/g, '').trim() : '';
      });
      return obj;
    }).filter(obj => obj['Age Group']);
  };

  const getBaselineForAge = (ageGroup) => {
    const demographicProfiles = surveyData.filter(p => p['Age Group'] === ageGroup);
    if (!demographicProfiles.length) return 50; // fallback

    let totalScore = 0;
    demographicProfiles.forEach(p => {
      let score = 0;
      
      // Nutrition check
      const checks = p['Do you usually check nutritional information before eating?'];
      if (checks === 'Always') score += 30;
      else if (checks === 'Sometimes') score += 15;
      else if (checks === 'Rarely') score += 5;

      // Behavior reduction
      const reduce = p['After seeing the health impact prediction, would you reduce frequent consumption?'];
      if (reduce === 'Yes') score += 30;
      else if (reduce === 'Maybe') score += 15;

      // Surprise baseline (not surprised = more aware)
      const surprised = p['Were you surprised by the nutritional facts shown?'];
      if (surprised === 'Not surprised') score += 20;
      else if (surprised === 'Slightly surprised') score += 10;

      // Craving impulse control
      const craving = p['Have you ever craved food after watching a food reel?'];
      if (craving === 'Never') score += 20;
      else if (craving === 'Rarely') score += 15;
      else if (craving === 'Sometimes') score += 5;

      totalScore += score;
    });

    return Math.round(totalScore / demographicProfiles.length);
  };

  const predictWouldEat = (features) => {
    let logOdds = 1.6083;
    logOdds += (features.age_group || 0) * -0.5061;
    logOdds += (features.average_daily_social_media_usage || 0) * 0.0940;
    logOdds += (features.do_you_usually_check_nutritional_information_before_eating || 0) * -0.3052;
    logOdds += (features.do_you_think_social_media_promotes_unhealthy_eating_habits || 0) * 0.5622;
    logOdds += (features.dietary_preference_non_vegetarian || 0) * 0.2564;
    logOdds += (features.dietary_preference_vegan || 0) * -0.3853;
    logOdds += (features.dietary_preference_vegetarian || 0) * 0.4096;

    const probability = 1 / (1 + Math.exp(-logOdds));
    return {
        prediction: probability >= 0.5 ? "Would Eat" : "Pass",
        probability: probability
    };
  };

  const getMLPredictionForAge = (ageGroup) => {
    const profiles = surveyData.filter(p => p['Age Group'] === ageGroup);
    if (!profiles.length) return 0.5;

    let totalProb = 0;
    profiles.forEach(p => {
      const ageMap = {'Below 18': 1, '18-22': 2, '23-30': 3, '31-40': 4, 'Above 40': 5};
      const smMap = {'Less than 1 hour': 1, '1-2 hours': 2, '3-4 hours': 3, 'More than 4 hours': 4};
      const nutMap = {'Never': 1, 'Rarely': 2, 'Sometimes': 3, 'Always': 4};
      const unhealthyMap = {'Disagree': 1, 'Neutral': 2, 'Agree': 3};
      
      const features = {
        age_group: ageMap[p['Age Group']] || 2,
        average_daily_social_media_usage: smMap[p['Average daily social media usage']] || 2,
        do_you_usually_check_nutritional_information_before_eating: nutMap[p['Do you usually check nutritional information before eating?']] || 2,
        do_you_think_social_media_promotes_unhealthy_eating_habits: unhealthyMap[p['Do you think social media promotes unhealthy eating habits?']] || 2,
        dietary_preference_non_vegetarian: p['Dietary Preference'] === 'Non-vegetarian' ? 1 : 0,
        dietary_preference_vegan: p['Dietary Preference'] === 'Vegan' ? 1 : 0,
        dietary_preference_vegetarian: p['Dietary Preference'] === 'Vegetarian' ? 1 : 0
      };

      totalProb += predictWouldEat(features).probability;
    });

    return totalProb / profiles.length;
  };

  const renderFeed = () => {
    feedView.innerHTML = `
      <div class="score-header" id="score-header">
        <span class="score-label">Awareness Score</span>
        <span class="score-value" id="score-value">${currentScore}</span>
      </div>
    `;
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
          <div class="flipper">
            <div class="front">
              <img src="${post.imageUrl}" alt="Post image" class="post-image" loading="lazy" />
              <button class="btn-reveal" aria-label="Reveal Reality">
                <svg viewBox="0 0 24 24" fill="none" class="icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                Real View
              </button>
            </div>
            <div class="back">
              <div class="real-view-section">
                <div class="nutrition-grid">
                  <div>
                    <span class="nut-value">${post.realView.nutrition.calories}</span>
                    <span class="nut-label">Calories</span>
                  </div>
                  <div>
                    <span class="nut-value">${post.realView.nutrition.sugar}</span>
                    <span class="nut-label">Sugar</span>
                  </div>
                  <div>
                    <span class="nut-value">${post.realView.nutrition.fat}</span>
                    <span class="nut-label">Fat</span>
                  </div>
                </div>
              </div>
              
              <div class="real-view-section">
                <h4 class="section-title">AI Analysis</h4>
                <div class="ai-tactics-text">
                  ${post.realView.aiTactics}
                </div>
              </div>
              
              <div class="real-view-section">
                <div class="bias-container">
                  <span class="bias-label">Bias Score</span>
                  <span class="bias-number">${post.realView.biasScore}</span>
                </div>
              </div>
              
              <div class="real-view-section">
                <h4 class="section-title">Healthy Alternative</h4>
                <div class="healthy-alt-card">
                  <div class="healthy-alt-title">${post.realView.healthyAlternative.title}</div>
                  <div class="healthy-alt-benefit">${post.realView.healthyAlternative.benefit}</div>
                </div>
              </div>
              
              <button class="btn-reveal" aria-label="Return to Image" style="position: relative; margin-top: auto; right: auto; bottom: auto; width: fit-content; align-self: flex-end; color: #333; background: #eee; border: 1px solid #ddd;">
                <svg viewBox="0 0 24 24" fill="none" class="icon" style="stroke: #333;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle><line x1="1" y1="1" x2="23" y2="23" stroke="#eb4d4b" stroke-width="2"></line></svg>
                Close View
              </button>
            </div>
          </div>
        </div>
        <div class="post-actions">
          <button class="action-btn btn-would-eat" aria-label="Would Eat" data-bias="${post.realView.biasScore}">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Would Eat
          </button>
          <button class="action-btn btn-pass" aria-label="Pass">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            Pass
          </button>
        </div>
        <div class="post-likes">
          <strong>${post.likes.toLocaleString()} people</strong> ate this
        </div>
        <div class="post-caption">
          <strong>${post.authorName}</strong> ${post.caption}
        </div>
      `;
      feedView.appendChild(postEl);
    });

    // Event Delegation
    feedView.addEventListener('click', (e) => {
      // Flip logic
      const revealBtn = e.target.closest('.btn-reveal');
      if (revealBtn) {
        const flipper = revealBtn.closest('.flipper');
        if (flipper) {
          flipper.classList.toggle('is-flipped');
        }
        return;
      }

      // Action logic
      const actionBtn = e.target.closest('.action-btn');
      if (actionBtn && !actionBtn.hasAttribute('disabled')) {
        const actionRow = actionBtn.closest('.post-actions');
        const btns = actionRow.querySelectorAll('.action-btn');
        btns.forEach(b => b.setAttribute('disabled', 'true')); // Lock choice

        if (actionBtn.classList.contains('btn-would-eat')) {
          actionBtn.style.opacity = '1';
          const bias = parseInt(actionBtn.getAttribute('data-bias'), 10);
          // Penalty logic: 20% of bias score, capped at 15
          const penalty = Math.min(Math.round(bias * 0.2), 15);
          currentScore -= penalty;
          
          const header = document.getElementById('score-header');
          header.classList.add('pulse-red');
          setTimeout(() => header.classList.remove('pulse-red'), 300);
        } else if (actionBtn.classList.contains('btn-pass')) {
          actionBtn.style.opacity = '1';
          currentScore = Math.min(100, currentScore + 5);
        }

        const scoreEl = document.getElementById('score-value');
        scoreEl.textContent = currentScore;
        if (currentScore < 50) {
          scoreEl.classList.add('danger');
        }

        completedPosts++;
        if (completedPosts === TOTAL_POSTS) {
          setTimeout(showInsights, 600);
        }
      }
    });

    feedView.classList.add('active-feed');
  };

  const showInsights = () => {
    feedView.style.overflow = 'hidden'; // Lock scroll
    
    let verdict = '';
    if (currentScore >= 80) {
      verdict = "Outstanding. You're highly resistant to deceptive food marketing and aesthetic manipulation.";
    } else if (currentScore >= 50) {
      verdict = "Average. You caught some tricks but fell for others. Keep building your awareness.";
    } else {
      verdict = "Vulnerable. You were highly susceptible to aesthetic manipulation masking poor nutrition.";
    }

    const age = sessionStorage.getItem('cravecheck_age') || 'your demographic';
    const baselineScore = getBaselineForAge(age);
    const difference = currentScore - baselineScore;
    
    const mlProb = getMLPredictionForAge(age);
    const mlPercentage = Math.round(mlProb * 100);

    let comparisonText = '';
    if (difference > 0) {
      comparisonText = `You scored <strong>${difference} points higher</strong> than the average user in the <strong>${age}</strong> baseline dataset (${baselineScore} avg).`;
    } else if (difference < 0) {
      comparisonText = `You scored <strong>${Math.abs(difference)} points lower</strong> than the average user in the <strong>${age}</strong> baseline dataset (${baselineScore} avg).`;
    } else {
      comparisonText = `You scored exactly equal to the average user in the <strong>${age}</strong> baseline dataset (${baselineScore} avg).`;
    }

    const overlay = document.createElement('div');
    overlay.id = 'insights-overlay';
    overlay.innerHTML = `
      <h2 class="insights-title">Session Complete</h2>
      <div class="insights-score" style="color: ${currentScore < 50 ? 'var(--color-destructive)' : 'var(--color-accent)'}">${currentScore}</div>
      <p class="insights-verdict">${verdict}</p>
      <div style="background: #fdfbfb; border: 1px solid #ddd; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p class="insights-verdict" style="font-size: 14px; margin: 0; color: #333;">${comparisonText}</p>
      </div>
      <div style="background: #f0f7ff; border: 1px solid #cce3ff; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p class="insights-verdict" style="font-size: 14px; margin: 0; color: #0056b3; line-height: 1.5;">
          <strong>🤖 ML Insight:</strong> Based on behavioral patterns, our embedded Logistic Regression model predicts that people in your age group have an average <strong>${mlPercentage}% likelihood</strong> of craving the food seen in these reels ("Would Eat").
        </p>
      </div>
      <button class="btn-primary" onclick="sessionStorage.removeItem('cravecheck_age'); location.reload();" style="width: auto; padding: 12px 32px;">Restart Session</button>
    `;
    feedView.appendChild(overlay);
  };

  // Pre-load the dataset, then check session status
  fetch('/final_responses_correct_format.csv')
    .then(res => res.text())
    .then(csv => {
      surveyData = parseCSV(csv);
      console.log(`Loaded ${surveyData.length} baseline responses.`);
      
      const storedAge = sessionStorage.getItem('cravecheck_age');
      if (storedAge) {
        splashView.style.display = 'none';
        feedView.style.display = 'block';
        console.log(`Resuming session for age group: ${storedAge}`);
        renderFeed();
      }
    })
    .catch(err => console.error('Failed to load dataset', err));

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

