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
  let userChoices = []; // Track user decisions for ML comparison

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

  // ----- Richer demographic analysis from dataset -----

  const getDemographicInsights = (ageGroup) => {
    const profiles = surveyData.filter(p => p['Age Group'] === ageGroup);
    const allProfiles = surveyData;
    if (!profiles.length) return null;

    const count = (arr, key, val) => arr.filter(p => p[key] === val).length;
    const pct = (c, total) => total > 0 ? Math.round((c / total) * 100) : 0;

    // Craving frequency breakdown
    const cravingFreq = {};
    ['Very often', 'Often', 'Sometimes', 'Rarely', 'Never'].forEach(v => {
      cravingFreq[v] = pct(count(profiles, 'Have you ever craved food after watching a food reel?', v), profiles.length);
    });

    // What attracts them most
    const attractors = {};
    profiles.forEach(p => {
      const raw = p['When watching food reels, what attracts you most?'] || '';
      raw.split(',').map(s => s.trim()).filter(Boolean).forEach(a => {
        attractors[a] = (attractors[a] || 0) + 1;
      });
    });
    const topAttractors = Object.entries(attractors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, c]) => ({ name, pct: pct(c, profiles.length) }));

    // Emotional reaction
    const emotions = {};
    profiles.forEach(p => {
      const e = p['Which emotion best describes your reaction to viral food videos?'] || '';
      if (e) emotions[e] = (emotions[e] || 0) + 1;
    });
    const topEmotion = Object.entries(emotions).sort((a, b) => b[1] - a[1])[0];

    // Nutrition check habits  
    const checkNutrition = {};
    ['Always', 'Sometimes', 'Rarely', 'Never'].forEach(v => {
      checkNutrition[v] = pct(count(profiles, 'Do you usually check nutritional information before eating?', v), profiles.length);
    });

    // Would reduce after seeing health impact
    const wouldReduce = pct(count(profiles, 'After seeing the health impact prediction, would you reduce frequent consumption?', 'Yes'), profiles.length);
    const maybeReduce = pct(count(profiles, 'After seeing the health impact prediction, would you reduce frequent consumption?', 'Maybe'), profiles.length);

    // Were they surprised
    const surprised = pct(count(profiles, 'Were you surprised by the nutritional facts shown?', 'Very surprised'), profiles.length);
    const slightlySurprised = pct(count(profiles, 'Were you surprised by the nutritional facts shown?', 'Slightly surprised'), profiles.length);

    // Social media usage
    const smUsage = {};
    ['Less than 1 hour', '1-2 hours', '3-4 hours', 'More than 4 hours'].forEach(v => {
      smUsage[v] = pct(count(profiles, 'Average daily social media usage', v), profiles.length);
    });
    const highUsage = (smUsage['3-4 hours'] || 0) + (smUsage['More than 4 hours'] || 0);

    // Food reel frequency
    const seesOften = pct(
      count(profiles, 'How often do you see food related posts/reels?', 'Very often') +
      count(profiles, 'How often do you see food related posts/reels?', 'Often'),
      profiles.length
    );

    // Diet split
    const dietSplit = {};
    ['Vegetarian', 'Non-vegetarian', 'Vegan'].forEach(v => {
      dietSplit[v] = pct(count(profiles, 'Dietary Preference', v), profiles.length);
    });

    return {
      sampleSize: profiles.length,
      totalDataset: allProfiles.length,
      cravingFreq,
      topAttractors,
      topEmotion: topEmotion ? { name: topEmotion[0], pct: pct(topEmotion[1], profiles.length) } : null,
      checkNutrition,
      wouldReduce,
      maybeReduce,
      surprised,
      slightlySurprised,
      highUsage,
      seesOften,
      dietSplit
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

  // Per-post NLP analysis generator using ML + dataset context
  const generateNLPAnalysis = (post, ageGroup) => {
    const insights = getDemographicInsights(ageGroup);
    const ml = getMLPredictionForAge(ageGroup);
    const mlPct = Math.round(ml.avg * 100);
    
    const calories = parseInt(post.realView.nutrition.calories);
    const sugar = parseInt(post.realView.nutrition.sugar);
    const fat = parseInt(post.realView.nutrition.fat);
    const bias = post.realView.biasScore;

    // Calorie risk level
    let calorieRisk = 'moderate';
    if (calories > 1000) calorieRisk = 'extreme';
    else if (calories > 700) calorieRisk = 'high';
    else if (calories < 400) calorieRisk = 'low';

    // Sugar analysis
    const dailySugarLimit = 25; // WHO recommendation in grams
    const sugarRatio = Math.round((sugar / dailySugarLimit) * 100);

    // Build analysis sections
    const sections = [];

    // 1. Caption manipulation analysis
    sections.push({
      title: 'Caption Manipulation',
      icon: '🎭',
      content: post.realView.aiTactics,
      severity: bias > 85 ? 'critical' : bias > 70 ? 'warning' : 'info'
    });

    // 2. Calorie context
    const avgMealCal = 600;
    const mealEquiv = (calories / avgMealCal).toFixed(1);
    sections.push({
      title: 'Calorie Context',
      icon: '🔥',
      content: `This single item contains <strong>${calories} calories</strong> — equivalent to <strong>${mealEquiv} full meals</strong>. ` +
        (calorieRisk === 'extreme' ? 'This exceeds half the daily recommended intake in one serving.' :
         calorieRisk === 'high' ? 'This is significantly above a healthy single-meal threshold.' :
         'This is within a reasonable range for a main meal.'),
      severity: calorieRisk === 'extreme' || calorieRisk === 'high' ? 'critical' : 'info'
    });

    // 3. Sugar alert
    sections.push({
      title: 'Sugar Impact',
      icon: '🍬',
      content: `Contains <strong>${sugar}g of sugar</strong> — that's <strong>${sugarRatio}%</strong> of the WHO daily limit (${dailySugarLimit}g) in a single serving. ` +
        (sugarRatio > 200 ? 'This is dangerously excessive.' :
         sugarRatio > 100 ? 'This alone exceeds the full daily recommended sugar intake.' :
         'Sugar content is within moderation.'),
      severity: sugarRatio > 200 ? 'critical' : sugarRatio > 100 ? 'warning' : 'info'
    });

    // 4. ML-powered demographic prediction
    if (insights) {
      const cravingHigh = (insights.cravingFreq['Very often'] || 0) + (insights.cravingFreq['Often'] || 0) + (insights.cravingFreq['Sometimes'] || 0);
      sections.push({
        title: 'Behavioral Prediction',
        icon: '🤖',
        content: `Our ML model (Logistic Regression, trained on ${insights.totalDataset} responses) predicts <strong>${mlPct}% of users in the ${ageGroup} group</strong> would crave this food. ` +
          `In the dataset, <strong>${cravingHigh}%</strong> reported craving food after reels. ` +
          (insights.topEmotion ? `The dominant emotional response is <strong>"${insights.topEmotion.name}"</strong> (${insights.topEmotion.pct}%).` : ''),
        severity: mlPct > 65 ? 'warning' : 'info'
      });
    }

    // 5. Bias score breakdown
    sections.push({
      title: 'Manipulation Score',
      icon: '⚠️',
      content: `Bias score: <strong>${bias}/100</strong>. ` +
        (bias > 85 ? 'Extremely manipulative content — uses multiple psychological triggers to override rational food evaluation.' :
         bias > 70 ? 'Significant manipulation detected — caption framing actively distorts nutritional perception.' :
         'Mild persuasive framing detected, but nutritional reality is not heavily obscured.'),
      severity: bias > 85 ? 'critical' : bias > 70 ? 'warning' : 'info'
    });

    return sections;
  };

  const renderFeed = () => {
    feedView.innerHTML = `
      <div class="score-header" id="score-header">
        <span class="score-label">Awareness Score</span>
        <span class="score-value" id="score-value">${currentScore}</span>
      </div>
    `;
    feedData.forEach((post, index) => {
      const postEl = document.createElement('article');
      postEl.className = 'feed-post';
      postEl.id = `post-${index}`;
      postEl.innerHTML = `
        <header class="post-header">
          <img src="${post.avatarUrl}" alt="${post.authorName}" class="post-avatar" loading="lazy" />
          <div class="post-author-info">
            <h3 class="post-author-name">${post.authorName}</h3>
            <span class="post-author-handle">${post.authorHandle}</span>
          </div>
        </header>
        <div class="post-image-container" id="container-${index}">
          <!-- REEL VIEW (default) -->
          <div class="reel-face" id="reel-${index}">
            <img src="${post.imageUrl}" alt="Post image" class="post-image" loading="lazy" />
            <button class="btn-reveal" data-action="show-real" data-index="${index}" aria-label="Reveal Reality">
              <svg viewBox="0 0 24 24" fill="none" class="icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Real View
            </button>
          </div>
          <!-- REAL VIEW (hidden initially) -->
          <div class="real-face" id="real-${index}" style="display: none;">
            <div class="real-view-header">
              <button class="btn-back-reel" data-action="back-reel" data-index="${index}">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                Back to Reel
              </button>
              <span class="real-view-badge">Reality Check</span>
            </div>
            
            <div class="real-view-section">
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
            </div>

            <div class="real-view-section">
              <div class="healthy-alt-card">
                <div class="healthy-alt-icon">🥗</div>
                <div>
                  <div class="healthy-alt-title">${post.realView.healthyAlternative.title}</div>
                  <div class="healthy-alt-benefit">${post.realView.healthyAlternative.benefit}</div>
                </div>
              </div>
            </div>

            <div class="real-view-section">
              <button class="btn-analyze" data-action="analyze" data-index="${index}">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                Run AI & ML Analysis
              </button>
              <div class="nlp-analysis-container" id="nlp-${index}" style="display: none;">
                <!-- Populated dynamically -->
              </div>
            </div>
          </div>
        </div>
        <div class="post-actions">
          <button class="action-btn btn-would-eat" aria-label="Would Eat" data-bias="${post.realView.biasScore}" data-index="${index}">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Would Eat
          </button>
          <button class="action-btn btn-pass" aria-label="Pass" data-index="${index}">
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
      // Show real view
      const showRealBtn = e.target.closest('[data-action="show-real"]');
      if (showRealBtn) {
        const idx = showRealBtn.getAttribute('data-index');
        const reelFace = document.getElementById(`reel-${idx}`);
        const realFace = document.getElementById(`real-${idx}`);
        reelFace.style.display = 'none';
        realFace.style.display = 'block';
        // Scroll the post into view so user can see the real view from the top
        const container = document.getElementById(`container-${idx}`);
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      // Back to reel view
      const backBtn = e.target.closest('[data-action="back-reel"]');
      if (backBtn) {
        const idx = backBtn.getAttribute('data-index');
        const reelFace = document.getElementById(`reel-${idx}`);
        const realFace = document.getElementById(`real-${idx}`);
        realFace.style.display = 'none';
        reelFace.style.display = 'block';
        const container = document.getElementById(`container-${idx}`);
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      // Analyze button — run NLP + ML analysis
      const analyzeBtn = e.target.closest('[data-action="analyze"]');
      if (analyzeBtn) {
        const idx = parseInt(analyzeBtn.getAttribute('data-index'));
        const nlpContainer = document.getElementById(`nlp-${idx}`);
        
        if (nlpContainer.style.display !== 'none') {
          // Toggle off
          nlpContainer.style.display = 'none';
          analyzeBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Run AI & ML Analysis
          `;
          return;
        }
        
        // Show loading state
        analyzeBtn.innerHTML = `<span class="analyze-spinner"></span> Analyzing...`;
        analyzeBtn.disabled = true;

        const age = sessionStorage.getItem('cravecheck_age') || '18-22';
        
        // Simulate brief processing time for realism
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
          analyzeBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            Hide Analysis
          `;
        }, 800);
        return;
      }

      // Action logic (Would Eat / Pass)
      const actionBtn = e.target.closest('.action-btn');
      if (actionBtn && !actionBtn.hasAttribute('disabled')) {
        const actionRow = actionBtn.closest('.post-actions');
        const btns = actionRow.querySelectorAll('.action-btn');
        btns.forEach(b => b.setAttribute('disabled', 'true'));
        const idx = parseInt(actionBtn.getAttribute('data-index'));

        if (actionBtn.classList.contains('btn-would-eat')) {
          actionBtn.style.opacity = '1';
          const bias = parseInt(actionBtn.getAttribute('data-bias'), 10);
          const penalty = Math.min(Math.round(bias * 0.2), 15);
          currentScore -= penalty;
          userChoices.push({ postIndex: idx, choice: 'would-eat', penalty });
          
          const header = document.getElementById('score-header');
          header.classList.add('pulse-red');
          setTimeout(() => header.classList.remove('pulse-red'), 300);
        } else if (actionBtn.classList.contains('btn-pass')) {
          actionBtn.style.opacity = '1';
          currentScore = Math.min(100, currentScore + 5);
          userChoices.push({ postIndex: idx, choice: 'pass', penalty: 0 });
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
    let verdictClass = '';
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

    const age = sessionStorage.getItem('cravecheck_age') || 'your demographic';
    const baselineScore = getBaselineForAge(age);
    const difference = currentScore - baselineScore;
    
    const ml = getMLPredictionForAge(age);
    const mlPercentage = Math.round(ml.avg * 100);
    const insights = getDemographicInsights(age);

    // User behavior analysis
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

    // ML vs User comparison
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
          <p class="insights-card-text" style="margin-top: 8px;">
            ${mlVsUser}
          </p>
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
          <p class="insights-card-text" style="margin-bottom: 12px; font-size: 12px; color: var(--color-text-secondary);">Based on ${insights.sampleSize} responses out of ${insights.totalDataset} total in our survey dataset</p>
          ${insightsHTML}
        </div>
        ` : ''}

        <button class="btn-primary" onclick="sessionStorage.removeItem('cravecheck_age'); location.reload();" style="width: auto; padding: 12px 32px; margin-top: 16px;">Restart Session</button>
      </div>
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
