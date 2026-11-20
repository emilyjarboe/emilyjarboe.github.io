/* ==========================================================
   ALL EDITABLE CONTENT FOR THE MAIN PAGE
   To change something on the site, change it here.
   Wrap a word in *asterisks* to make it cursive italic in headlines.
   Lines marked "SAMPLE" are placeholders until real content arrives.
   ========================================================== */
window.SITE = {
  name: 'Emily',
  fullName: 'Emily Jarboe',          // the hero headline, page title and nav corner
  issue: 'Vol 01 · November 2026',
  updated: 'Nov 2026',

  home: {
    tagline: 'Collecting moments and connections. Good company is my favorite destination.',
    photo: 'images/me-sunset-wide.jpg',
    photoPhone: 'images/me-sunset.jpg',
    photoAlt: 'Smiling on a terrace at sunset'
  },

  about: {
    title: 'A little *about me*',
    photo: 'images/me-graduation.jpg',
    photoAlt: 'Graduation day beside the Testudo statue',
    hello: 'Hi, I’m Emily,',
    // [word](#section) links to that part of the page; [Maverick](#maverick) makes the corner dog say hi
    paragraphs: [
      'Welcome to my page! You might have noticed the white dog in the corner, that is my family’s dog, [Maverick](#maverick)! I am passionate about traveling, creating art, and staying active. You can find me outdoors, hiking or just sitting in a park soaking up the sun. I am on a mission to live life to its fullest, seizing opportunities, and pushing myself out of my comfort zone.',
      'Two things that define me: a love of [travel](#travels) and a love of [dogs](#rover).'
    ],
    facts: [
      { label: 'Studied', value: 'Finance and Real Estate *Development*' },
      { label: 'Based in', value: 'Baltimore, *MD*' },
      { label: 'Always', value: 'Petting *the dog*' }
    ],
    resume: '',          // e.g. 'resume.pdf' once you send it
    linkedin: ''         // e.g. 'https://www.linkedin.com/in/yourname'
  },

  rover: {
    title: 'Walking dogs, *on Rover*',
    intro: 'You mean I get to hang out with dogs AND get paid?',
    profile: 'https://www.rover.com/sit/emilyj51316',
    stats: [
      { value: '5.0', label: 'Star rating' },
      { value: '11', label: 'Reviews' },
      { value: '4', label: 'Repeat clients' },
      { value: '7', label: 'Years of experience' }
    ],
    badges: ['Star Sitter', 'Enhanced background check'],
    reviews: [
      { quote: 'Emily was wonderful with my pug puppy, Peaches! She watched her for the weekend, and I felt at ease knowing she was in great hands. Emily was communicative, prompt, and kept me updated with messages and photos. I highly recommend Emily to anyone looking for a trustworthy, caring, and reliable dog sitter. Would definitely book again!', by: 'Kaitlyn, owner of Peaches the pug puppy' }
    ],
    photos: ['images/rover/walk-1.jpg', 'images/rover/walk-2.jpg', 'images/rover/walk-3.jpg'],
    photoAlts: ['Holding a black-and-tan puppy on the grass', 'Crouching with two dogs in fall leaves', 'Smiling beside a white dog in a playhouse']
  },

  travels: {
    title: 'Stamps in my *passport*',
    intro: [
      'My love of traveling comes from the thrill of spontaneity and the moments you can’t plan for. I’m a true backpacker at heart: budget hostels, flexible plans, and everything I need in a 40L pack. What stays with me the most isn’t the places themselves but the people I meet along the way.',
      'Here are some of my favorite photos and where I took them.'
    ],
    // name = what the site shows; map = the country's name on the map, if different.
    // when / note are optional. Photos: focus = which part of the photo to keep in view when cropped.
    // noPhotos: true = a country with no photo panel (just the name, and the when/note if given).
    countries: [
      { name: 'England', map: 'United Kingdom', when: '', note: '', photos: [
        { src: 'images/travels/england/england-2.jpg', alt: 'Me waving beside a red telephone box, with the clock tower in the background', focus: '58% 60%' },
        { src: 'images/travels/england/england-1.jpg', alt: 'A cottage on a grassy clifftop above the sea, with white chalk cliffs in the distance', focus: '40% 60%' }
      ] },
      { name: 'Spain', when: '', note: '', photos: [
        { src: 'images/travels/spain/spain-1.jpg', alt: 'A small cove of clear turquoise water below a pine-covered hillside and white boathouses', focus: '50% 58%' }
      ] },
      { name: 'France', when: '', note: '', photos: [
        { src: 'images/travels/france/france-1.jpg', alt: 'A calm gray-blue bay with a paddleboard and small boats, mountains and a coastal town across the water', focus: '50% 45%' }
      ] },
      { name: 'Portugal', when: '', note: '', photos: [
        { src: 'images/travels/portugal/portugal-1.jpg', alt: 'A view over terracotta rooftops down to the sea, framed by leaves', focus: '45% 68%' },
        { src: 'images/travels/portugal/portugal-2.jpg', alt: 'Dinner with friends on a terrace at sunset, with a curly dog on a lap', focus: '50% 72%' },
        { src: 'images/travels/portugal/portugal-3.jpg', alt: 'A wide sandy beach at sunset, with a painted surfboard propped by the steps down', focus: '50% 60%' }
      ] },
      { name: 'Denmark', when: '', note: '', photos: [
        { src: 'images/travels/denmark/denmark-1.jpg', alt: 'Colorful old houses along a harbor canal, with sailboats moored on the water', focus: '40% 55%' }
      ] },
      { name: 'Italy', when: '', note: '', photos: [
        { src: 'images/travels/italy/italy-1.jpg', alt: 'Me on horseback in a vineyard, with a hilltop town of stone towers in the distance', focus: '40% 55%' },
        { src: 'images/travels/italy/italy-2.jpg', alt: 'Rolling countryside of vineyards, olive trees and a stone farmhouse under a blue sky', focus: '50% 62%' },
        { src: 'images/travels/italy/italy-3.jpg', alt: 'A hillside of cypress trees with a city in the distance at sunset', focus: '55% 60%' },
        { src: 'images/travels/italy/italy-4.jpg', alt: 'A beach lined with rows of blue and yellow striped umbrellas, boats out on the water', focus: '50% 72%' }
      ] },
      { name: 'Croatia', when: '', note: '', photos: [
        { src: 'images/travels/croatia/croatia-1.jpg', alt: 'Sitting on a sunny stone dock by clear green water, looking out at a small boat and a wooded shore', focus: '45% 62%' },
        { src: 'images/travels/croatia/croatia-2.jpg', alt: 'A wide row of waterfalls tumbling into a clear green river, surrounded by trees', focus: '60% 65%' }
      ] },
      { name: 'New Zealand', when: '', note: '', photos: [
        { src: 'images/travels/new-zealand/nz-1.jpg', alt: 'A glassy turquoise lake stretching toward a range of snow-capped peaks', focus: '55% 62%' },
        { src: 'images/travels/new-zealand/nz-2.jpg', alt: 'A steep mountain peak rising straight out of a dark blue fiord under bright clouds', focus: '50% 55%' },
        { src: 'images/travels/new-zealand/nz-3.jpg', alt: 'Purple lupins in a green meadow below a snowy mountain', focus: '55% 55%' },
        { src: 'images/travels/new-zealand/nz-4.jpg', alt: 'Wild lupins in tall golden grass, with mountains under glowing clouds', focus: '50% 55%' }
      ] },
      { name: 'Poland', when: '', note: '', noPhotos: true },
      { name: 'Greece', when: '', note: '', photos: [
        { src: 'images/travels/greece/greece-1.jpg', alt: 'Turquoise water between white sea cliffs and a rock arch, with sailboats anchored in the cove', focus: '48% 55%' },
        { src: 'images/travels/greece/greece-2.jpg', alt: 'A tall white sea cliff over bright blue water, with a sailboat anchored at its base', focus: '45% 60%' }
      ] },
      { name: 'USA', map: 'United States of America', when: '', note: '', photos: [
        { src: 'images/travels/usa/usa-1.jpg', alt: 'A quiet beach below grassy bluffs at dusk, the sky fading from blue to pink', focus: '40% 60%' },
        { src: 'images/travels/usa/usa-2.jpg', alt: 'Two palm trees on top of a sandstone cliff, with waves breaking below', focus: '65% 50%' },
        { src: 'images/travels/usa/usa-3.jpg', alt: 'A city skyline across the water under a bright orange and pink sunset', focus: '60% 50%' }
      ] },
      { name: 'Mexico', when: '', note: '', noPhotos: true },
      { name: 'Jamaica', when: '', note: '', noPhotos: true },
      { name: 'Bahamas', when: '', note: '', noPhotos: true },
      { name: 'Dominican Republic', map: 'Dominican Rep.', when: '', note: '', noPhotos: true }
    ]
  },

  // Big link at the bottom of the main page that leads to the Lately page
  latelyCta: { lead: 'See what I am up to', word: 'Lately', href: 'lately.html' },

  // ---------- LATELY PAGE (lately.html) ----------
  lately: {
    title: "What I'm *into* lately",
    updated: 'November 2026',
    now: [
      { label: 'Reading', title: 'The Sixth Faction', by: 'Veronica Roth', line: '' },
      { label: 'Just watched', title: 'East of Eden', by: 'Netflix series · Florence Pugh', line: "A family drama based on John Steinbeck's novel." }
    ],
    spotify: {
      url: 'https://open.spotify.com/playlist/1QUWpfmPBzlAgEg8jODCtf',
      embed: 'https://open.spotify.com/embed/playlist/1QUWpfmPBzlAgEg8jODCtf?utm_source=generator'
    },
    // FAVORITES section: a headline, then two parts (books, then skincare).
    favoritesTitle: 'My *favorites*',
    booksTitle: 'Favorite *Books*',
    // Favorite books, shown on the illustrated bookshelf.
    // "line" = genre and setting. spine = which cut-out book on the shelf (1–4).
    // cloth = the drawn cover's color. motif = the little gold drawing on it:
    // 'books', 'mountains', 'feather' or 'suitcase'.
    books: [
      { title: 'The Book Thief', by: 'Markus Zusak', line: 'Historical fiction set in Nazi Germany during World War II.', spine: 1, cloth: '#3E4A57', motif: 'books' },
      { title: 'Beneath a Scarlet Sky', by: 'Mark Sullivan', line: 'Historical fiction based on a true story, set in Italy during World War II.', spine: 2, cloth: '#9C3A27', motif: 'mountains' },
      { title: 'Where the Crawdads Sing', by: 'Delia Owens', line: 'A mystery and coming-of-age story set in the marshes of North Carolina.', spine: 3, cloth: '#55684F', motif: 'feather' },
      { title: 'People We Meet on Vacation', by: 'Emily Henry', line: 'A friends-to-lovers romantic comedy told over years of summer trips.', spine: 4, cloth: '#4F6F8F', motif: 'suitcase' }
    ],
    skincare: {
      title: 'Skincare I’ve been *loving*',
      photo: '',          // e.g. 'images/lately/skincare.jpg' once you send your shelfie
      photoAlt: 'My four skincare products together on a shelf',
      steps: [
        { step: 'Cleanse', product: 'Round Lab 1025 Dokdo Cleanser', line: 'A gentle daily cleanser.' },
        { step: 'Pad', product: 'Mediheal Madecassoside Blemish Pad', line: 'Soothing pads for blemish-prone skin.', tag: 'Night only' },
        { step: 'Tone', product: 'Torriden hydrating toner', line: 'Lightweight hydration.' },
        { step: 'Moisturize', product: 'Dr.G Red Blemish Clear Soothing Cream', line: 'A light, calming moisturizer.' }
      ]
    }
  },

  contact: {
    email: '',           // public email
    linkedin: '',
    instagram: ''
  },

  // Credit line for the Maverick illustrations (filled in once we know the source's license)
  illustrationCredit: ''
};
