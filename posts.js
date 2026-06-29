/* ==========================================================================
   ELEVATE — Posts Data & Firestore CRUD
   Depends on: firebase-config.js (db)
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Categories ---------- */
  const CATEGORIES = [
    { name: 'Design',       icon: '✏️',  color: '#7C9A82' },
    { name: 'Wellness',     icon: '🌿',  color: '#8BA98F' },
    { name: 'Interiors',    icon: '🏠',  color: '#A0937D' },
    { name: 'Travel',       icon: '✈️',  color: '#7D8CA0' },
    { name: 'Technology',   icon: '⚡',  color: '#6B8F9A' },
    { name: 'Food',         icon: '☕',  color: '#9A8B7C' },
    { name: 'Architecture', icon: '🏛️', color: '#7C869A' },
    { name: 'Mindfulness',  icon: '🧘',  color: '#8F9A7C' },
    { name: 'Lifestyle',    icon: '💫',  color: '#9A7C8F' },
  ];

  /* ---------- Seed Posts (pre-built editorial content) ---------- */
  const SEED_POSTS = [
    {
      id: 'seed-1',
      title: 'The Art of Intentional Living in a Distracted World',
      category: 'Lifestyle',
      excerpt: 'Exploring how deliberate design choices and mindful habits create spaces for clarity, creativity, and deeper human connection.',
      image: 'images/hero-featured.png',
      authorName: 'Elena Marchetti',
      authorInitials: 'EM',
      date: '2026-06-14',
      readTime: '8 min read',
      isFeatured: true,
      body: `<p>In an era saturated with notifications, curated feeds, and the relentless pull of digital distraction, the concept of intentional living has evolved from a niche philosophy into a necessary survival strategy. It is no longer a luxury reserved for those who can afford to step away from the noise — it is a discipline that shapes how we think, create, and ultimately, how we live.</p>
<p>The modern individual navigates an average of 6,000 to 10,000 advertisements daily. Our attention spans have compressed, our spaces have cluttered, and our mental bandwidth has shrunk to accommodate an ever-expanding universe of choice. Against this backdrop, intentional living emerges not as a rejection of modernity, but as a more sophisticated engagement with it.</p>
<h2>The Architecture of Attention</h2>
<p>Every space we inhabit — physical or digital — is an architecture of attention. The arrangement of furniture in a room, the color of walls, the quality of light filtering through a window: these are not merely aesthetic choices. They are cognitive frameworks that silently shape our thinking patterns, emotional states, and creative capacity.</p>
<p>Consider the desk you work at. If it faces a wall, your mind encounters a boundary before it can wander. If it faces a window, your thoughts have permission to reach outward. This is not metaphor — it is neuroscience. Studies from the Academy of Neuroscience for Architecture have demonstrated that ceiling height alone can influence whether we think in broad, abstract terms or narrow, detail-oriented ones.</p>
<blockquote>"The space in which we live should be for the person we are becoming now, not for the person we were in the past." — Marie Kondo</blockquote>
<h2>Material Choices as Values</h2>
<p>In the Japanese design tradition of wabi-sabi, imperfection is not a flaw — it is a feature. A tea bowl with an uneven glaze tells the story of the maker's hand. A wooden table with visible grain speaks to the tree from which it came. These are not compromises; they are declarations of value.</p>
<p>When we extend this philosophy to how we design our lives, something profound shifts. Choosing a hand-thrown ceramic mug over a mass-produced plastic one is not about snobbery or expense. It is about deciding that the object we hold each morning deserves to be held with awareness.</p>
<h2>The Digital Paradox</h2>
<p>Perhaps the greatest challenge to intentional living comes from the technologies designed to make our lives "easier." Social media platforms, on-demand entertainment, same-day delivery services — these innovations eliminate friction with surgical precision. And in doing so, they also eliminate the gaps in which we once found reflection, boredom, and creativity.</p>
<p>The paradox is not that technology is inherently destructive. It is that technology without intention becomes a default operating system — one we did not consciously install. When we pick up our phones out of habit rather than need, we are living the algorithm's intention, not our own.</p>
<h2>The Rhythm of Ritual</h2>
<p>Perhaps the most powerful tool in the intentional living toolkit is ritual — not in the religious sense, but in the sense of deliberate, repeated action that transforms the ordinary into the significant. A morning cup of coffee becomes meditation when prepared with attention. An evening walk becomes reflection when taken without earbuds.</p>
<p>These rituals do not require more time. They require more presence. And presence, contrary to popular belief, is not a personality trait. It is a skill — one that improves with practice and degrades with neglect.</p>
<p>Intentional living is not a destination. It is not a perfectly curated Instagram feed or a minimalist apartment devoid of personality. It is a practice — messy, imperfect, and deeply human. It is the decision, made again and again, to live on purpose rather than by default. And in a world that profits from our distraction, that choice is nothing short of revolutionary.</p>`
    },
    {
      id: 'seed-2',
      title: 'Why Minimalism Is the Ultimate Form of Sophistication',
      category: 'Design',
      excerpt: 'Less truly becomes more when every element serves a purpose. An exploration of reductive design principles.',
      image: 'images/post-design.png',
      authorName: 'Marcus Chen',
      authorInitials: 'MC',
      date: '2026-06-12',
      readTime: '6 min read',
      body: `<p>Leonardo da Vinci once said, "Simplicity is the ultimate sophistication." Centuries later, this sentiment has become the guiding principle of a global design movement that values clarity over complexity, purpose over decoration.</p>
<h2>The Origins of Less</h2>
<p>Minimalism in design traces its roots to the Bauhaus movement of the 1920s, where form followed function and ornamentation was stripped away. The idea was revolutionary: beauty could emerge not from addition, but from subtraction. Every element that remained had to earn its place.</p>
<p>Today, this philosophy extends far beyond architecture and furniture. It shapes our digital interfaces, our wardrobes, our daily routines. The minimalist approach asks a single, powerful question of every object, feature, and commitment: does this serve a purpose?</p>
<h2>Reduction as Creative Act</h2>
<p>The misconception about minimalism is that it requires less creativity. The opposite is true. Designing with fewer elements demands greater intentionality. When you cannot hide behind embellishment, every line, every color, every space must be precisely considered.</p>
<p>Consider the work of Dieter Rams, whose ten principles of good design have influenced everything from Apple products to contemporary architecture. His mantra — "less, but better" — captures the essence of minimalism not as deprivation, but as refinement. It is the difference between a room that is empty and a room that breathes.</p>`
    },
    {
      id: 'seed-3',
      title: 'Biophilic Design: Bringing Nature Into Modern Spaces',
      category: 'Wellness',
      excerpt: 'How the integration of natural elements into interior design improves well-being, focus, and creativity.',
      image: 'images/post-nature.png',
      authorName: 'Sofia Andersson',
      authorInitials: 'SA',
      date: '2026-06-10',
      readTime: '5 min read',
      body: `<p>Biophilic design is more than placing a potted plant on your desk. It is a systematic approach to creating environments that reconnect humans with the natural world — and the science behind it is compelling.</p>
<h2>The Science of Nature Indoors</h2>
<p>Research from the University of Exeter found that employees in offices with natural elements reported a 15% increase in well-being and a 6% increase in productivity. The presence of living plants, natural light, and organic materials triggers a measurable physiological response: lower cortisol levels, reduced blood pressure, and enhanced cognitive function.</p>
<p>This isn't surprising from an evolutionary perspective. Humans spent 99.9% of their evolutionary history in natural environments. Our nervous systems are literally wired to respond to the patterns, textures, and rhythms of the natural world.</p>
<h2>Practical Implementation</h2>
<p>Implementing biophilic design doesn't require a complete renovation. Start with light — maximize natural daylight through window placement and reflective surfaces. Introduce living plants that thrive indoors: monstera, snake plants, and pothos are forgiving choices. Use natural materials like wood, stone, and linen wherever possible. Even the color palette matters: earth tones and greens naturally reduce stress and promote calm.</p>`
    },
    {
      id: 'seed-4',
      title: 'The Rise of Japandi: Where Scandinavian Meets Japanese Aesthetics',
      category: 'Interiors',
      excerpt: 'A deep dive into the design philosophy merging Nordic functionality with Japanese wabi-sabi elegance.',
      image: 'images/post-interior.png',
      authorName: 'Yuki Nakamura',
      authorInitials: 'YN',
      date: '2026-06-08',
      readTime: '7 min read',
      body: `<p>Japandi is not merely a design trend — it is a philosophical convergence. When the clean lines of Scandinavian functionalism meet the organic imperfection of Japanese wabi-sabi, something remarkable emerges: spaces that are simultaneously minimal and warm, structured and organic.</p>
<h2>Shared Philosophy, Different Roots</h2>
<p>Both traditions share a deep respect for craftsmanship, natural materials, and the idea that beauty can be found in simplicity. Scandinavian design emerged from long, dark winters that demanded functional, light-filled interiors. Japanese design emerged from a spiritual tradition that valued impermanence and the beauty of natural aging.</p>
<p>Where they differ is illuminating. Nordic design tends toward the geometric — clean angles, precise joints, systematic organization. Japanese design embraces asymmetry, irregular textures, and the concept of "ma" — the meaningful use of negative space.</p>
<h2>Creating a Japandi Space</h2>
<p>The key to Japandi interiors is restraint with warmth. Choose a muted, neutral palette — think warm grays, soft whites, and natural wood tones. Furniture should be low-profile with clean lines but organic materials. Every object should have both functional purpose and aesthetic value. The result is a space that feels simultaneously curated and lived-in, modern and timeless.</p>`
    },
    {
      id: 'seed-5',
      title: 'Slow Travel: Finding Meaning Beyond the Itinerary',
      category: 'Travel',
      excerpt: 'Why immersive, unhurried travel experiences create deeper connections and lasting memories.',
      image: 'images/post-travel.png',
      authorName: 'James Okafor',
      authorInitials: 'JO',
      date: '2026-06-05',
      readTime: '6 min read',
      body: `<p>In an age of 48-hour city guides and Instagram-optimized itineraries, slow travel is a quiet rebellion. It asks us to stop collecting destinations and start inhabiting them — to trade the anxiety of "seeing everything" for the richness of seeing one place deeply.</p>
<h2>The Case for Staying Longer</h2>
<p>When you spend a week in a neighborhood rather than a day in a city, something shifts. You learn the barista's name. You notice how the light changes on a particular street between morning and afternoon. You find the restaurant that isn't in any guidebook but has been feeding the same families for thirty years. These are not tourist experiences — they are human ones.</p>
<p>Research from Cornell University suggests that experiential purchases — particularly those involving immersion and personal growth — produce longer-lasting happiness than material ones. Slow travel maximizes this effect by creating experiences that are deeply personal and irreproducible.</p>
<h2>Practical Slow Travel</h2>
<p>Start by halving your itinerary. If you planned to visit four cities in two weeks, visit two. Stay in apartments rather than hotels. Shop at local markets. Walk instead of taking taxis. Say yes to unexpected invitations. The goal is not to see more, but to see differently.</p>`
    },
    {
      id: 'seed-6',
      title: 'Objects of Desire: When Technology Becomes Invisible',
      category: 'Technology',
      excerpt: 'The best technology fades into the background. How ambient computing is reshaping our daily rituals.',
      image: 'images/post-tech.png',
      authorName: 'Priya Sharma',
      authorInitials: 'PS',
      date: '2026-06-03',
      readTime: '5 min read',
      body: `<p>The most profound technologies are those that disappear. They weave themselves into the fabric of everyday life until they are indistinguishable from it. Mark Weiser called this "calm technology" — computing that informs without demanding attention.</p>
<h2>The Disappearing Interface</h2>
<p>We are entering an era where the screen — that glowing rectangle that has dominated our attention for two decades — is beginning to recede. Ambient computing surrounds us with intelligence embedded in objects, environments, and materials themselves. Your thermostat learns your preferences. Your lighting adjusts to the time of day. Your earbuds translate languages in real-time.</p>
<p>The design philosophy behind these products represents a fundamental shift: from technology that demands interaction to technology that anticipates need. The interface is no longer a screen you tap — it is the environment you inhabit.</p>
<h2>The Craft of Invisibility</h2>
<p>Making technology invisible requires extraordinary design discipline. Every unnecessary notification, every superfluous feature, every moment of friction represents a failure. The goal is not to build more powerful technology, but to build technology that requires less of your attention while delivering more of what you need.</p>`
    },
    {
      id: 'seed-7',
      title: 'The Ritual of Morning: Coffee, Clarity, and Calm',
      category: 'Food',
      excerpt: 'Transform your morning routine from rushed autopilot into a deliberate ceremony of presence.',
      image: 'images/post-food.png',
      authorName: 'Luca Romano',
      authorInitials: 'LR',
      date: '2026-06-01',
      readTime: '4 min read',
      body: `<p>The first thirty minutes of your day set the tone for everything that follows. Yet most of us spend them in reactive mode — checking phones, scanning emails, absorbing the world's anxieties before we've even brushed our teeth. What if we reclaimed that time?</p>
<h2>Coffee as Meditation</h2>
<p>The Japanese tea ceremony, or chanoyu, transforms the simple act of preparing tea into a practice of mindfulness, respect, and presence. The same principles can be applied to your morning coffee. Heat the water with attention. Grind the beans with awareness. Pour with intention. The ritual takes no longer than your current routine — it simply asks you to be present while performing it.</p>
<p>The neurological benefits are real. Morning routines that involve deliberate sensory engagement — the smell of fresh coffee, the warmth of a ceramic cup, the sound of water reaching its boiling point — activate the parasympathetic nervous system, reducing cortisol levels and establishing a calm baseline for the day ahead.</p>
<h2>Building Your Morning Ritual</h2>
<p>Choose one element of your morning to perform with full attention. It doesn't have to be coffee — it could be stretching, journaling, or simply standing at a window for two minutes watching the light change. The practice is not about what you do, but how deliberately you do it.</p>`
    },
    {
      id: 'seed-8',
      title: "Concrete Poetry: Brutalism's Unexpected Renaissance",
      category: 'Architecture',
      excerpt: 'Once dismissed as cold and imposing, brutalist architecture finds new admirers in a generation craving authenticity.',
      image: 'images/post-architecture.png',
      authorName: 'Clara Dubois',
      authorInitials: 'CD',
      date: '2026-05-28',
      readTime: '7 min read',
      body: `<p>For decades, brutalist buildings were the villains of architecture — concrete monoliths associated with failed social housing projects and oppressive institutional power. But something unexpected has happened: a new generation has fallen in love with their raw, uncompromising honesty.</p>
<h2>The Appeal of Honesty</h2>
<p>In an era of algorithmic curation and carefully managed personal brands, brutalism offers something increasingly rare: authenticity. These buildings make no attempt to be beautiful in a conventional sense. They are what they are — concrete, mass, structure — without apology or pretense. For a generation exhausted by artifice, this honesty is magnetic.</p>
<p>The Instagram account @brutgroup has over a million followers who share and celebrate brutalist structures worldwide. Architecture tours of brutalist landmarks sell out regularly. Coffee table books on concrete buildings have become bestsellers. What was once architectural pariah has become cultural phenomenon.</p>
<h2>Lessons from Concrete</h2>
<p>Brutalism teaches us that beauty does not require decoration. That materials can be celebrated in their raw state. That a building can be simultaneously massive and intimate, imposing and tender. In a world of glass curtain walls and parametric curves, the honest weight of exposed concrete offers a grounding counterpoint — a reminder that some of the most profound beauty comes from refusing to be anything other than what you are.</p>`
    },
    {
      id: 'seed-9',
      title: 'Digital Detox: Reclaiming Silence in the Age of Noise',
      category: 'Mindfulness',
      excerpt: 'A practical guide to creating tech-free zones and rituals that restore your attention and inner quiet.',
      image: 'images/post-wellness.png',
      authorName: 'Amara Osei',
      authorInitials: 'AO',
      date: '2026-05-25',
      readTime: '5 min read',
      body: `<p>Silence has become a luxury. In the continuous hum of notifications, algorithmic recommendations, and 24-hour news cycles, the absence of input feels almost unnatural — which is precisely why it's so necessary.</p>
<h2>The Attention Economy's Cost</h2>
<p>Your attention is the most valuable commodity in the digital economy. Every app on your phone is designed by teams of engineers and psychologists whose explicit goal is to capture and hold it. The result is a population in a state of continuous partial attention — always somewhat distracted, never fully present, perpetually skimming the surface of experience.</p>
<p>The neurological consequences are documented: reduced working memory capacity, impaired ability to focus on complex tasks, increased anxiety and depression. We are not designed for the volume of input we currently process. Our brains need rest in the same way our bodies do.</p>
<h2>Practical Detox Strategies</h2>
<p>Start small. Designate one room in your home as a phone-free zone — ideally the bedroom. Use a physical alarm clock instead of your phone. During meals, place all devices in another room. One day per week, leave your phone at home when you go for a walk. Notice what fills the silence. You may be surprised to find that what feels like emptiness is actually space — space for thought, for observation, for the kind of unfocused mind-wandering from which creativity emerges.</p>`
    }
  ];

  /* ---------- Firestore CRUD ---------- */

  async function createPost(postData) {
    const user = fbAuth.currentUser;
    if (!user) throw new Error('Must be logged in to create a post');

    const doc = {
      title:         postData.title,
      category:      postData.category,
      excerpt:       postData.excerpt,
      body:          postData.body,
      image:         postData.image || '',
      authorName:    user.displayName || user.email.split('@')[0],
      authorInitials: getInitials(user.displayName || user.email.split('@')[0]),
      authorId:      user.uid,
      date:          new Date().toISOString().split('T')[0],
      readTime:      estimateReadTime(postData.body),
      createdAt:     firebase.firestore.FieldValue.serverTimestamp()
    };

    const ref = await db.collection('posts').add(doc);
    
    // Handle Sponsored Post Request
    if (postData.sponsoredDuration && window.ElevateAds) {
      await window.ElevateAds.createSponsorRequest({
        postId: ref.id,
        postTitle: doc.title,
        requesterName: doc.authorName,
        requesterEmail: user.email,
        duration: postData.sponsoredDuration,
        message: 'Requested via Create Post form'
      });
    }
    
    return { id: ref.id, ...doc };
  }

  async function getFirestorePosts() {
    try {
      const snapshot = await db.collection('posts')
        .orderBy('createdAt', 'desc')
        .limit(150)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isUserPost: true
      }));
    } catch (err) {
      console.warn('Firestore unavailable, showing seed posts only:', err.message);
      return [];
    }
  }

  async function getAllPosts() {
    const firestorePosts = await getFirestorePosts();
    // Merge: user posts first (newest), then seed posts
    return [...firestorePosts, ...SEED_POSTS];
  }

  async function getPostById(id) {
    // Check seed posts first
    const seed = SEED_POSTS.find(p => p.id === id);
    if (seed) return seed;

    // Then check Firestore
    try {
      const doc = await db.collection('posts').doc(id).get();
      if (doc.exists) return { id: doc.id, ...doc.data(), isUserPost: true };
    } catch (err) {
      console.warn('Error fetching post:', err.message);
    }
    return null;
  }

  async function getPostsByCategory(category) {
    const all = await getAllPosts();
    return all.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  async function deletePost(id) {
    const user = fbAuth.currentUser;
    if (!user) throw new Error('Must be logged in');
    await db.collection('posts').doc(id).delete();
  }

  /* ---------- Helpers ---------- */

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  function estimateReadTime(body) {
    if (!body) return '1 min read';
    const text = body.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 200));
    return mins + ' min read';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /* ---------- Public API ---------- */
  window.ElevatePosts = {
    SEED_POSTS,
    CATEGORIES,
    createPost,
    getAllPosts,
    getPostById,
    getPostsByCategory,
    deletePost,
    getInitials,
    formatDate,
    estimateReadTime
  };

})();
