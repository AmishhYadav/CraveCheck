export const feedData = [
  {
    id: 'post-1',
    authorName: 'Dr. Julian Thorne',
    authorHandle: 'Nutritional Science',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=750&fit=crop',
    caption: 'Wild-caught salmon and brassica medley maximizes sulforaphane absorption for cellular health. 🌿',
    likes: 8200,
    tag: null,
    badge: { icon: 'restaurant', label: '482 kcal', isError: false },
    realView: {
      nutrition: { calories: '482', sugar: '6g', fat: '22g' },
      aiTactics: 'Genuine science-backed post. However, the plating and photography uses warm-toned lighting to enhance the perceived freshness of the greens, making the portion look larger than it is.',
      biasScore: 25,
      healthyAlternative: { title: 'Already a solid choice!', benefit: 'Add a side of brown rice for complete amino acids' }
    }
  },
  {
    id: 'post-2',
    authorName: 'FitVibe_Josh',
    authorHandle: 'Lifestyle Guru',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=750&fit=crop',
    caption: '"Lose 10lbs in 2 days with this miracle dessert hack!" No sugar, just pure vibes. 🔥🍩',
    likes: 4200000,
    tag: 'Viral Myth',
    badge: { icon: 'warning', label: 'Sugar Spike', isError: true },
    realView: {
      nutrition: { calories: '1450', sugar: '92g', fat: '68g' },
      aiTactics: 'Classic "guilt-free" manipulation. Uses impossible weight-loss claims paired with dopamine-triggering visuals. The "no sugar" claim is completely false — each donut contains 23g of refined sugar.',
      biasScore: 96,
      healthyAlternative: { title: 'Dark Chocolate Squares (85%)', benefit: 'Satisfies craving with 1/10th the sugar' }
    }
  },
  {
    id: 'post-3',
    authorName: 'GlowByGemma',
    authorHandle: 'Beauty & Wellness',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    imageUrl: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&h=750&fit=crop',
    caption: '"This pink water literally melts fat while you sleep." Science-backed? No. Trending? Absolutely. 💖✨',
    likes: 2100000,
    tag: 'Misleading',
    badge: { icon: 'local_drink', label: 'Detox Cure', isError: false },
    realView: {
      nutrition: { calories: '380', sugar: '52g', fat: '2g' },
      aiTactics: 'Unsubstantiated medical claims ("melts fat while you sleep"). The "detox" label has no scientific basis. This drink contains more sugar than a can of soda, disguised by pink aesthetic branding.',
      biasScore: 91,
      healthyAlternative: { title: 'Water with Lemon & Mint', benefit: 'Zero calories, actual hydration' }
    }
  },
  {
    id: 'post-4',
    authorName: 'Chef Andre L.',
    authorHandle: 'Culinary Science',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=750&fit=crop',
    caption: 'Authentic tempeh fermentation processes create bioactive peptides that support neurotransmitter synthesis. 🫘',
    likes: 1200,
    tag: null,
    badge: { icon: 'psychiatry', label: 'Gut-Brain Link', isError: false },
    realView: {
      nutrition: { calories: '320', sugar: '4g', fat: '14g' },
      aiTactics: 'Legitimate nutritional science. The post accurately describes the gut-brain axis benefits of fermented foods. Minimal manipulation — uses technical language appropriately.',
      biasScore: 15,
      healthyAlternative: { title: 'Great as-is!', benefit: 'Pair with whole grain for fiber boost' }
    }
  },
  {
    id: 'post-5',
    authorName: 'FoodieFantasy_99',
    authorHandle: 'Viral Trends',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=750&fit=crop',
    caption: '"Tastes like a dream and cures morning blues!" Packed with synthetic dyes and zero nutritional fiber. 🥯🌈',
    likes: 5800000,
    tag: 'Viral Myth',
    badge: { icon: 'color_lens', label: 'Dye-Heavy', isError: true },
    realView: {
      nutrition: { calories: '680', sugar: '35g', fat: '28g' },
      aiTactics: '"Cures morning blues" is an unsubstantiated health claim. Rainbow coloring triggers novelty bias — synthetic food dyes (Red 40, Blue 1, Yellow 5) linked to hyperactivity. Zero fiber despite grain appearance.',
      biasScore: 88,
      healthyAlternative: { title: 'Whole Wheat Toast with Avocado', benefit: 'Real fiber, real nutrients, no synthetic dyes' }
    }
  },
  {
    id: 'post-6',
    authorName: 'Dr. Kevin Wu',
    authorHandle: 'Chronobiology',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    imageUrl: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=600&h=750&fit=crop',
    caption: 'Beta-glucans in overnight oats for sustained morning focus and stable insulin response. 🥣',
    likes: 4200,
    tag: null,
    badge: { icon: 'schedule', label: 'Slow Burn', isError: false },
    realView: {
      nutrition: { calories: '340', sugar: '12g', fat: '8g' },
      aiTactics: 'Evidence-based nutrition post. Beta-glucan claims are well-supported by research. Photography is honest — no excessive styling or unrealistic portions. Minimal manipulation detected.',
      biasScore: 12,
      healthyAlternative: { title: 'Already excellent!', benefit: 'Add chia seeds for omega-3 boost' }
    }
  },
  {
    id: 'post-7',
    authorName: 'KitchenKing_Official',
    authorHandle: 'Short-Form Chef',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=750&fit=crop',
    caption: '"The ultimate cheat meal that actually speeds up your metabolism because of the heat!" Pure culinary fiction. 🍔🔥',
    likes: 15000000,
    tag: 'Viral Myth',
    badge: { icon: 'restaurant_menu', label: 'Sodium Overload', isError: true },
    realView: {
      nutrition: { calories: '1850', sugar: '18g', fat: '98g' },
      aiTactics: 'False thermogenic claim — deep-fried food does NOT speed up metabolism. Uses "cheat meal" framing to normalize extreme caloric excess. This single burger exceeds an entire day\'s recommended fat intake.',
      biasScore: 97,
      healthyAlternative: { title: 'Grilled Turkey Burger (no bun)', benefit: 'Same satisfaction, 1200 fewer calories' }
    }
  },
  {
    id: 'post-8',
    authorName: 'Maya Patel',
    authorHandle: 'Nutrigenomics',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&h=750&fit=crop',
    caption: 'Phytochemical diversity for DNA protection and repair. Science-backed antioxidants. 🍓',
    likes: 7100,
    tag: null,
    badge: { icon: 'brightness_7', label: 'Vitamin C+', isError: false },
    realView: {
      nutrition: { calories: '180', sugar: '28g', fat: '1g' },
      aiTactics: 'Legitimate nutritional science with accurate polyphenol claims. Note: sugar is naturally occurring from fruit, not added. The "DNA protection" language is scientific but may overstate consumer-level impact.',
      biasScore: 30,
      healthyAlternative: { title: 'Perfect as a snack!', benefit: 'Moderate portions to manage natural sugars' }
    }
  },
  {
    id: 'post-9',
    authorName: 'Dr. Sam Rivers (Not MD)',
    authorHandle: 'BioHacker',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=750&fit=crop',
    caption: '"This one secret juice unlocks 100% of your brain capacity." It\'s just overpriced fruit syrup. 🧠⚡',
    likes: 300000,
    tag: 'Misleading',
    badge: { icon: 'bolt', label: 'High Fructose', isError: true },
    realView: {
      nutrition: { calories: '520', sugar: '78g', fat: '3g' },
      aiTactics: 'Uses fraudulent "Dr." title (not a medical doctor). "Unlocks 100% brain capacity" is a debunked myth. Product is concentrated fruit syrup with 78g of fructose — equivalent to 6 candy bars worth of sugar.',
      biasScore: 94,
      healthyAlternative: { title: 'Black Coffee or Green Tea', benefit: 'Actual cognitive benefits, zero sugar' }
    }
  },
  {
    id: 'post-10',
    authorName: 'Chloe Zhang',
    authorHandle: 'Influencer',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c8e9e5cb?w=600&h=750&fit=crop',
    caption: '"Gold flakes and magic berries make this a wellness staple." Expensive sugar, essentially. 🍦✨',
    likes: 9400,
    tag: 'Misleading',
    badge: { icon: 'mood', label: 'Zero Fiber', isError: false },
    realView: {
      nutrition: { calories: '920', sugar: '72g', fat: '42g' },
      aiTactics: '"Gold flakes" have zero nutritional value — pure aesthetic manipulation. "Magic berries" is meaningless marketing. "Wellness staple" for a 920-calorie ice cream sundae is peak misinformation.',
      biasScore: 89,
      healthyAlternative: { title: 'Frozen Banana Ice Cream', benefit: '150 cals, natural sweetness, actual fiber' }
    }
  }
];
