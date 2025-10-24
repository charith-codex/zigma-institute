const sampleData = {
  classes: [
    {
      name: "A/L Accounting",
      slug: "al-accounting",
      cover_image: "/images/al_accounting.jpg",
      teacher: {
        name: "Mr. Sameera Jayawardena",
        profile_image: "/images/teachers/sameera.jpg",
      },
      description: "Advanced Level Accounting course covering financial accounting, cost accounting, and corporate reporting.",
      category: "Advanced Level",
      schedule: "Monday & Wednesday 8:30 AM - 10:30 AM",
      weeks: [
        {
          week: "Week 1",
          description: "Introduction to accounting concepts and double-entry principles.",
          tutes: ["/tutes/al_accounting/week1/accounting-basics.pdf"],
          videos: ["https://publitio.com/v/al_accounting_week1_intro.mp4"],
          papers: ["/papers/al_accounting/week1/practice-paper.pdf"],
          quiz: {
            title: "Accounting Basics Quiz",
            totalQuestions: 10,
            ai_generated: true
          }
        },
        {
          week: "Week 2",
          description: "Recording transactions and preparing trial balances.",
          tutes: ["/tutes/al_accounting/week2/trial-balance.pdf"],
          videos: ["https://publitio.com/v/al_accounting_week2_trialbalance.mp4"],
          papers: ["/papers/al_accounting/week2/exercise.pdf"],
          quiz: {
            title: "Trial Balance Quiz",
            totalQuestions: 12,
            ai_generated: false
          }
        }
      ]
    },
    {
      name: "A/L Business Studies",
      slug: "al-business-studies",
      cover_image: "/images/al_business_studies.jpg",
      teacher: {
        name: "Ms. Dinusha Silva",
        profile_image: "/images/teachers/dinusha.jpg",
      },
      description: "Comprehensive A/L Business Studies course focusing on business environment, management, and entrepreneurship.",
      category: "Advanced Level",
      schedule: "Tuesday & Thursday 9:00 AM - 11:00 AM",
      weeks: [
        {
          week: "Week 1",
          description: "Understanding business objectives, environment, and forms of ownership.",
          tutes: ["/tutes/al_business/week1/business-intro.pdf"],
          videos: ["https://publitio.com/v/al_business_week1_intro.mp4"],
          papers: ["/papers/al_business/week1/sample-paper.pdf"],
          quiz: {
            title: "Business Fundamentals Quiz",
            totalQuestions: 8,
            ai_generated: true
          }
        },
        {
          week: "Week 2",
          description: "Principles of management and organizational structure.",
          tutes: ["/tutes/al_business/week2/management-principles.pdf"],
          videos: ["https://publitio.com/v/al_business_week2_management.mp4"],
          papers: ["/papers/al_business/week2/practice-paper.pdf"],
          quiz: {
            title: "Management Quiz",
            totalQuestions: 10,
            ai_generated: false
          }
        }
      ]
    },
    {
      name: "A/L Economics",
      slug: "al-economics",
      cover_image: "/images/al_economics.jpg",
      teacher: {
        name: "Mr. Ruwan Abeysekara",
        profile_image: "/images/teachers/ruwan.jpg",
      },
      description: "Advanced Level Economics course focusing on microeconomics, macroeconomics, and international trade concepts.",
      category: "Advanced Level",
      schedule: "Friday & Saturday 8:00 AM - 10:00 AM",
      weeks: [
        {
          week: "Week 1",
          description: "Introduction to economics, scarcity, and basic economic problems.",
          tutes: ["/tutes/al_economics/week1/economic-basics.pdf"],
          videos: ["https://publitio.com/v/al_economics_week1_intro.mp4"],
          papers: ["/papers/al_economics/week1/sample-paper.pdf"],
          quiz: {
            title: "Economic Basics Quiz",
            totalQuestions: 10,
            ai_generated: true
          }
        },
        {
          week: "Week 2",
          description: "Demand, supply, and market equilibrium analysis.",
          tutes: ["/tutes/al_economics/week2/demand-supply.pdf"],
          videos: ["https://publitio.com/v/al_economics_week2_demand_supply.mp4"],
          papers: ["/papers/al_economics/week2/practice-paper.pdf"],
          quiz: {
            title: "Demand & Supply Quiz",
            totalQuestions: 12,
            ai_generated: false
          }
        }
      ]
    },
    {
      name: "A/L Physics",
      slug: "al-physics",
      cover_image: "/images/al_physics.jpg",
      teacher: {
        name: "Dr. Kanishka Weerasinghe",
        profile_image: "/images/teachers/kanishka.jpg",
      },
      description: "Advanced Level Physics covering mechanics, thermodynamics, electricity, and modern physics concepts.",
      category: "Advanced Level",
      schedule: "Monday & Thursday 2:00 PM - 4:00 PM",
      weeks: [
        {
          week: "Week 1",
          description: "Introduction to physical quantities, units, and measurement techniques.",
          tutes: ["/tutes/al_physics/week1/units-measurements.pdf"],
          videos: ["https://publitio.com/v/al_physics_week1_units.mp4"],
          papers: ["/papers/al_physics/week1/sample-paper.pdf"],
          quiz: {
            title: "Units & Measurements Quiz",
            totalQuestions: 10,
            ai_generated: true
          }
        },
        {
          week: "Week 2",
          description: "Basic concepts of motion — speed, velocity, and acceleration.",
          tutes: ["/tutes/al_physics/week2/motion.pdf"],
          videos: ["https://publitio.com/v/al_physics_week2_motion.mp4"],
          papers: ["/papers/al_physics/week2/practice-paper.pdf"],
          quiz: {
            title: "Kinematics Quiz",
            totalQuestions: 15,
            ai_generated: false
          }
        }
      ]
    },
    {
      name: "A/L Bio Science",
      slug: "al-bio-science",
      cover_image: "/images/al_bio.jpg",
      teacher: {
        name: "Ms. Harini Dissanayake",
        profile_image: "/images/teachers/harini.jpg",
      },
      description: "Advanced Level Biology course exploring cellular biology, genetics, human physiology, and ecology.",
      category: "Advanced Level",
      schedule: "Wednesday & Saturday 10:00 AM - 12:00 PM",
      weeks: [
        {
          week: "Week 1",
          description: "Introduction to cell biology — structure and function of organelles.",
          tutes: ["/tutes/al_bio/week1/cell-structure.pdf"],
          videos: ["https://publitio.com/v/al_bio_week1_cells.mp4"],
          papers: ["/papers/al_bio/week1/sample-paper.pdf"],
          quiz: {
            title: "Cell Biology Quiz",
            totalQuestions: 10,
            ai_generated: true
          }
        },
        {
          week: "Week 2",
          description: "DNA, genes, and introduction to genetics.",
          tutes: ["/tutes/al_bio/week2/genetics.pdf"],
          videos: ["https://publitio.com/v/al_bio_week2_genetics.mp4"],
          papers: ["/papers/al_bio/week2/practice-paper.pdf"],
          quiz: {
            title: "Genetics Quiz",
            totalQuestions: 12,
            ai_generated: false
          }
        }
      ]
    }
  ]
};

export default sampleData;