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
  let userChoices = [];

  // ─── Scroll-driven hero animation ───
  const heroMedia = document.getElementById('hero-media-card');
  const titleLeft = document.getElementById('split-title-left');
  const titleRight = document.getElementById('split-title-right');
  const heroContent = document.getElementById('hero-content');
  const heroOverlay = document.getElementById('hero-overlay');

  if (heroMedia) {
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.min(window.scrollY / (window.innerHeight * 1.5), 1);
      const width = 40 + (scrollPercent * 60);
      const height = 60 + (scrollPercent * 40);
      const borderRadius = 12 - (scrollPercent * 12);

      heroMedia.style.width = `${width}vw`;
      heroMedia.style.height = `${height}vh`;
      heroMedia.style.borderRadius = `${borderRadius}px`;

      const moveDist = scrollPercent * 40;
      if (titleLeft) {
        titleLeft.style.transform = `translateY(-50%) translateX(-${moveDist}vw)`;
        titleLeft.style.opacity = Math.max(0, 1 - scrollPercent * 1.5);
      }
      if (titleRight) {
        titleRight.style.transform = `translateY(-50%) translateX(${moveDist}vw)`;
        titleRight.style.opacity = Math.max(0, 1 - scrollPercent * 1.5);
      }

      if (scrollPercent > 0.8) {
        if (heroContent) { heroContent.style.opacity = '1'; heroContent.style.transform = 'translateY(0)'; }
        if (heroOverlay) { heroOverlay.style.opacity = '1'; }
      } else {
        if (heroContent) { heroContent.style.opacity = '0'; heroContent.style.transform = 'translateY(20px)'; }
        if (heroOverlay) { heroOverlay.style.opacity = '0'; }
      }
    });
  }

  // ─── Reveal Sections on Scroll ───
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal-section').forEach(s => observer.observe(s));

  // ─── CSV Parser ───
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

  // ─── Baseline Score ───
  const getBaselineForAge = (ageGroup) => {
    const profiles = surveyData.filter(p => p['Age Group'] === ageGroup);
    if (!profiles.length) return 50;
    let totalScore = 0;
    profiles.forEach(p => {
      let score = 0;
      const checks = p['Do you usually check nutritional information before eating?'];
      if (checks === 'Always') score += 30;
      else if (checks === 'Sometimes') score += 15;
      else if (checks === 'Rarely') score += 5;

      const reduce = p['After seeing the health impact prediction, would you reduce frequent consumption?'];
      if (reduce === 'Yes') score += 30;
      else if (reduce === 'Maybe') score += 15;

      const surprised = p['Were you surprised by the nutritional facts shown?'];
      if (surprised === 'Not surprised') score += 20;
      else if (surprised === 'Slightly surprised') score += 10;

      const craving = p['Have you ever craved food after watching a food reel?'];
      if (craving === 'Never') score += 20;
      else if (craving === 'Rarely') score += 15;
      else if (craving === 'Sometimes') score += 5;

      totalScore += score;
    });
    return Math.round(totalScore / profiles.length);
  };

  // ─── ML Prediction ───
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
    return { prediction: probability >= 0.5 ? "Would Eat" : "Pass", probability };
  };

  // ─── Demographic Insights ───
  const getDemographicInsights = (ageGroup) => {
    const profiles = surveyData.filter(p => p['Age Group'] === ageGroup);
    const allProfiles = surveyData;
    if (!profiles.length) return null;

    const count = (arr, key, val) => arr.filter(p => p[key] === val).length;
    const pct = (c, total) => total > 0 ? Math.round((c / total) * 100) : 0;

    const cravingFreq = {};
    ['Very often', 'Often', 'Sometimes', 'Rarely', 'Never'].forEach(v => {
      cravingFreq[v] = pct(count(profiles, 'Have you ever craved food after watching a food reel?', v), profiles.length);
    });

    const attractors = {};
    profiles.forEach(p => {
      const raw = p['When watching food reels, what attracts you most?'] || '';
      raw.split(',').map(s => s.trim()).filter(Boolean).forEach(a => {
        attractors[a] = (attractors[a] || 0) + 1;
      });
    });
    const topAttractors = Object.entries(attractors)
      .sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([name, c]) => ({ name, pct: pct(c, profiles.length) }));

    const emotions = {};
    profiles.forEach(p => {
      const e = p['Which emotion best describes your reaction to viral food videos?'] || '';
      if (e) emotions[e] = (emotions[e] || 0) + 1;
    });
    const topEmotion = Object.entries(emotions).sort((a, b) => b[1] - a[1])[0];

    const checkNutrition = {};
    ['Always', 'Sometimes', 'Rarely', 'Never'].forEach(v => {
      checkNutrition[v] = pct(count(profiles, 'Do you usually check nutritional information before eating?', v), profiles.length);
    });

    const wouldReduce = pct(count(profiles, 'After seeing the health impact prediction, would you reduce frequent consumption?', 'Yes'), profiles.length);
    const maybeReduce = pct(count(profiles, 'After seeing the health impact prediction, would you reduce frequent consumption?', 'Maybe'), profiles.length);
    const surprised = pct(count(profiles, 'Were you surprised by the nutritional facts shown?', 'Very surprised'), profiles.length);
    const slightlySurprised = pct(count(profiles, 'Were you surprised by the nutritional facts shown?', 'Slightly surprised'), profiles.length);

    const smUsage = {};
    ['Less than 1 hour', '1-2 hours', '3-4 hours', 'More than 4 hours'].forEach(v => {
      smUsage[v] = pct(count(profiles, 'Average daily social media usage', v), profiles.length);
    });
    const highUsage = (smUsage['3-4 hours'] || 0) + (smUsage['More than 4 hours'] || 0);

    const seesOften = pct(
      count(profiles, 'How often do you see food related posts/reels?', 'Very often') +
      count(profiles, 'How often do you see food related posts/reels?', 'Often'),
      profiles.length
    );

    const dietSplit = {};
    ['Vegetarian', 'Non-vegetarian', 'Vegan'].forEach(v => {
      dietSplit[v] = pct(count(profiles, 'Dietary Preference', v), profiles.length);
    });

    return {
      sampleSize: profiles.length, totalDataset: allProfiles.length,
      cravingFreq, topAttractors,
      topEmotion: topEmotion ? { name: topEmotion[0], pct: pct(topEmotion[1], profiles.length) } : null,
      checkNutrition, wouldReduce, maybeReduce, surprised, slightlySurprised,
      highUsage, seesOften, dietSplit
    };
  };

  const getMLPredictionForAge = (ageGroup) => {
    const profiles = surveyData.filter(p => p['Age Group'] === ageGroup);
    if (!profiles.length) return { avg: 0.5, predictions: [] };

    let totalProb = 0;
    const predictions = [];
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
      const result = predictWouldEat(features);
      totalProb += result.probability;
      predictions.push(result);
    });

    return {
      avg: totalProb / profiles.length,
      wouldEatCount: predictions.filter(p => p.prediction === 'Would Eat').length,
      passCount: predictions.filter(p => p.prediction === 'Pass').length,
      predictions
    };
  };

  // ─── NLP Analysis Generator ───
  const generateNLPAnalysis = (post, ageGroup) => {
    const insights = getDemographicInsights(ageGroup);
    const ml = getMLPredictionForAge(ageGroup);
    const mlPct = Math.round(ml.avg * 100);
    const calories = parseInt(post.realView.nutrition.calories);
    const sugar = parseInt(post.realView.nutrition.sugar);
    const fat = parseInt(post.realView.nutrition.fat);
    const bias = post.realView.biasScore;

    let calorieRisk = 'moderate';
    if (calories > 1000) calorieRisk = 'extreme';
    else if (calories > 700) calorieRisk = 'high';
    else if (calories < 400) calorieRisk = 'low';

    const dailySugarLimit = 25;
    const sugarRatio = Math.round((sugar / dailySugarLimit) * 100);

    const sections = [];

    sections.push({
      title: 'Caption Manipulation', icon: '🎭',
      content: post.realView.aiTactics,
      severity: bias > 85 ? 'critical' : bias > 70 ? 'warning' : 'info'
    });

    const avgMealCal = 600;
    const mealEquiv = (calories / avgMealCal).toFixed(1);
    sections.push({
      title: 'Calorie Context', icon: '🔥',
      content: `This single item contains <strong>${calories} calories</strong> — equivalent to <strong>${mealEquiv} full meals</strong>. ` +
        (calorieRisk === 'extreme' ? 'This exceeds half the daily recommended intake in one serving.' :
         calorieRisk === 'high' ? 'This is significantly above a healthy single-meal threshold.' :
         calorieRisk === 'low' ? 'This is within a healthy range for a light meal or snack.' :
         'This is within a reasonable range for a main meal.'),
      severity: calorieRisk === 'extreme' || calorieRisk === 'high' ? 'critical' : 'info'
    });

    sections.push({
      title: 'Sugar Impact', icon: '🍬',
      content: `Contains <strong>${sugar}g of sugar</strong> — that's <strong>${sugarRatio}%</strong> of the WHO daily limit (${dailySugarLimit}g) in a single serving. ` +
        (sugarRatio > 200 ? 'This is dangerously excessive.' :
         sugarRatio > 100 ? 'This alone exceeds the full daily recommended sugar intake.' :
         'Sugar content is within moderation.'),
      severity: sugarRatio > 200 ? 'critical' : sugarRatio > 100 ? 'warning' : 'info'
    });

    if (insights) {
      const cravingHigh = (insights.cravingFreq['Very often'] || 0) + (insights.cravingFreq['Often'] || 0) + (insights.cravingFreq['Sometimes'] || 0);
      sections.push({
        title: 'Behavioral Prediction', icon: '🤖',
        content: `Our ML model (Logistic Regression, trained on ${insights.totalDataset} responses) predicts <strong>${mlPct}% of users in the ${ageGroup} group</strong> would crave this food. ` +
          `In the dataset, <strong>${cravingHigh}%</strong> reported craving food after reels. ` +
          (insights.topEmotion ? `The dominant emotional response is <strong>"${insights.topEmotion.name}"</strong> (${insights.topEmotion.pct}%).` : ''),
        severity: mlPct > 65 ? 'warning' : 'info'
      });
    }

    sections.push({
      title: 'Manipulation Score', icon: '⚠️',
      content: `Bias score: <strong>${bias}/100</strong>. ` +
        (bias > 85 ? 'Extremely manipulative content — uses multiple psychological triggers to override rational food evaluation.' :
         bias > 70 ? 'Significant manipulation detected — caption framing actively distorts nutritional perception.' :
         bias > 30 ? 'Mild persuasive framing detected, but nutritional reality is not heavily obscured.' :
         'Low manipulation — this post presents largely honest nutritional information.'),
      severity: bias > 85 ? 'critical' : bias > 70 ? 'warning' : 'info'
    });

    return sections;
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER FEED
  // ═══════════════════════════════════════════════════════════
  const renderFeed = () => {
    const age = sessionStorage.getItem('cravecheck_age') || '18-22';

    feedView.innerHTML = `
      <!-- Feed Nav -->
      <nav class="feed-nav">
        <div class="feed-nav-inner">
          <div class="feed-nav-logo">CraveCheck</div>
          <div class="feed-nav-meta">
            <div class="feed-meta-item">
              <div class="feed-meta-label">Cohort</div>
              <div class="feed-meta-value">Age: ${age}</div>
            </div>
            <div class="feed-meta-divider"></div>
            <div class="feed-meta-item">
              <div class="feed-meta-label">Session</div>
              <div class="feed-meta-value" id="progress-label">Progress: 0/${TOTAL_POSTS} posts</div>
            </div>
          </div>
          <div class="score-badge" id="score-badge">
            <span class="score-badge-label">Awareness</span>
            <span class="score-badge-value" id="score-value">${currentScore}</span>
          </div>
        </div>
      </nav>

      <div class="feed-main">
        <!-- Wellness Dashboard -->
        <section class="wellness-dashboard">
          <div>
            <p class="wellness-info-label">Today's Feed Analysis</p>
            <h2 class="wellness-info-title">Wellness Dashboard</h2>
          </div>
          <div class="wellness-stats-row">
            <div class="wellness-stat">
              <div class="wellness-stat-value">${TOTAL_POSTS}</div>
              <div class="wellness-stat-label">Posts</div>
            </div>
            <div class="wellness-stat" style="border-left: 1px solid var(--outline-variant); padding-left: 32px;">
              <div class="wellness-stat-value" id="score-display">${currentScore}</div>
              <div class="wellness-stat-label">Score</div>
            </div>
          </div>
        </section>

        <!-- Feed Grid -->
        <div class="feed-grid" id="feed-grid"></div>
      </div>
    `;

    const feedGrid = document.getElementById('feed-grid');

    feedData.forEach((post, index) => {
      const postEl = document.createElement('article');
      postEl.className = 'feed-post';
      postEl.id = `post-${index}`;

      const likesFormatted = post.likes >= 1000000 ? `${(post.likes / 1000000).toFixed(1)}m` :
        post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes;

      const isTrending = post.likes >= 1000000;

      postEl.innerHTML = `
        <!-- Author Header -->
        <header class="post-header">
          <div class="post-author">
            <img src="${post.avatarUrl}" alt="${post.authorName}" class="post-avatar" loading="lazy" />
            <div>
              <div class="post-author-name">${post.authorName}</div>
              <div class="post-author-handle">${post.authorHandle}</div>
            </div>
          </div>
          <button class="post-menu-btn"><span class="material-symbols-outlined">more_horiz</span></button>
        </header>

        <!-- Image Container (holds both reel and real views) -->
        <div class="post-image-wrap" id="container-${index}">
          <!-- REEL VIEW (default) -->
          <div class="reel-face" id="reel-${index}">
            <img src="${post.imageUrl}" alt="${post.authorName} post" class="post-image" loading="lazy" />
            ${post.tag ? `<div class="post-tag">${post.tag}</div>` : ''}
            ${post.badge ? `
              <div class="post-badge ${post.badge.isError ? 'error-badge' : ''}">
                <span class="material-symbols-outlined">${post.badge.icon}</span>
                <span class="post-badge-text">${post.badge.label}</span>
              </div>
            ` : ''}
            <button class="btn-reveal-real" data-action="show-real" data-index="${index}">
              <span class="material-symbols-outlined">visibility</span>
              Real View
            </button>
          </div>

          <!-- REAL VIEW (hidden) -->
          <div class="real-face" id="real-${index}">
            <div class="real-view-header">
              <button class="btn-back-reel" data-action="back-reel" data-index="${index}">
                <span class="material-symbols-outlined" style="font-size:16px">chevron_left</span>
                Back to Post
              </button>
              <span class="real-view-badge">Reality Check</span>
            </div>

            <h4 class="section-title">Nutritional Facts</h4>
            <div class="nutrition-grid">
              <div class="nut-cell">
                <span class="nut-value">${post.realView.nutrition.calories}</span>
                <span class="nut-label">Calories</span>
                <span class="nut-context">${parseInt(post.realView.nutrition.calories) > 800 ? '⚠️ High' : parseInt(post.realView.nutrition.calories) > 500 ? '⚡ Moderate' : '✅ OK'}</span>
              </div>
              <div class="nut-cell">
                <span class="nut-value">${post.realView.nutrition.sugar}</span>
                <span class="nut-label">Sugar</span>
                <span class="nut-context">${parseInt(post.realView.nutrition.sugar) > 50 ? '⚠️ Excessive' : parseInt(post.realView.nutrition.sugar) > 25 ? '⚡ High' : '✅ OK'}</span>
              </div>
              <div class="nut-cell">
                <span class="nut-value">${post.realView.nutrition.fat}</span>
                <span class="nut-label">Fat</span>
                <span class="nut-context">${parseInt(post.realView.nutrition.fat) > 40 ? '⚠️ Very High' : parseInt(post.realView.nutrition.fat) > 20 ? '⚡ High' : '✅ OK'}</span>
              </div>
            </div>

            <div class="healthy-alt-card">
              <div class="healthy-alt-icon">🥗</div>
              <div>
                <div class="healthy-alt-title">${post.realView.healthyAlternative.title}</div>
                <div class="healthy-alt-benefit">${post.realView.healthyAlternative.benefit}</div>
              </div>
            </div>

            <button class="btn-analyze" data-action="analyze" data-index="${index}">
              <span class="material-symbols-outlined" style="font-size:18px">search</span>
              Run AI & ML Analysis
            </button>
            <div class="nlp-analysis-container" id="nlp-${index}"></div>
          </div>
        </div>

        <!-- Post Content -->
        <div class="post-content">
          <div class="post-actions-row">
            <div class="post-buttons">
              <button class="action-btn btn-would-eat" data-bias="${post.realView.biasScore}" data-index="${index}">
                <span class="icon-circle"><span class="material-symbols-outlined">thumb_up</span></span>
                Would Eat
              </button>
              <button class="action-btn btn-pass" data-index="${index}">
                <span class="icon-circle"><span class="material-symbols-outlined">close</span></span>
                Pass
              </button>
            </div>
            <span class="post-social-proof ${isTrending ? 'trending' : ''}">${likesFormatted} ${isTrending ? 'trending' : 'verified'}</span>
          </div>
          <h3 class="post-title">${post.authorName}</h3>
          <p class="post-caption">${post.caption}</p>
        </div>
      `;
      feedGrid.appendChild(postEl);
    });

    // ─── Event Delegation ───
    feedView.addEventListener('click', (e) => {
      // Show real view
      const showRealBtn = e.target.closest('[data-action="show-real"]');
      if (showRealBtn) {
        const idx = showRealBtn.getAttribute('data-index');
        document.getElementById(`reel-${idx}`).style.display = 'none';
        document.getElementById(`real-${idx}`).style.display = 'block';
        document.getElementById(`container-${idx}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      // Back to reel view
      const backBtn = e.target.closest('[data-action="back-reel"]');
      if (backBtn) {
        const idx = backBtn.getAttribute('data-index');
        document.getElementById(`real-${idx}`).style.display = 'none';
        document.getElementById(`reel-${idx}`).style.display = 'block';
        document.getElementById(`container-${idx}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      // Analyze button
      const analyzeBtn = e.target.closest('[data-action="analyze"]');
      if (analyzeBtn) {
        const idx = parseInt(analyzeBtn.getAttribute('data-index'));
        const nlpContainer = document.getElementById(`nlp-${idx}`);

        if (nlpContainer.style.display === 'block') {
          nlpContainer.style.display = 'none';
          analyzeBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px">search</span> Run AI & ML Analysis`;
          return;
        }

        analyzeBtn.innerHTML = `<span class="analyze-spinner"></span> Analyzing...`;
        analyzeBtn.disabled = true;

        const age = sessionStorage.getItem('cravecheck_age') || '18-22';

        setTimeout(() => {
          const sections = generateNLPAnalysis(feedData[idx], age);
          nlpContainer.innerHTML = sections.map(s => `
            <div class="nlp-card nlp-${s.severity}">
              <div class="nlp-card-header">
                <span class="nlp-icon">${s.icon}</span>
                <span class="nlp-card-title">${s.title}</span>
              </div>
              <p class="nlp-card-body">${s.content}</p>
            </div>
          `).join('');
          nlpContainer.style.display = 'block';
          analyzeBtn.disabled = false;
          analyzeBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px">close</span> Hide Analysis`;
        }, 800);
        return;
      }

      // Action buttons (Would Eat / Pass)
      const actionBtn = e.target.closest('.action-btn');
      if (actionBtn && !actionBtn.hasAttribute('disabled')) {
        const actionRow = actionBtn.closest('.post-buttons');
        const btns = actionRow.querySelectorAll('.action-btn');
        btns.forEach(b => b.setAttribute('disabled', 'true'));
        actionBtn.classList.add('selected');

        const idx = parseInt(actionBtn.getAttribute('data-index'));

        if (actionBtn.classList.contains('btn-would-eat')) {
          const bias = parseInt(actionBtn.getAttribute('data-bias'), 10);
          const penalty = Math.min(Math.round(bias * 0.2), 15);
          currentScore = Math.max(0, currentScore - penalty);
          userChoices.push({ postIndex: idx, choice: 'would-eat', penalty });

          const badge = document.getElementById('score-badge');
          badge.classList.add('pulse-red');
          setTimeout(() => badge.classList.remove('pulse-red'), 400);
        } else if (actionBtn.classList.contains('btn-pass')) {
          currentScore = Math.min(100, currentScore + 5);
          userChoices.push({ postIndex: idx, choice: 'pass', penalty: 0 });
        }

        // Update all score displays
        const scoreEl = document.getElementById('score-value');
        const scoreDisplay = document.getElementById('score-display');
        if (scoreEl) scoreEl.textContent = currentScore;
        if (scoreDisplay) scoreDisplay.textContent = currentScore;

        completedPosts++;
        const progressLabel = document.getElementById('progress-label');
        if (progressLabel) progressLabel.textContent = `Progress: ${completedPosts}/${TOTAL_POSTS} posts`;

        if (completedPosts === TOTAL_POSTS) {
          setTimeout(showInsights, 600);
        }
      }
    });
  };

  // ═══════════════════════════════════════════════════════════
  // INSIGHTS OVERLAY
  // ═══════════════════════════════════════════════════════════
  const showInsights = () => {
    let verdict = '', verdictClass = '';
    if (currentScore >= 80) {
      verdict = "Outstanding. You're highly resistant to deceptive food marketing and aesthetic manipulation.";
      verdictClass = 'verdict-great';
    } else if (currentScore >= 50) {
      verdict = "Average. You caught some tricks but fell for others. Keep building your awareness.";
      verdictClass = 'verdict-ok';
    } else {
      verdict = "Vulnerable. You were highly susceptible to aesthetic manipulation masking poor nutrition.";
      verdictClass = 'verdict-bad';
    }

    const age = sessionStorage.getItem('cravecheck_age') || '18-22';
    const baselineScore = getBaselineForAge(age);
    const difference = currentScore - baselineScore;
    const ml = getMLPredictionForAge(age);
    const mlPercentage = Math.round(ml.avg * 100);
    const insights = getDemographicInsights(age);

    const wouldEatCount = userChoices.filter(c => c.choice === 'would-eat').length;
    const passCount = userChoices.filter(c => c.choice === 'pass').length;
    const userWouldEatPct = Math.round((wouldEatCount / TOTAL_POSTS) * 100);

    let comparisonText = '';
    if (difference > 0) {
      comparisonText = `You scored <strong>${difference} points higher</strong> than the average user in the <strong>${age}</strong> baseline dataset (${baselineScore} avg).`;
    } else if (difference < 0) {
      comparisonText = `You scored <strong>${Math.abs(difference)} points lower</strong> than the average user in the <strong>${age}</strong> baseline dataset (${baselineScore} avg).`;
    } else {
      comparisonText = `You scored exactly equal to the average user in the <strong>${age}</strong> baseline dataset (${baselineScore} avg).`;
    }

    const mlVsUser = userWouldEatPct > mlPercentage
      ? `You chose "Would Eat" <strong>${userWouldEatPct - mlPercentage}% more often</strong> than the model predicted for your age group — suggesting higher susceptibility to food reel influence.`
      : userWouldEatPct < mlPercentage
      ? `You chose "Would Eat" <strong>${mlPercentage - userWouldEatPct}% less often</strong> than the model predicted — showing above-average resistance to manipulation.`
      : `Your behavior exactly matched the ML model's prediction for your demographic.`;

    let insightsHTML = '';
    if (insights) {
      const cravingHigh = (insights.cravingFreq['Very often'] || 0) + (insights.cravingFreq['Often'] || 0) + (insights.cravingFreq['Sometimes'] || 0);
      const neverCheck = insights.checkNutrition['Never'] || 0;
      const rarelyCheck = insights.checkNutrition['Rarely'] || 0;

      insightsHTML = `
        <div class="insight-grid">
          <div class="insight-card">
            <div class="insight-number">${cravingHigh}%</div>
            <div class="insight-desc">of ${age} group crave food after reels</div>
          </div>
          <div class="insight-card">
            <div class="insight-number">${insights.highUsage}%</div>
            <div class="insight-desc">spend 3+ hours daily on social media</div>
          </div>
          <div class="insight-card">
            <div class="insight-number">${neverCheck + rarelyCheck}%</div>
            <div class="insight-desc">rarely or never check nutrition labels</div>
          </div>
          <div class="insight-card">
            <div class="insight-number">${insights.wouldReduce}%</div>
            <div class="insight-desc">said they'd reduce consumption after seeing impact</div>
          </div>
        </div>
        ${insights.topAttractors.length ? `
        <div class="insight-section">
          <h4 class="insight-section-title">Top Visual Triggers (${age} group)</h4>
          <div class="trigger-bars">
            ${insights.topAttractors.map(a => `
              <div class="trigger-row">
                <span class="trigger-name">${a.name}</span>
                <div class="trigger-bar-bg"><div class="trigger-bar-fill" style="width: ${a.pct}%"></div></div>
                <span class="trigger-pct">${a.pct}%</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        ${insights.topEmotion ? `
        <div class="insight-section">
          <p class="insight-emotion">Dominant emotional response to food reels: <strong>"${insights.topEmotion.name}"</strong> (${insights.topEmotion.pct}% of ${age} respondents)</p>
        </div>
        ` : ''}
      `;
    }

    const overlay = document.createElement('div');
    overlay.id = 'insights-overlay';
    overlay.innerHTML = `
      <div class="insights-scroll">
        <h2 class="insights-title">Session Complete</h2>
        <div class="insights-score ${verdictClass}">${currentScore}</div>
        <p class="insights-verdict">${verdict}</p>

        <div class="insights-card">
          <h4 class="insights-card-title">📊 Your Choices</h4>
          <div class="choice-summary">
            <div class="choice-item choice-eat">
              <span class="choice-count">${wouldEatCount}</span>
              <span class="choice-label">Would Eat</span>
            </div>
            <div class="choice-divider">vs</div>
            <div class="choice-item choice-pass">
              <span class="choice-count">${passCount}</span>
              <span class="choice-label">Pass</span>
            </div>
          </div>
        </div>

        <div class="insights-card">
          <h4 class="insights-card-title">📈 Demographic Comparison</h4>
          <p class="insights-card-text">${comparisonText}</p>
        </div>

        <div class="insights-card insights-card-ml">
          <h4 class="insights-card-title">🤖 ML Model Prediction</h4>
          <p class="insights-card-text">
            Based on <strong>${insights ? insights.sampleSize : 'N/A'}</strong> survey responses from the <strong>${age}</strong> age group,
            our Logistic Regression model predicts an average <strong>${mlPercentage}% likelihood</strong> of craving food seen in reels.
          </p>
          <p class="insights-card-text" style="margin-top: 8px;">${mlVsUser}</p>
          <div class="ml-bar-container">
            <div class="ml-bar-label">ML Predicted</div>
            <div class="ml-bar-bg"><div class="ml-bar-fill" style="width: ${mlPercentage}%">${mlPercentage}%</div></div>
            <div class="ml-bar-label">Your Result</div>
            <div class="ml-bar-bg"><div class="ml-bar-fill ml-bar-you" style="width: ${userWouldEatPct}%">${userWouldEatPct}%</div></div>
          </div>
        </div>

        ${insights ? `
        <div class="insights-card">
          <h4 class="insights-card-title">🔬 Dataset Deep Dive — ${age} Group</h4>
          <p class="insights-card-text" style="margin-bottom: 12px; font-size: 0.75rem; opacity: 0.5;">Based on ${insights.sampleSize} responses out of ${insights.totalDataset} total in our survey dataset</p>
          ${insightsHTML}
        </div>
        ` : ''}

        <button class="btn-restart" onclick="sessionStorage.removeItem('cravecheck_age'); location.reload();">
          Restart Session
          <span class="material-symbols-outlined">refresh</span>
        </button>
      </div>
    `;
    feedView.appendChild(overlay);
  };

  // ═══════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════
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

  // ─── Start Button Click ───
  startBtn.addEventListener('click', () => {
    const selectedAge = ageSelector.value;
    sessionStorage.setItem('cravecheck_age', selectedAge);

    splashView.style.display = 'none';
    feedView.style.display = 'block';
    window.scrollTo(0, 0);

    console.log(`Age group ${selectedAge} selected. Starting feed...`);
    renderFeed();
  });
});
