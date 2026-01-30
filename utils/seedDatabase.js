import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../model/Course.js';
import assessment from '../model/assessment.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Sample courses data
const coursesData = [
  {
    title: 'Introduction to Quality Management Systems',
    description: 'Learn the fundamentals of Quality Management Systems (QMS) and how they can improve organizational performance.',
    category: 'Management',
    level: 'Beginner',
    duration: 1800, // 30 minutes
    instructor: 'Sarah Johnson',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tags: ['quality management', 'ISO 9001', 'business processes'],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-03-10'),
    featured: true,
    rating: 4.8,
    enrollments: 1245
  },
  {
    title: 'Effective Communication Techniques',
    description: 'Discover key strategies for clear, persuasive, and professional communication in the workplace.',
    category: 'Communication',
    level: 'Intermediate',
    duration: 2700, // 45 minutes
    instructor: 'Michael Chen',
    thumbnail: 'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tags: ['communication', 'professional development', 'workplace'],
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-04-15'),
    featured: true,
    rating: 4.6,
    enrollments: 987
  },
  {
    title: 'Leadership for Administrative Growth',
    description: 'Learn how to evolve from a traditional administrator into a growth-oriented leader.',
    category: 'Leadership',
    level: 'Intermediate',
    duration: 3600, // 60 minutes
    instructor: 'Jennifer Williams',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tags: ['leadership', 'administration', 'personal growth'],
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date('2023-05-18'),
    featured: true,
    rating: 4.9,
    enrollments: 1532
  },
  {
    title: 'Time Management Mastery',
    description: 'Master time management with proven techniques to prioritize tasks and achieve more in less time.',
    category: 'Productivity',
    level: 'Beginner',
    duration: 1200, // 20 minutes
    instructor: 'Emily Parker',
    thumbnail: 'https://images.unsplash.com/photo-1508962914676-89555e2ad6b9?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tags: ['time management', 'productivity', 'efficiency'],
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-06-05'),
    featured: false,
    rating: 4.7,
    enrollments: 2145
  },
  {
    title: 'Workplace Safety Essentials',
    description: 'Learn how to identify and mitigate workplace hazards to ensure a safe environment for all employees.',
    category: 'Safety',
    level: 'Beginner',
    duration: 2400, // 40 minutes
    instructor: 'Robert Martinez',
    thumbnail: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tags: ['workplace safety', 'hazard prevention', 'OSHA'],
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-07-20'),
    featured: false,
    rating: 4.5,
    enrollments: 876
  },
  {
    title: 'Data Analysis Fundamentals',
    description: 'Learn the basics of data analysis and how to derive meaningful insights from data sets.',
    category: 'Analytics',
    level: 'Intermediate',
    duration: 3000, // 50 minutes
    instructor: 'David Wilson',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tags: ['data analysis', 'statistics', 'business intelligence'],
    createdAt: new Date('2023-06-20'),
    updatedAt: new Date('2023-08-25'),
    featured: false,
    rating: 4.4,
    enrollments: 1232
  }
];

// Sample assessmentzes data
const assessmentzesData = [
  {
    courseId: null, // This will be filled in after course creation
    title: 'Quality Management Systems assessment',
    description: 'Test your knowledge of QMS principles and practices.',
    timeLimit: 15,
    passScore: 70,
    questions: [
      {
        text: 'What is the primary purpose of a Quality Management System?',
        options: [
          'To increase profits',
          'To formalize processes for consistent quality',
          'To reduce employee workload',
          'To meet minimum regulatory requirements'
        ],
        correctOption: 1,
        explanation: 'A Quality Management System primarily aims to formalize processes to ensure consistent quality across an organization.'
      },
      {
        text: 'Which ISO standard is specifically focused on Quality Management Systems?',
        options: [
          'ISO 14001',
          'ISO 27001',
          'ISO 9001',
          'ISO 45001'
        ],
        correctOption: 2,
        explanation: 'ISO 9001 is the international standard that specifies requirements for a quality management system (QMS).'
      },
      {
        text: 'What is the PDCA cycle in quality management?',
        options: [
          'Prepare, Deliver, Check, Adjust',
          'Plan, Do, Check, Act',
          'Process, Document, Control, Audit',
          'Perform, Detail, Correct, Advance'
        ],
        correctOption: 1,
        explanation: 'PDCA stands for Plan, Do, Check, Act. It is an iterative four-step management method used for the control and continuous improvement of processes and products.'
      },
      {
        text: 'Who is ultimately responsible for quality in an organization?',
        options: [
          'The Quality Manager',
          'The CEO',
          'The production team',
          'Everyone in the organization'
        ],
        correctOption: 3,
        explanation: 'In an effective QMS, quality is everyone\'s responsibility, from top management to every employee in the organization.'
      },
      {
        text: 'What is a key benefit of implementing a QMS?',
        options: [
          'Reduced need for employee training',
          'Elimination of all product defects',
          'Improved consistency and customer satisfaction',
          'Guaranteed increased market share'
        ],
        correctOption: 2,
        explanation: 'A key benefit of implementing a QMS is improved consistency in processes and products, which leads to higher customer satisfaction.'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    courseId: null,
    title: 'Effective Communication Assessment',
    description: 'Evaluate your understanding of workplace communication principles.',
    timeLimit: 10,
    passScore: 80,
    questions: [
      {
        text: 'What is active listening?',
        options: [
          'Hearing what someone says and responding quickly',
          'Fully concentrating, understanding, responding, and remembering what is being said',
          'Taking notes during a conversation',
          'Nodding and agreeing with everything being said'
        ],
        correctOption: 1,
        explanation: 'Active listening involves fully concentrating on what is being said rather than just passively hearing the message.'
      },
      {
        text: 'Which communication channel is best for delivering complex, sensitive information?',
        options: [
          'Email',
          'Text message',
          'Face-to-face conversation',
          'Company-wide announcement'
        ],
        correctOption: 2,
        explanation: 'Face-to-face communication is generally best for complex or sensitive information as it allows for immediate feedback and non-verbal cues.'
      },
      {
        text: 'What is the primary purpose of nonverbal communication in a professional setting?',
        options: [
          'To replace verbal communication entirely',
          'To confuse the recipient',
          'To reinforce and complement verbal messages',
          'To demonstrate authority over others'
        ],
        correctOption: 2,
        explanation: 'Nonverbal communication serves to reinforce, complement, or sometimes contradict verbal messages, adding depth to the communication process.'
      },
      {
        text: 'Which of the following is NOT a barrier to effective communication?',
        options: [
          'Language differences',
          'Physical noise',
          'Emotional state',
          'Clear, concise messaging'
        ],
        correctOption: 3,
        explanation: 'Clear, concise messaging is actually a facilitator of effective communication, not a barrier.'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    courseId: null,
    title: 'Leadership Skills Assessment',
    description: 'Test your knowledge of leadership principles for administrative growth.',
    timeLimit: 12,
    passScore: 75,
    questions: [
      {
        text: 'What is transformational leadership?',
        options: [
          'Leading by giving specific instructions for each task',
          'Leading by example and inspiring others to exceed their own expectations',
          'Leading by strict enforcement of rules and procedures',
          'Leading by delegating all responsibilities to team members'
        ],
        correctOption: 1,
        explanation: 'Transformational leadership involves leading by example and inspiring followers to exceed their expected performance, often through a strong vision and personal charisma.'
      },
      {
        text: 'Which of the following is most important for an administrative leader to develop?',
        options: [
          'Technical skills specific to their industry',
          'The ability to do everyone else\'s job',
          'Emotional intelligence and interpersonal skills',
          'Advanced computer programming skills'
        ],
        correctOption: 2,
        explanation: 'While all skills are valuable, emotional intelligence and interpersonal skills are particularly crucial for leaders to effectively understand, motivate, and work with others.'
      },
      {
        text: 'What is the difference between a manager and a leader?',
        options: [
          'There is no difference; the terms are interchangeable',
          'Managers are appointed; leaders emerge naturally',
          'Managers focus on systems and structure; leaders focus on people and vision',
          'Managers are paid more than leaders'
        ],
        correctOption: 2,
        explanation: 'While management and leadership often overlap, managers typically focus on systems, processes, and maintaining order, while leaders focus on inspiring people, creating vision, and driving change.'
      },
      {
        text: 'What is the most effective way to handle conflict within a team?',
        options: [
          'Ignore it until it resolves itself',
          'Address it directly but constructively, seeking win-win solutions',
          'Always side with the majority opinion',
          'Bring in upper management to resolve every disagreement'
        ],
        correctOption: 1,
        explanation: 'Addressing conflict directly but constructively, with a focus on finding solutions that benefit all parties, is generally the most effective approach.'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    courseId: null,
    title: 'Time Management assessment',
    description: 'Test your understanding of time management principles and techniques.',
    timeLimit: 8,
    passScore: 70,
    questions: [
      {
        text: 'What is the Eisenhower Matrix used for?',
        options: [
          'Planning vacation schedules',
          'Organizing office supplies',
          'Prioritizing tasks based on urgency and importance',
          'Measuring productivity across departments'
        ],
        correctOption: 2,
        explanation: 'The Eisenhower Matrix (also called the Urgent-Important Matrix) helps prioritize tasks by categorizing them according to their urgency and importance.'
      },
      {
        text: 'Which of the following is an example of the Pareto Principle (80/20 rule) in time management?',
        options: [
          '80% of your breaks should be 20 minutes long',
          '20% of your work tasks often generate 80% of your results',
          'You should work for 80 minutes, then rest for 20 minutes',
          '80% of employees complete only 20% of their assigned work'
        ],
        correctOption: 1,
        explanation: 'The Pareto Principle in time management suggests that 20% of your activities often account for 80% of your valuable outcomes or results.'
      },
      {
        text: 'What is timeboxing?',
        options: [
          'Setting a fixed time period for a task and not exceeding it',
          'Using a timer to track billable hours',
          'Taking regular breaks throughout the day',
          'Scheduling meetings back-to-back to save time'
        ],
        correctOption: 0,
        explanation: 'Timeboxing is a time management technique where you allocate a fixed time period, or a "box" of time, to a planned activity and commit to completing it within that timeframe.'
      },
      {
        text: 'Which of these is NOT a recommended time management practice?',
        options: [
          'Creating a to-do list',
          'Setting SMART goals',
          'Multitasking whenever possible',
          'Identifying and eliminating time-wasters'
        ],
        correctOption: 2,
        explanation: 'Contrary to popular belief, multitasking typically reduces productivity and effectiveness. Research shows that focusing on one task at a time is generally more efficient.'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    courseId: null,
    title: 'Workplace Safety assessment',
    description: 'Test your knowledge of workplace safety principles and hazard identification.',
    timeLimit: 15,
    passScore: 80,
    questions: [
      {
        text: 'What should be your first action when you identify a potential safety hazard?',
        options: [
          'Ignore it if it doesn\'t affect you directly',
          'Take a photo to document the issue',
          'Ensure immediate safety and report the hazard',
          'Wait to see if someone else notices it'
        ],
        correctOption: 2,
        explanation: 'The first priority should be ensuring immediate safety (yours and others), followed by properly reporting the hazard through the appropriate channels.'
      },
      {
        text: 'What does PPE stand for in safety contexts?',
        options: [
          'Personal Protective Equipment',
          'Public Protection Enforcement',
          'Primary Preventative Evaluation',
          'Procedural Professional Ethics'
        ],
        correctOption: 0,
        explanation: 'PPE stands for Personal Protective Equipment, which includes items such as helmets, gloves, eye protection, high-visibility clothing, safety footwear, etc.'
      },
      {
        text: 'Which of the following is an example of an administrative control for workplace hazards?',
        options: [
          'Installing machine guards',
          'Providing respirators',
          'Implementing job rotation to reduce exposure',
          'Substituting a toxic chemical with a less hazardous one'
        ],
        correctOption: 2,
        explanation: 'Administrative controls are changes to work procedures such as written safety policies, rules, supervision, schedules, and training to reduce the duration, frequency, and severity of exposure to hazardous materials or situations.'
      },
      {
        text: 'What is the primary purpose of a Job Safety Analysis (JSA)?',
        options: [
          'To determine employee raises and promotions',
          'To identify hazards before they occur by breaking down jobs into steps',
          'To calculate productivity metrics for each position',
          'To justify hiring additional safety personnel'
        ],
        correctOption: 1,
        explanation: 'A Job Safety Analysis (JSA) is a procedure that helps integrate safety and health principles into a particular task or job operation, by breaking the job down into steps and identifying potential hazards and their controls.'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    courseId: null,
    title: 'Data Analysis Fundamentals assessment',
    description: 'Test your understanding of basic data analysis concepts and methods.',
    timeLimit: 20,
    passScore: 75,
    questions: [
      {
        text: 'What is the difference between qualitative and quantitative data?',
        options: [
          'Qualitative data is always more accurate than quantitative data',
          'Quantitative data deals with numbers; qualitative data deals with descriptions',
          'Qualitative data is collected from primary sources; quantitative from secondary sources',
          'There is no significant difference between them'
        ],
        correctOption: 1,
        explanation: 'Quantitative data is numerical and can be measured or counted (e.g., how many, how much). Qualitative data is descriptive and conceptual, focusing on observations that can be observed but not measured (e.g., colors, textures, descriptions).'
      },
      {
        text: 'What does the mean of a data set represent?',
        options: [
          'The middle value when data is arranged in order',
          'The most frequently occurring value',
          'The average of all values',
          'The difference between the highest and lowest values'
        ],
        correctOption: 2,
        explanation: 'The mean (or average) of a data set is calculated by summing all values and dividing by the number of values. It represents the central tendency of the data.'
      },
      {
        text: 'Which of the following visualizations would be most appropriate for showing market share among competitors?',
        options: [
          'Line chart',
          'Scatter plot',
          'Pie chart',
          'Histogram'
        ],
        correctOption: 2,
        explanation: 'A pie chart is ideal for showing proportional data or percentages of a whole, making it well-suited for displaying market share among competitors.'
      },
      {
        text: 'What is correlation in data analysis?',
        options: [
          'A proven cause-and-effect relationship between variables',
          'A statistical measure showing how strongly pairs of variables are related',
          'The process of organizing data into tables',
          'The conversion of qualitative data into quantitative data'
        ],
        correctOption: 1,
        explanation: 'Correlation is a statistical measure that indicates the extent to which two or more variables fluctuate together. It does not imply causation, only a relationship between the variables.'
      },
      {
        text: 'What is the purpose of data cleaning in the analysis process?',
        options: [
          'To make the data look visually appealing in presentations',
          'To remove all outliers regardless of their importance',
          'To identify and correct errors and inconsistencies in the data',
          'To permanently delete sensitive information'
        ],
        correctOption: 2,
        explanation: 'Data cleaning involves identifying and correcting (or removing) errors, inconsistencies, and inaccuracies in datasets to improve data quality and the validity of analysis results.'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Function to clear database and seed with new data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Course.deleteMany({});
    await assessment.deleteMany({});
    
    console.log('Data cleared...');
    
    // Create courses first
    const courses = await Course.insertMany(coursesData);
    console.log(`${courses.length} courses created...`);
    
    // Update assessmentzes with course IDs and create them
    const assessmentzesWithCourseIds = assessmentzesData.map((assessment, index) => {
      return {
        ...assessment,
        courseId: courses[index]._id
      };
    });
    
    const assessmentzes = await assessment.insertMany(assessmentzesWithCourseIds);
    console.log(`${assessmentzes.length} assessmentzes created...`);
    
    // Update courses with assessment IDs
    for (let i = 0; i < courses.length; i++) {
      await Course.findByIdAndUpdate(courses[i]._id, { assessmentId: assessmentzes[i]._id });
    }
    console.log('Courses updated with assessment IDs...');
    
    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 