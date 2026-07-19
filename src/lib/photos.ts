// Real Talents College Mukono photo library.
// Each entry maps a semantic name to a CDN-hosted asset pointer.

import p_walking from "@/assets/tcm-1783801759010.jpg";
import p_scriptureUnion from "@/assets/tcm-1783801761232.jpg";
import p_gateArrival from "@/assets/tcm-1783801765655.jpg";
import p_outdoorClass from "@/assets/tcm-1783801779309.jpg";
import p_avenue from "@/assets/tcm-1783801820283.jpg";
import p_dignitariesGroup from "@/assets/tcm-1783801884791.jpg";
import p_labChem from "@/assets/tcm-1783801886805.jpg";
import p_labWide from "@/assets/tcm-1783801889308.jpg";
import p_labWriting from "@/assets/tcm-1783801891892.jpg";
import p_labNotes from "@/assets/tcm-1783801894205.jpg";
import p_labGirls from "@/assets/tcm-1783801898825.jpg";
import p_labFlasks from "@/assets/tcm-1783801903842.jpg";
import p_labFlaskHold from "@/assets/tcm-1783801906362.jpg";
import p_labGroup from "@/assets/tcm-1783801908710.jpg";
import p_labFull from "@/assets/tcm-1783801913047.jpg";
import p_culture1 from "@/assets/tcm-1783802165210.jpg";
import p_assembly from "@/assets/tcm-1783802168094.jpg";
import p_culture2 from "@/assets/tcm-1783802170729.jpg";
import p_bus from "@/assets/tcm-1783802183702.jpg";
import p_library from "@/assets/tcm-1783802185654.jpg";
import p_dignitariesWide from "@/assets/tcm-1783802189194.jpg";
import p_leadersField from "@/assets/tcm-1783802255759.jpg";
import p_girlsPose from "@/assets/tcm-1783802258546.jpg";
import p_grassGroup from "@/assets/tcm-1783802260927.jpg";
import p_examWriting from "@/assets/tcm-1783802264338.jpg";
import p_sports from "@/assets/sports.jpg";
import p_culture from "@/assets/culture.jpg";
import p_classroom from "@/assets/classroom.jpg";
import p_scienceLab from "@/assets/science-lab.jpg";
import p_heroCampus from "@/assets/hero-campus.jpg";
import p_images1 from "@/assets/images (1).jpg";
import p_images2 from "@/assets/images (2).jpg";
import p_images3 from "@/assets/images (3).jpg";
import p_directors from "@/assets/directors.jpeg";
import p_esd1 from "@/assets/ESD_6a0b361571965.webp";
import p_esd2 from "@/assets/ESD_6a0b3616e17d0.webp";

const url = (a: string) => a;

export const photos = {
  hero: url(p_walking),
  campusAvenue: url(p_avenue),
  campusGate: url(p_gateArrival),
  scriptureUnion: url(p_scriptureUnion),
  outdoorClass: url(p_outdoorClass),
  library: url(p_library),
  examWriting: url(p_examWriting),
  labChem: url(p_labChem),
  labWide: url(p_labWide),
  labWriting: url(p_labWriting),
  labNotes: url(p_labNotes),
  labGirls: url(p_labGirls),
  labFlasks: url(p_labFlasks),
  labFlaskHold: url(p_labFlaskHold),
  labFull: url(p_labFull),
  labGroup: url(p_labGroup),
  bus: url(p_bus),
  assembly: url(p_assembly),
  dignitaries: url(p_dignitariesGroup),
  dignitariesWide: url(p_dignitariesWide),
  leadersField: url(p_leadersField),
  girlsPose: url(p_girlsPose),
  grassGroup: url(p_grassGroup),
  culture1: url(p_culture1),
  culture2: url(p_culture2),
  sports: url(p_sports),
  culture: url(p_culture),
  classroom: url(p_classroom),
  scienceLab: url(p_scienceLab),
  heroCampus: url(p_heroCampus),
  images1: url(p_images1),
  images2: url(p_images2),
  images3: url(p_images3),
  directors: url(p_directors),
  esd1: url(p_esd1),
  esd2: url(p_esd2),
} as const;

type Cat = "Campus" | "Academics" | "Sports" | "Arts" | "Events";

export const galleryPhotos: { src: string; cat: Cat; alt: string }[] = [
  {
    src: photos.hero,
    cat: "Campus",
    alt: "A' level students walking through the landscaped Talents College campus",
  },

  {
    src: photos.campusAvenue,
    cat: "Arts",
    alt: "Students during Music, Dance & Drama competitions",
  },
  {
    src: photos.campusGate,
    cat: "Campus",
    alt: "Students reporting back to school",
  },
  {
    src: photos.scriptureUnion,
    cat: "Campus",
    alt: "A' level students in the scripture union",
  },
  {
    src: photos.bus,
    cat: "Campus",
    alt: "The Talents College Mukono school bus",
  },
  {
    src: photos.library,
    cat: "Academics",
    alt: "Students studying together in the school library",
  },
  {
    src: photos.examWriting,
    cat: "Campus",
    alt: "The main campus avenue with Mukono hills in the background",
  },
  {
    src: photos.outdoorClass,
    cat: "Academics",
    alt: "A student writing during a classrom session",
  },
  {
    src: photos.labChem,
    cat: "Academics",
    alt: "Chemistry practical — student handling a volumetric pipette and a beaker",
  },
  {
    src: photos.labWide,
    cat: "Academics",
    alt: "Students working across the chemistry lab",
  },
  {
    src: photos.labGirls,
    cat: "Academics",
    alt: "Students during titration lessons in the computer lab",
  },
  {
    src: photos.labFlaskHold,
    cat: "Academics",
    alt: "Students examining a coloured solution using a volumetric flask in the laboratory",
  },
  {
    src: photos.labFull,
    cat: "Academics",
    alt: "A full chemistry class in progress",
  },
  {
    src: photos.assembly,
    cat: "Events",
    alt: "Students meeting Ow'ekitiibwa Charles Peter Mayega, the Katikiro (Prime Minister) of Buganda kingdom",
  },
  {
    src: photos.dignitaries,
    cat: "Academics",
    alt: "A full chemistry class in progress",
  },
  {
    src: photos.dignitariesWide,
    cat: "Campus",
    alt: "Morning assembly on the school grounds",
  },
  {
    src: photos.leadersField,
    cat: "Campus",
    alt: "Girls lined up infront of the school bus prior to a school trip",
  },
  {
    src: photos.girlsPose,
    cat: "Campus",
    alt: "Senior one students in our school uniform showcasing their glamour on the campus walkway",
  },
  {
    src: photos.grassGroup,
    cat: "Campus",
    alt: "Students relaxing in our school gardens",
  },
  {
    src: photos.labGroup,
    cat: "Academics",
    alt: "Girls collaborating on a chemistry experiment",
  },
  {
    src: photos.culture1,
    cat: "Events",
    alt: "Visitors greeted by staff and students during an event",
  },
  {
    src: photos.culture2,
    cat: "Academics",
    alt: "Students engaging in an environmental science activity",
  },
  {
    src: photos.sports,
    cat: "Sports",
    alt: "Student athletes competing on the Talents College sports field",
  },
  {
    src: photos.culture,
    cat: "Arts",
    alt: "Students performing in a cultural arts event",
  },
  {
    src: photos.classroom,
    cat: "Academics",
    alt: "Students in a classroom at Talents College Mukono",
  },
  {
    src: photos.scienceLab,
    cat: "Academics",
    alt: "Students in the science lab studying experiments",
  },
  {
    src: photos.heroCampus,
    cat: "Campus",
    alt: "Students walking across the Talents College campus",
  },
  {
    src: photos.images1,
    cat: "Campus",
    alt: "Senior six students posing for a photo in our school gardens",
  },
  {
    src: photos.images2,
    cat: "Campus",
    alt: "Senior six class 2025",
  },
  {
    src: photos.images3,
    cat: "Campus",
    alt: "Students coming from the Administration block",
  },
  {
    src: photos.directors,
    cat: "Events",
    alt: "School leadership at an Alumni gathering last year",
  },
  {
    src: photos.esd1,
    cat: "Academics",
    alt: "Students during a practical school session",
  },
  {
    src: photos.esd2,
    cat: "Academics",
    alt: "Senior two students posing for a picture infront of the Administration block",
  },
];
