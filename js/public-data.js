// Verified Public Dataset with Real Editorial Photography Paths
// Single Authoritative Data Source for Homepage, Leadership Directory & Profile Modal

export const DEFAULT_PUBLIC_DATA = {
  announcement: {
    message: "Dubai Oasis Lions Club — United in humanitarian service across the United Arab Emirates.",
    linkText: "Explore Projects",
    linkUrl: "projects.html"
  },
  leadership: [
    {
      id: "l1",
      name: "Alfin Mathew",
      role: "Technology & Communications Chair",
      committee: "Digital Strategy & Public Communications",
      bio: "Charter member and software engineer leading digital transformation, community portal architecture, and public communications for Dubai Oasis Lions Club.",
      interests: ["Vision Care", "Technology in Humanitarian Service", "Youth Mentorship"],
      avatar: "assets/images/leadership-1.jpg"
    },
    {
      id: "l2",
      name: "Charter Executive Office",
      role: "Club Presidency & Executive Governance",
      committee: "Executive Board",
      bio: "Guiding club governance, strategic humanitarian partnerships, and civic outreach initiatives across Dubai in alignment with Lions Clubs International standards.",
      interests: ["Civic Leadership", "Humanitarian Relief", "Community Partnerships"],
      avatar: "assets/images/leadership-2.jpg"
    },
    {
      id: "l3",
      name: "Office of the Secretary",
      role: "Honorary Secretary & Club Records",
      committee: "Administration & Compliance",
      bio: "Stewarding official club protocols, charter documentation, member coordination, and regulatory liaison across the United Arab Emirates.",
      interests: ["Club Governance", "Member Fellowship", "International Liaison"],
      avatar: "assets/images/leadership-3.jpg"
    },
    {
      id: "l4",
      name: "Service Projects Committee",
      role: "Director of Humanitarian Service",
      committee: "Community Service & Outreach",
      bio: "Coordinating field deployments for preventable blindness screenings, nutritional food care drives, youth mentorship forums, and desert conservation.",
      interests: ["Vision Screening", "Hunger Relief", "Environmental Stewardship"],
      avatar: "assets/images/hero-service.jpg"
    }
  ],
  news: [
    {
      id: "n1",
      title: "Inauguration of Our New Chapter of Community Service",
      slug: "inauguration-lions-year-2026-2027",
      category: "Club Announcements",
      summary: "Members, volunteers, and community partners convene to launch high-impact initiatives across vision care, hunger relief, and youth mentorship.",
      published_at: "2026-10-01",
      cover_image_url: "assets/images/hero-service.jpg",
      is_featured: true,
      content: "Members, volunteers and community partners gathered to inaugurate the new Lions Year under the global inspiring theme Together We Can. Focused on high-impact service projects spanning eye health, diabetes awareness, youth development and environmental sustainability in Dubai."
    },
    {
      id: "n2",
      title: "Community Health & Vision Screening Initiative Announced",
      slug: "community-vision-screening-initiative",
      category: "Service Activities",
      summary: "Preparations underway for comprehensive vision checkup drives in partnership with local healthcare providers across Dubai.",
      published_at: "2026-10-05",
      cover_image_url: "assets/images/project-vision.jpg",
      is_featured: false,
      content: "In accordance with Lions International global causes, Dubai Oasis Lions Club will host accessible vision checkups across community centers."
    },
    {
      id: "n3",
      title: "Youth Leadership & Mentorship Forum Opens Registration",
      slug: "youth-leadership-forum-2026",
      category: "Community News",
      summary: "Empowering upcoming student leaders through mentorship, teamwork exercises, and ethical civic problem-solving.",
      published_at: "2026-10-08",
      cover_image_url: "assets/images/project-youth.jpg",
      is_featured: false,
      content: "A workshop series dedicated to inspiring high school and university students to become active contributors to societal development."
    }
  ],
  events: [
    {
      id: "e1",
      title: "Annual Community Vision Care Drive",
      slug: "annual-vision-care-drive",
      start_time: "2026-11-15T09:00:00+04:00",
      location: "Al Quoz Community Center, Dubai",
      description: "Free comprehensive eye examinations, diagnostic screening, and corrective eyewear support for community workers.",
      cover_image_url: "assets/images/project-vision.jpg"
    },
    {
      id: "e2",
      title: "Dubai Oasis Environmental Clean-up & Planting Day",
      slug: "environmental-cleanup-planting",
      start_time: "2026-12-05T08:00:00+04:00",
      location: "Al Qudra Lakes Reserve, Dubai",
      description: "Join fellow Lions and eco-conscious volunteers in conserving local nature reserves and planting indigenous ghaf trees.",
      cover_image_url: "assets/images/project-eco.jpg"
    },
    {
      id: "e3",
      title: "Community Nutritional Outreach & Food Care Assembly",
      slug: "diabetes-wellness-walk",
      start_time: "2027-01-20T09:30:00+04:00",
      location: "Deira Community Hall, Dubai",
      description: "Preparing and distributing balanced nutritional packages in partnership with approved humanitarian channels.",
      cover_image_url: "assets/images/project-food.jpg"
    }
  ],
  projects: [
    {
      id: "p1",
      title: "Dubai Vision Care Campaign",
      slug: "dubai-vision-care-campaign",
      category: "Vision",
      summary: "Free visual screening, eyeglasses distribution, and ophthalmological consultations for community workers across Dubai.",
      location: "Al Quoz Community Center, Dubai",
      project_date: "2026-11-15",
      cover_image_url: "assets/images/project-vision.jpg",
      status: "published",
      full_content: "In alignment with Lions International's century-long commitment to sight preservation, the Dubai Vision Care Campaign provides essential diagnostic eye examinations and corrective spectacles to those who need them most."
    },
    {
      id: "p2",
      title: "Oasis Hunger Relief & Food Care",
      slug: "oasis-hunger-relief-food-care",
      category: "Hunger Relief",
      summary: "Nutritional support packages and balanced meals distributed to support families and workers in need.",
      location: "Deira & Bur Dubai",
      project_date: "2026-10-28",
      cover_image_url: "assets/images/project-food.jpg",
      status: "published",
      full_content: "Direct humanitarian relief ensuring dignified nutrition assistance through structured distribution drives."
    },
    {
      id: "p3",
      title: "Youth Leadership & Mentorship Forum",
      slug: "youth-leadership-mentorship-forum",
      category: "Youth Support",
      summary: "Empowering the next generation through interactive workshops in civic engagement and sustainable service.",
      location: "Dubai Knowledge Park",
      project_date: "2026-12-05",
      cover_image_url: "assets/images/project-youth.jpg",
      status: "published",
      full_content: "Fostering ethical, community-minded leadership skills among young people across the United Arab Emirates."
    }
  ],
  impact: [],
  members: [
    {
      id: "m1",
      name: "Alfin Mathew",
      role: "Charter Member & Technology Lead",
      committee: "Digital Strategy & Technology",
      interests: ["Vision", "Technology in Service", "Youth Mentorship"],
      bio: "Passionate humanitarian and software engineer championing digital transformation in community service.",
      avatar: "assets/images/leadership-1.jpg"
    },
    {
      id: "m2",
      name: "Community Service Fellowship",
      role: "Approved Public Member Directory",
      committee: "Community Outreach",
      interests: ["Hunger Relief", "Environment"],
      bio: "Dedicated to local volunteering and active participation in Dubai humanitarian initiatives.",
      avatar: "assets/images/hero-service.jpg"
    }
  ],
  gallery: [
    { id: "g1", title: "Humanitarian Outreach Assembly", url: "assets/images/hero-service.jpg", caption: "Volunteers preparing community care packages in Dubai" },
    { id: "g2", title: "Vision Screening Clinic", url: "assets/images/project-vision.jpg", caption: "Preventable blindness screening and eye care support" },
    { id: "g3", title: "Desert Conservation & Tree Planting", url: "assets/images/project-eco.jpg", caption: "Planting native ghaf saplings in Dubai nature reserves" }
  ]
};
