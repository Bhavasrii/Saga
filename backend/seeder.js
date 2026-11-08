import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Category from './models/Category.js';
import Tag from './models/Tag.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';
import Media from './models/Media.js';
import { connectDB } from './config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('Clearing existing database collections...');
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await Tag.deleteMany({});
    await Category.deleteMany({});
    await Media.deleteMany({});
    await User.deleteMany({});

    console.log('Creating users...');
    const users = await User.create([
      {
        name: 'Eleanor Vance',
        email: 'admin@saga.com',
        password: 'password123',
        role: 'admin',
      },
      {
        name: 'Julian Croft',
        email: 'editor@saga.com',
        password: 'password123',
        role: 'editor',
      },
      {
        name: 'Elena Rostova',
        email: 'elena@saga.com',
        password: 'password123',
        role: 'author',
      },
      {
        name: 'Marcus Chen',
        email: 'marcus@saga.com',
        password: 'password123',
        role: 'author',
      },
      {
        name: 'Sarah Jenkins',
        email: 'sarah@saga.com',
        password: 'password123',
        role: 'reader',
      },
    ]);

    const [admin, editor, elena, marcus, sarah] = users;

    console.log('Creating topics...');
    const categories = await Category.create([
      {
        name: 'Technology',
        slug: 'technology',
        description: 'Reflections on software, systems, and the tools shaping our shared digital landscape.',
      },
      {
        name: 'Design',
        slug: 'design',
        description: 'Deliberate typography, human interfaces, and the craft of intentional experiences.',
      },
      {
        name: 'Career',
        slug: 'career',
        description: 'Navigating professional craft, team dynamics, creative resilience, and growth.',
      },
      {
        name: 'Productivity',
        slug: 'productivity',
        description: 'Cultivating deep focus, calm routines, and deliberate pacing in a hyperconnected world.',
      },
    ]);

    const [catTech, catDesign, catCareer, catProd] = categories;

    console.log('Creating tags...');
    const tags = await Tag.create([
      { name: 'Architecture', slug: 'architecture' },
      { name: 'React', slug: 'react' },
      { name: 'Typography', slug: 'typography' },
      { name: 'Remote Work', slug: 'remote-work' },
      { name: 'Leadership', slug: 'leadership' },
      { name: 'Writing', slug: 'writing' },
      { name: 'Mindfulness', slug: 'mindfulness' },
      { name: 'Tools', slug: 'tools' },
    ]);

    const [tagArch, tagReact, tagTypo, tagRemote, tagLead, tagWriting, tagMind, tagTools] = tags;

    console.log('Creating media library...');
    const mediaItems = await Media.create([
      {
        title: 'Calm morning workspace',
        url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop',
        altText: 'Desk with notebook, laptop, and cup of black coffee in morning light',
        uploadedBy: admin._id,
      },
      {
        title: 'Architectural geometry and light',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop',
        altText: 'Minimalist concrete stairwell bathed in clean natural light',
        uploadedBy: elena._id,
      },
      {
        title: 'Classic typography specimen sheet',
        url: 'https://images.unsplash.com/photo-1507842229458-77293a525ba9?q=80&w=1200&auto=format&fit=crop',
        altText: 'Letterpress specimen and open book spread on dark wooden table',
        uploadedBy: editor._id,
      },
      {
        title: 'Quiet mountain ridgeline',
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
        altText: 'Misty pine mountain silhouettes during early dawn',
        uploadedBy: marcus._id,
      },
      {
        title: 'Open fountain pen and journal',
        url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop',
        altText: 'Handwritten notes beside a brass fountain pen',
        uploadedBy: elena._id,
      },
    ]);

    console.log('Creating stories...');
    const stories = await Post.create([
      {
        title: 'The Lost Discipline of Deliberate Software Architecture',
        slug: 'the-lost-discipline-of-deliberate-software-architecture',
        excerpt: 'In an era driven by instant scaffolding and disposable dependencies, stepping back to design enduring systems has become a radical act of craft.',
        content: `Software development frequently prioritizes the illusion of speed over durability. When we measure productivity purely by how rapidly a repository compiles or how many tickets move across a kanban board each sprint, we risk mortgaging the long-term integrity of the product.\n\nGood architecture is rarely about adopting the newest paradigm or layering abstractions until the underlying runtime is unrecognisable. Instead, deliberate architecture is fundamentally about constraint. It is knowing what to leave out, establishing rigid boundaries between concerns, and writing code that another human being can comprehend with minimal cognitive overhead eighteen months from now.\n\nWhen we treat architecture as an ongoing dialogue rather than an upfront mandate, our systems begin to breathe. We create software that welcomes change rather than dreading it, anchored in clarity, simplicity, and respectful restraint.`,
        coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop',
        author: elena._id,
        category: catTech._id,
        tags: [tagArch._id, tagTools._id],
        status: 'published',
        publishAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
        views: 1420,
      },
      {
        title: 'Why Editorial Restraint Makes Better Digital Products',
        slug: 'why-editorial-restraint-makes-better-digital-products',
        excerpt: 'The most memorable interfaces do not yell for your attention. They speak in measured tones, leaving generous margins for the reader’s thoughts.',
        content: `Every time we introduce a banner, an automated popup, or a brightly pulsing notification badge, we extract a minute tax from the human on the other side of the screen. We tell ourselves that these elements drive engagement, but engagement measured solely in clicks often masks growing fatigue.\n\nEditorial restraint is the practice of asking what can be removed without diluting meaning. When you open a well-printed book or a carefully edited magazine, the white space is as deliberate as the ink. The type size is chosen for legibility, not spectacle. The margins provide a resting place for the eyes.\n\nDigital publishing must reclaim this standard. Platforms that honor the reader’s focus will always foster deeper loyalty than those that treat attention as an extractive resource.`,
        coverImage: 'https://images.unsplash.com/photo-1507842229458-77293a525ba9?q=80&w=1200&auto=format&fit=crop',
        author: editor._id,
        category: catDesign._id,
        tags: [tagTypo._id, tagWriting._id],
        status: 'published',
        publishAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
        views: 980,
      },
      {
        title: 'Deep Work in the Age of Asynchronous Noise',
        slug: 'deep-work-in-the-age-of-asynchronous-noise',
        excerpt: 'Replacing real-time interruptions with continuous asynchronous pings solved one problem only to create another. Here is how to reclaim genuine contemplation.',
        content: `When modern teams migrated en masse to remote work, the promise was quiet autonomy: uninterrupted blocks of uninterrupted time, fewer meeting room migrations, and freedom from hallway shoulder-taps.\n\nYet for many knowledge workers, synchronous presence was simply substituted with an endless stream of asynchronous chatter. The expectation shifted from being in the room to being constantly reachable across four different collaboration streams. The mind remains fragmented, darting between threads, responding to urgent trivialities while significant creative work is continually postponed.\n\nReclaiming focus requires deliberate friction. It requires setting boundaries on when channels are checked, establishing days dedicated purely to deep execution, and normalizing delays in response times for non-catastrophic conversations. True productivity is measured by depth of thought, not velocity of reply.`,
        coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop',
        author: marcus._id,
        category: catProd._id,
        tags: [tagRemote._id, tagMind._id, tagTools._id],
        status: 'published',
        publishAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        views: 2150,
      },
      {
        title: 'The Quiet Power of Technical Clarity in Writing',
        slug: 'the-quiet-power-of-technical-clarity-in-writing',
        excerpt: 'Writing about complex subjects does not require ornate jargon. The finest explanations are built upon clean sentences and unpretentious analogies.',
        content: `There is a common misconception that sophisticated thinking must sound complicated. When explaining complex systems, junior practitioners often reach for dense terminology, hoping it confers authority.\n\nIn truth, mastery is demonstrated through clarity. When you truly grasp how a protocol operates, how a memory allocator functions, or how a consensus algorithm reconciles state, you can explain it to an intelligent generalist using crisp, plain language.\n\nTo write with clarity is an act of empathy. It means respecting the reader’s time, anticipating their points of confusion, and doing the hard work of synthesis so they do not have to decipher ambiguity. Clear prose is clear thinking made visible.`,
        coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop',
        author: elena._id,
        category: catCareer._id,
        tags: [tagWriting._id, tagLead._id],
        status: 'published',
        publishAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        views: 840,
      },
      {
        title: 'Building Modern Web Interfaces with Deliberate Simplicity',
        slug: 'building-modern-web-interfaces-with-deliberate-simplicity',
        excerpt: 'Before reaching for heavyweight dependencies, examine what modern browser standards can do for you. Simplicity remains the ultimate competitive edge.',
        content: `The modern front-end ecosystem offers astonishing power, but that power often comes at the price of immense cognitive overhead and ballooning bundle payloads. We routinely bundle megabytes of JavaScript to render static paragraphs and simple forms that the browser could handle natively with unmatched speed.\n\nChoosing simplicity is not an argument against modern tooling; it is an argument for discernment. When we build interfaces with deliberate constraint—embracing native semantic elements, clean state management, and lightweight composition—we produce software that is faster to load, easier to maintain, and resilient against browser updates.\n\nEvery library added to your package manifest is a contract you must maintain indefinitely. Make sure it earns its place.`,
        coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop',
        author: marcus._id,
        category: catTech._id,
        tags: [tagReact._id, tagTools._id],
        status: 'published',
        publishAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        views: 1630,
      },
      {
        title: 'The Art of Constructive Peer Critique in Design',
        slug: 'the-art-of-constructive-peer-critique-in-design',
        excerpt: 'How teams can move from subjective taste debates to rigorous, generous critiques that elevate the work without diminishing the creator.',
        content: `Design critique is one of the most fragile rituals in creative work. Handled poorly, it degenerates into territorial posturing or polite indifference where nobody expresses honest reservations. Handled well, it transforms good work into unforgettable work.\n\nA great critique separates the artifact from the identity of the maker. It grounds feedback in project goals, user context, and established principles rather than personal aesthetics. When giving critique, lead with curiosity: ask why certain decisions were made before suggesting alternatives. When receiving critique, treat every observation as data rather than an indictment of competence.\n\nCulture is formed in these small feedback loops. Build an environment where high standards and psychological safety co-exist seamlessly.`,
        coverImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1200&auto=format&fit=crop',
        author: editor._id,
        category: catDesign._id,
        tags: [tagLead._id, tagTypo._id],
        status: 'published',
        publishAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
        views: 610,
      },
      {
        title: 'Pacing Your Creative Energy for the Long Run',
        slug: 'pacing-your-creative-energy-for-the-long-run',
        excerpt: 'Burnout is rarely caused by working hard; it is caused by running at sprint speed through what is fundamentally a decades-long marathon.',
        content: `We celebrate heroic late-night breakthroughs and romanticize relentless intensity. But creativity is a biological process that relies on replenishment. You cannot continuously draw water from a well you never allow to refill.\n\nSustainable creative careers are built on rhythms: intense bursts of exploration followed by periods of quiet incubation, reading, and physical rest. When you step away from the desk and take a long walk in silence, your subconscious continues to assemble patterns that conscious effort failed to unlock.\n\nProtect your fallow periods. Learn to honor the seasons of your craft, knowing that stillness is not lost time—it is the prerequisite for your best subsequent output.`,
        coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
        author: admin._id,
        category: catCareer._id,
        tags: [tagMind._id, tagWriting._id],
        status: 'published',
        publishAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        views: 740,
      },
      {
        title: 'The Evolution of Modern Typefaces on High-Density Displays',
        slug: 'the-evolution-of-modern-typefaces-on-high-density-displays',
        excerpt: 'How retina screens liberated letterforms from the pixel grid and brought the nuance of metal type into contemporary browser typography.',
        content: `For the first two decades of the web, type was shackled to low-resolution screens. Type designers were forced to optimize for severe rasterization constraints, resulting in compromised proportions, exaggerated x-heights, and blunt serifs intended purely to survive screen hinting.\n\nWith today’s ultra-high-density displays, typography has entered a renaissance. Subtle optical sizes, delicate hairline contrasts, and expressive alternates can finally be appreciated in digital form. This article explores how modern font engines and variable font axes allow publications to recreate the intimacy and precision of fine bookcraft directly on glass.`,
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop',
        author: elena._id,
        category: catDesign._id,
        tags: [tagTypo._id, tagArch._id],
        status: 'scheduled',
        publishAt: new Date(Date.now() + 1000 * 60 * 60 * 48), // 2 days in the future
        views: 0,
      },
      {
        title: 'Building Compassionate Engineering Teams',
        slug: 'building-compassionate-engineering-teams',
        excerpt: 'Empathy is not a soft luxury in technical leadership; it is the most reliable predictor of team velocity, retention, and fault tolerance.',
        content: `In high-pressure engineering organizations, mistakes are inevitable. Servers falter, migrations drop indexes, and regressions slip through test suites. How a team responds in the wake of an incident reveals the foundational health of its culture.\n\nBlameless postmortems, transparent retrospectives, and mutual psychological safety allow engineers to discuss vulnerabilities without fear of retribution. When people feel safe admitting what they do not know, learning accelerates across the entire organization.`,
        coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
        author: marcus._id,
        category: catCareer._id,
        tags: [tagLead._id, tagRemote._id],
        status: 'pending',
        publishAt: null,
        views: 0,
      },
      {
        title: 'The Notebook as an External Thinking Engine',
        slug: 'the-notebook-as-an-external-thinking-engine',
        excerpt: 'Why physical paper continues to outperform digital note-taking applications when conceptualizing complex systems from scratch.',
        content: `Before typing a single line of implementation or creating a new document, opening an unlined notebook offers an unconstrained canvas. The tactile friction of pen on paper engages cognitive pathways that keyboards bypass entirely.\n\nIn this draft, we will explore spatial note taking, rapid diagramming, and how carrying a pocket journal transforms idle moments into structured contemplation.`,
        coverImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1200&auto=format&fit=crop',
        author: elena._id,
        category: catProd._id,
        tags: [tagMind._id, tagWriting._id],
        status: 'draft',
        publishAt: null,
        views: 0,
      },
    ]);

    console.log('Creating comments...');
    await Comment.create([
      {
        post: stories[0]._id,
        user: sarah._id,
        text: 'This articulated something I have felt for years in our sprint planning meetings. We often chase velocity metrics that have zero correlation with real architectural stability.',
        status: 'approved',
      },
      {
        post: stories[0]._id,
        user: marcus._id,
        text: 'Tremendous writeup, Elena. The point about constraint being the primary discipline really hits home.',
        status: 'approved',
      },
      {
        post: stories[1]._id,
        user: sarah._id,
        text: 'The reading experience on modern editorial sites has gotten so loud. I love seeing a publication advocate for whitespace and quiet typography.',
        status: 'approved',
      },
      {
        post: stories[2]._id,
        user: elena._id,
        text: 'The transition from synchronous to asynchronous communication was supposed to give us our time back, yet calendar exhaustion was simply replaced by inbox exhaustion.',
        status: 'approved',
      },
      {
        post: stories[2]._id,
        user: sarah._id,
        text: 'Would love to see a follow-up piece specifically discussing how teams manage cross-timezone collaboration without constant async pings.',
        status: 'pending', // Pending editorial review
      },
    ]);

    console.log('Database seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('SAGA DEMO LOGINS (Password for all: password123)');
    console.log('Admin:   admin@saga.com   (Eleanor Vance)');
    console.log('Editor:  editor@saga.com  (Julian Croft)');
    console.log('Writer:  elena@saga.com   (Elena Rostova)');
    console.log('Writer:  marcus@saga.com  (Marcus Chen)');
    console.log('Reader:  sarah@saga.com   (Sarah Jenkins)');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

export const seedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Populating with initial editorial content...');
      await seedDatabase();
    }
  } catch (error) {
    console.error('Error checking database state for seeder:', error.message);
  }
};

// Direct script execution support
if (process.argv[1] && process.argv[1].endsWith('seeder.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}

export default seedDatabase;