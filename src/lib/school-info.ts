export const school = {
  name: "Talents College",
  location: "Mukono",
  fullName: "Talents College, Mukono",
  motto: "Power of Knowledge",
  founded: "February 2002",
  registration: "ME/22/3549",
  type: "Private, Mixed, Day & Boarding Secondary School",
  levels: "'O' Level and 'A' Level",
  address: {
    physical: "Nabuti Village, Nsuube/Kauga Ward, Mukono (approx. 1km from Mukono Town Council)",
    postal: "P.O. Box 549, Mukono, Uganda",
  },
  contacts: {
    headTeacher: "+256 773 207 394",
    office1: "+256 703 933 118",
    office2: "+256 773 331 357",
    whatsapp: "+256773207394",
    email: "info@talentscollege.ug",
  },
  social: {
    facebook: "https://www.facebook.com/talentscollegemukono/",
    instagram: "https://www.instagram.com/talentscollegemukono/",
    youtube: "https://www.youtube.com/@talentscollegemukono9690",
    tiktok: "https://www.tiktok.com/@talentscollegemukono",
  },
};

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/admissions", label: "Admissions" },
  { to: "/academics", label: "Academics" },
  { to: "/student-life", label: "Student Life" },
  { to: "/alumni", label: "Alumni" },
  { to: "/contact", label: "Contact" },
] as const;
