export const MOCK_CAMPUSES = [
  { id: '1', name: 'Northvale Institute of Technology',       short_code: 'NIT-N' },
  { id: '2', name: 'Deccan Engineering University',           short_code: 'DEU'   },
  { id: '3', name: 'Vistara College of Science & Tech',       short_code: 'VCST'  },
  { id: '4', name: 'Indravali Technical University',          short_code: 'ITU'   },
  { id: '5', name: 'Sahyadri Institute of Advanced Studies',  short_code: 'SIAS'  },
]

export const MOCK_SKILLS = [
  {
    id: '1', title: 'VLSI Circuit Design', category: 'Electronics',
    mentor: 'Priya S.', campus: 'Deccan Engineering University',
    karma_cost: 80, avg_rating: 4.9, total_reviews: 14,
    is_nexus: true, tags: ['CMOS', 'Layout', 'Embedded']
  },
  {
    id: '2', title: 'React.js & Hooks Deep Dive', category: 'Coding',
    mentor: 'Arjun M.', campus: 'Northvale Institute of Technology',
    karma_cost: 60, avg_rating: 4.7, total_reviews: 9,
    is_nexus: false, tags: ['React', 'Frontend', 'JavaScript']
  },
  {
    id: '3', title: 'ROS2 Robotics Fundamentals', category: 'Robotics',
    mentor: 'Fatima K.', campus: 'Vistara College of Science & Tech',
    karma_cost: 100, avg_rating: 5.0, total_reviews: 6,
    is_nexus: true, tags: ['ROS2', 'Robotics', 'Python']
  },
  {
    id: '4', title: 'DSA & Competitive Programming', category: 'Coding',
    mentor: 'Priyanka R.', campus: 'Sahyadri Institute of Advanced Studies',
    karma_cost: 70, avg_rating: 4.8, total_reviews: 21,
    is_nexus: true, tags: ['DSA', 'CP', 'C++', 'Algorithms']
  },
]

export const MOCK_RESOURCES = [
  {
    id: '1', title: 'Data Structures Cheat Sheet', type: 'PDF',
    subject: 'Computer Science', campus: 'Northvale Institute of Technology',
    karma_cost: 10, download_count: 1200, is_verified: true
  },
  {
    id: '2', title: 'Advanced Robotics Lab Manual', type: 'Doc',
    subject: 'Mechanical', campus: 'Vistara College of Science & Tech',
    karma_cost: 25, download_count: 480, is_verified: true, is_nexus: true
  },
  {
    id: '3', title: 'Discrete Mathematics Notes', type: 'Doc',
    subject: 'Mathematics', campus: 'Deccan Engineering University',
    karma_cost: 15, download_count: 760, is_verified: false
  },
]

export const MOCK_TESTIMONIALS = [
  {
    name: 'Rohan M.',
    campus: 'Indravali Technical University',
    dept: 'Computer Science, 2nd Year',
    avatar_seed: 'Rohan',
    rating: 5,
    quote: `I was failing DSA. Found a 3rd-year from Deccan Engineering
            through Nexus in 2 days. Traded React tutoring for DSA coaching.
            Cleared my exam with 8.2 CGPA. This platform is insane.`
  },
  {
    name: 'Sneha R.',
    campus: 'Vistara College of Science & Tech',
    dept: 'Electronics, 3rd Year',
    avatar_seed: 'Sneha',
    rating: 5,
    quote: `I uploaded my VLSI notes, earned 400 Karma in a week,
            and unlocked 3 Robotics PDFs I had been looking for all semester.
            This platform literally pays you back for knowing things.`
  },
  {
    name: 'Kabir D.',
    campus: 'Northvale Institute of Technology',
    dept: 'Mechanical Engineering, Final Year',
    avatar_seed: 'Kabir',
    rating: 5,
    quote: `My campus had no competitive programming community at all.
            Through Nexus Mode I found a mentor from Sahyadri Institute.
            8 sessions later, I qualified for regionals. Distance was never
            the barrier. Discovery was.`
  },
]
