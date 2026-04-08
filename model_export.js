
// --- Auto-Generated Model Logic for Frontend JS ---
// Accuracy on test set: 0.64

function predictWouldEat(features) {
    // features should be an object with the required numerical values
    // Example: { ageGroup: 2, smUsage: 3, checkNutrition: 2, socialUnhealthy: 3, isNonVeg: 1, isVegan: 0 }
    
    let logOdds = 1.6083;

    logOdds += (features.age_group || 0) * -0.5061;
    logOdds += (features.average_daily_social_media_usage || 0) * 0.0940;
    logOdds += (features.do_you_usually_check_nutritional_information_before_eating || 0) * -0.3052;
    logOdds += (features.do_you_think_social_media_promotes_unhealthy_eating_habits || 0) * 0.5622;
    logOdds += (features.dietary_preference_non_vegetarian || 0) * 0.2564;
    logOdds += (features.dietary_preference_vegan || 0) * -0.3853;
    logOdds += (features.dietary_preference_vegetarian || 0) * 0.4096;

    // Sigmoid function to get probability
    const probability = 1 / (1 + Math.exp(-logOdds));
    
    // Return prediction (1 = Would Eat, 0 = Pass) along with probability
    return {
        prediction: probability >= 0.5 ? "Would Eat" : "Pass",
        probability: probability
    };
}
