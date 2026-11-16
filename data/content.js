// Contenu du portfolio (français, anglais, hébreu).
// Ce fichier se modifie depuis la page admin/ : inutile de l'éditer à la main.
window.PORTFOLIO = {
 "version": 2,
 "profile": {
  "name": {
   "fr": "Ethan Allouche",
   "en": "Ethan Allouche",
   "he": "איתן אלוש"
  },
  "title": {
   "fr": "Automatisme, informatique industrielle et systèmes embarqués",
   "en": "Automation, industrial computing and embedded systems",
   "he": "בקרה, מחשוב תעשייתי ומערכות משובצות"
  },
  "pitch": {
   "fr": "Je conçois, câble et programme des systèmes automatisés, du capteur jusqu'à l'interface de supervision. Formé en BUT GEII à l'IUT de Toulon, avec deux stages chez Veolia et Enedis.",
   "en": "I design, wire and program automated systems, from the sensor to the supervision interface. Trained on the GEII degree at IUT de Toulon, with two internships at Veolia and Enedis.",
   "he": "אני מתכנן, מחווט ומתכנת מערכות אוטומטיות, מהחיישן ועד ממשק הפיקוח. למדתי במסלול GEII ב־IUT טולון, ועשיתי שתי התמחויות, ב־Veolia וב־Enedis."
  },
  "status": {
   "fr": "",
   "en": "",
   "he": ""
  },
  "location": {
   "fr": "Toulon, France",
   "en": "Toulon, France",
   "he": "טולון, צרפת"
  },
  "license": {
   "fr": "Permis B",
   "en": "Full driving licence",
   "he": "רישיון נהיגה B"
  },
  "email": "ethan.allouchepro@gmail.com",
  "linkedin": "https://www.linkedin.com/in/ethan-allouche/",
  "photo": "images/ethan-allouche.jpg"
 },
 "projects": [
  {
   "id": "stage-veolia",
   "model": "drone",
   "year": "2026",
   "duration": {
    "fr": "14 semaines",
    "en": "14 weeks",
    "he": "14 שבועות"
   },
   "org": {
    "fr": "Stage chez Veolia Eau",
    "en": "Internship at Veolia Eau",
    "he": "התמחות ב־Veolia Eau"
   },
   "title": {
    "fr": "Drone flottant de cartographie d'un émissaire",
    "en": "Floating survey drone for a wastewater outfall",
    "he": "כלי צף אוטונומי למיפוי מנהרת מוצא שפכים"
   },
   "summary": {
    "fr": "Conception et intégration d'une architecture multi-capteurs sur un drone flottant autonome, pour cartographier les sédiments sur les 6,4 km de l'émissaire du Cap Sicié.",
    "en": "Designed and integrated a multi-sensor architecture on an autonomous floating drone to map sediment along the 6.4 km Cap Sicié outfall tunnel.",
    "he": "תכנון ושילוב של מערך רב־חיישני על כלי צף אוטונומי, למיפוי הסחף לאורך 6.4 ק״מ של מנהרת המוצא בקאפ סיסייה."
   },
   "tags": [
    {
     "fr": "Python",
     "en": "Python",
     "he": "Python"
    },
    {
     "fr": "Capteurs 4–20 mA",
     "en": "4–20 mA sensors",
     "he": "חיישני ‎4–20 mA"
    },
    {
     "fr": "Instrumentation",
     "en": "Instrumentation",
     "he": "מכשור"
    },
    {
     "fr": "Système embarqué",
     "en": "Embedded system",
     "he": "מערכת משובצת"
    }
   ],
   "sections": {
    "context": {
     "fr": "L'émissaire du Cap Sicié est une galerie souterraine de 6,4 kilomètres qui achemine les eaux usées de l'ouest toulonnais vers la station d'épuration d'Amphitria. Au fil du temps, des sédiments s'y accumulent : ils réduisent la capacité hydraulique et favorisent la formation de H₂S, un gaz très corrosif et toxique. L'environnement est extrême : obscurité totale, chutes d'eaux usées, humidité saturée à 100 % et forts courants d'air. L'inspection humaine y est dangereuse et coûteuse, ce qui rend le suivi de l'encrassement très complexe pour Veolia.",
     "en": "The Cap Sicié outfall is a 6.4 km underground tunnel that carries wastewater from western Toulon to the Amphitria treatment plant. Over time sediment builds up inside it, reducing hydraulic capacity and encouraging the formation of H₂S, a highly corrosive and toxic gas. The environment is extreme: total darkness, falling wastewater, 100% saturated humidity and strong air currents. Human inspection is dangerous and expensive, which makes tracking the build-up very difficult for Veolia.",
     "he": "מוצא קאפ סיסייה הוא מנהרה תת־קרקעית באורך 6.4 ק״מ, המוליכה את שפכי מערב טולון אל מתקן הטיהור Amphitria. עם הזמן מצטבר בה סחף, שמקטין את הקיבולת ההידראולית ומעודד היווצרות של H₂S, גז קורוזיבי ורעיל מאוד. הסביבה קיצונית: חשכה מוחלטת, מפלי שפכים, לחות רוויה של 100% וזרמי אוויר חזקים. בדיקה בידי אדם מסוכנת ויקרה, ולכן המעקב אחר ההצטברות מורכב מאוד עבור Veolia."
    },
    "goal": {
     "fr": "L'objectif de mon stage était de concevoir, d'améliorer et d'intégrer une architecture électronique embarquée multi-capteurs sur un drone flottant autonome. Le but principal : cartographier la bathymétrie (hauteur des sédiments) et le tirant d'air (distance jusqu'au plafond) sur l'intégralité du tunnel. Ces mesures permettent à l'entreprise de passer d'une maintenance curative à une maintenance prédictive, en ciblant précisément les zones à curer.",
     "en": "My assignment was to design, improve and integrate a multi-sensor embedded electronics architecture on an autonomous floating drone. The main goal was to map the bathymetry (sediment height) and the air draught (distance to the ceiling) along the whole tunnel. These measurements let the company move from corrective to predictive maintenance, by pinpointing the sections that need cleaning.",
     "he": "מטרת ההתמחות הייתה לתכנן, לשפר ולשלב מערך אלקטרוני משובץ רב־חיישני על כלי צף אוטונומי. היעד המרכזי: למפות את הבתימטריה (גובה הסחף) ואת מרווח האוויר (המרחק עד התקרה) לכל אורך המנהרה. המדידות האלה מאפשרות לחברה לעבור מתחזוקה מתקנת לתחזוקה חזויה, ולמקד במדויק את הקטעים שדורשים ניקוי."
    },
    "build": {
     "fr": "J'ai sélectionné et intégré des capteurs industriels : un radar Vega C22 pour le plafond, des sondes piézométriques Vega S51 pour le fond, et un enregistreur Odeon pour l'analyse physico-chimique de l'eau. J'ai mis en place des dataloggers autonomes (Lascar EL-USB-4) pour enregistrer les signaux 4–20 mA à une fréquence d'un hertz, et validé le dimensionnement énergétique pour garantir 8 h d'autonomie. Après les premiers essais en conditions réelles, j'ai fiabilisé l'ensemble du système : presse-étoupes pour une étanchéité totale des coffrets, organisation du câblage et renforcement de la structure mécanique en tubes PVC pour résister aux chutes d'eau.",
     "en": "I selected and integrated industrial sensors: a Vega C22 radar for the ceiling, Vega S51 pressure probes for the bottom, and an Odeon logger for the water's physico-chemical analysis. I set up standalone data loggers (Lascar EL-USB-4) to record the 4–20 mA signals at 1 Hz, and validated the power budget to guarantee 8 hours of autonomy. After the first tests in real conditions I made the whole system reliable: cable glands for fully watertight enclosures, tidy wiring, and a reinforced PVC-tube structure that withstands the waterfalls.",
     "he": "בחרתי ושילבתי חיישנים תעשייתיים: מכ״ם Vega C22 למדידת התקרה, חיישני לחץ Vega S51 למדידת הקרקעית, ואוגר Odeon לניתוח הפיזיקו־כימי של המים. הקמתי אוגרי נתונים עצמאיים (Lascar EL-USB-4) להקלטת אותות ‎4–20 mA בקצב של 1 הרץ, ואימתתי את תקציב האנרגיה כדי להבטיח 8 שעות פעולה. אחרי הניסויים הראשונים בתנאי אמת שיפרתי את אמינות המערכת כולה: כניסות כבל אטומות (גלנדים) לאטימות מלאה של הקופסאות, סידור החיווט וחיזוק המבנה המכני מצינורות PVC כדי שיעמוד במפלי המים."
    },
    "results": {
     "fr": "Le drone a été déployé avec succès et, pour la première fois dans l'histoire de l'ouvrage, nous avons récupéré des données continues sur la géométrie de l'émissaire ainsi qu'une vidéo à 360°. J'ai traité ces données avec un script Python développé sur mesure pour modéliser le niveau d'eau. La hauteur sous plafond étant une constante connue de l'infrastructure, les calculs ont permis de déduire précisément les variations du niveau du plancher causées par l'accumulation de sédiments. Les courbes obtenues ont localisé avec exactitude les amas problématiques.",
     "en": "The drone was deployed successfully and, for the first time in the structure's history, we brought back continuous data on the outfall's geometry together with 360° video. I processed the data with a custom Python script to model the water level. Because the tunnel's ceiling height is a fixed, known constant, the calculations gave the variations of the floor level caused by sediment build-up. The resulting curves located the problem deposits precisely.",
     "he": "הכלי הופעל בהצלחה, ולראשונה בתולדות המתקן חזרנו עם נתונים רציפים על הגיאומטריה של המוצא ועם צילום וידאו ב־360 מעלות. עיבדתי את הנתונים בסקריפט Python שפיתחתי במיוחד, כדי למדל את מפלס המים. מאחר שגובה התקרה במנהרה קבוע וידוע, החישובים אפשרו לגזור במדויק את השינויים בגובה הרצפה שנגרמים מהצטברות הסחף. העקומות שהתקבלו איתרו בדיוק את מוקדי ההצטברות הבעייתיים."
    },
    "review": {
     "fr": "Ce projet m'a permis de prendre de réelles responsabilités techniques dans un contexte industriel exigeant. J'ai gagné en autonomie dans la résolution de problèmes complexes sur le terrain et renforcé mes compétences en électricité, en instrumentation et en traitement de la donnée. J'ai aussi préparé la suite du projet en dimensionnant une future architecture basée sur un calculateur embarqué NVIDIA Jetson, couplé à un lidar et à un sonar multifaisceaux.",
     "en": "This project gave me real technical responsibility in a demanding industrial setting. I became much more autonomous at solving complex problems in the field, and strengthened my skills across electricity, instrumentation and data processing. I also prepared the project's next phase by sizing a future architecture built around an NVIDIA Jetson embedded computer, paired with a lidar and a multibeam sonar.",
     "he": "הפרויקט נתן לי אחריות טכנית אמיתית בסביבה תעשייתית תובענית. פיתחתי עצמאות רבה בפתרון בעיות מורכבות בשטח, וחיזקתי את היכולות שלי בחשמל, במכשור ובעיבוד נתונים. הכנתי גם את השלב הבא של הפרויקט: תכנון ארכיטקטורה עתידית המבוססת על מחשב משובץ NVIDIA Jetson, בשילוב לידאר וסונאר רב־אלומות."
    }
   },
   "media": [
    {
     "src": "images/stage-veolia-1.mp4",
     "poster": "images/stage-veolia-1.jpg",
     "caption": {
      "fr": "",
      "en": "",
      "he": ""
     }
    },
    {
     "src": "images/stage-veolia-2.jpg",
     "caption": {
      "fr": "Schéma de positionnement des éléments du drone",
      "en": "Layout of the drone's components",
      "he": "תרשים מיקום רכיבי הכלי"
     }
    },
    {
     "src": "images/stage-veolia-3.mp4",
     "poster": "images/stage-veolia-3.jpg",
     "caption": {
      "fr": "Vidéo enregistrée à l'intérieur de l'émissaire",
      "en": "Video recorded inside the outfall",
      "he": "צילום וידאו מתוך המוצא"
     }
    }
   ],
   "pdf": "projects/stage-veolia.pdf",
   "featured": true
  },
  {
   "id": "station-epuration",
   "model": "station",
   "year": "2025",
   "duration": {
    "fr": "150 heures",
    "en": "150 hours",
    "he": "150 שעות"
   },
   "org": {
    "fr": "Projet à l'IUT de Toulon",
    "en": "Project at IUT de Toulon",
    "he": "פרויקט ב־IUT טולון"
   },
   "title": {
    "fr": "Station d'épuration automatisée",
    "en": "Automated wastewater treatment plant",
    "he": "מתקן טיהור שפכים אוטומטי"
   },
   "summary": {
    "fr": "Conception, câblage et automatisation d'une maquette de station d'épuration capable de traiter plus de 200 L d'eau, pilotée par automates Schneider et variateurs en Modbus.",
    "en": "Designed, wired and automated a scale model of a treatment plant that handles over 200 L of water, driven by Schneider PLCs and variable speed drives over Modbus.",
    "he": "תכנון, חיווט ואוטומציה של דגם מתקן טיהור המטפל ביותר מ־200 ליטר מים, בשליטת בקרי Schneider וממירי תדר בתקשורת Modbus."
   },
   "tags": [
    {
     "fr": "Control Expert",
     "en": "Control Expert",
     "he": "Control Expert"
    },
    {
     "fr": "Modbus",
     "en": "Modbus",
     "he": "Modbus"
    },
    {
     "fr": "Variateurs de vitesse",
     "en": "Variable speed drives",
     "he": "ממירי תדר"
    },
    {
     "fr": "Câblage d'armoire",
     "en": "Cabinet wiring",
     "he": "חיווט לוחות"
    }
   ],
   "sections": {
    "context": {
     "fr": "Projet réalisé dans le cadre de la SAÉ 5.01 « Installer / Intégrer » au département GEII de l'IUT de Toulon. Il s'agit d'un projet industriel visant à concevoir, câbler et programmer une maquette simulant le fonctionnement d'une station d'épuration, centrée sur les parties pompage et dégrillage.",
     "en": "Carried out for the SAÉ 5.01 “Install / Integrate” module in the GEII department of IUT de Toulon. An industrial project to design, wire and program a model that simulates a wastewater treatment plant, focused on the pumping and screening stages.",
     "he": "הפרויקט בוצע במסגרת קורס SAÉ 5.01 ״התקנה ושילוב״ במחלקת GEII של IUT טולון. זהו פרויקט תעשייתי שמטרתו לתכנן, לחווט ולתכנת דגם המדמה פעולת מתקן טיהור שפכים, בדגש על שלבי השאיבה והסינון הגס."
    },
    "goal": {
     "fr": "L'objectif est de réaliser une installation automatisée simulant le traitement des eaux usées, en respectant des exigences industrielles strictes. Le système doit gérer la puissance en pilotant des moteurs asynchrones par des variateurs de vitesse, et assurer l'automatisme global pour les cycles en modes automatique et manuel. Le projet impose aussi un réseau Modbus pour l'échange de données entre l'automate et les variateurs, ainsi que l'intégration complète : câblage de l'armoire électrique et mise en service des capteurs et des actionneurs.",
     "en": "The goal is an automated installation that simulates wastewater treatment while meeting strict industrial requirements. The system has to handle power by driving asynchronous motors through variable speed drives, and run the overall control logic for automatic and manual cycles. The project also requires a Modbus network for data exchange between the PLC and the drives, and full integration: wiring the electrical cabinet and commissioning the sensors and actuators.",
     "he": "המטרה היא מתקן אוטומטי שמדמה טיפול בשפכים ועומד בדרישות תעשייתיות מחמירות. המערכת צריכה לנהל את ההספק באמצעות הפעלת מנועים אסינכרוניים דרך ממירי תדר, ולהריץ את לוגיקת הבקרה הכוללת במצב אוטומטי ובמצב ידני. הפרויקט דורש גם רשת Modbus להחלפת נתונים בין הבקר לממירים, ושילוב מלא: חיווט לוח החשמל והפעלה ראשונית של החיישנים והמפעילים."
    },
    "build": {
     "fr": "Le projet repose sur des technologies standard de la gamme Schneider Electric. L'installation matérielle a demandé le câblage intégral des parties opérative et commande : raccordement des variateurs de vitesse et des moteurs, intégration des capteurs de niveau. La programmation a été réalisée sous EcoStruxure Control Expert pour gérer les séquences de démarrage et les sécurités du processus. Une communication Modbus a été configurée pour piloter les variateurs à distance : paramétrage des adresses IP, gestion des requêtes de lecture et d'écriture, et mapping des registres qui commandent la vitesse et le sens de rotation.",
     "en": "The project relies on standard Schneider Electric technology. The hardware installation meant wiring the entire process and control sections: connecting the drives and motors and integrating the level sensors. Programming was done in EcoStruxure Control Expert to handle the start-up sequences and the process safeties. A Modbus link was configured to control the drives remotely: setting IP addresses, handling read and write requests, and mapping the registers that control speed and direction of rotation.",
     "he": "הפרויקט מבוסס על טכנולוגיות סטנדרטיות של Schneider Electric. התקנת החומרה כללה חיווט מלא של חלקי התהליך והפיקוד: חיבור ממירי התדר והמנועים ושילוב חיישני המפלס. התכנות נעשה ב־EcoStruxure Control Expert, לניהול רצפי ההתנעה והגנות התהליך. הוגדרה תקשורת Modbus לשליטה מרחוק בממירים: הגדרת כתובות IP, ניהול בקשות קריאה וכתיבה, ומיפוי האוגרים ששולטים במהירות ובכיוון הסיבוב."
    },
    "results": {
     "fr": "La mise en service a validé le fonctionnement global de la station. Les variateurs règlent avec précision la vitesse des moteurs de pompage et de dégrillage selon les consignes de l'automate, et le réseau Modbus assure une remontée d'informations stable et réactive. Le système bascule correctement entre le mode manuel, réservé à la maintenance, et le mode automatique pour le cycle continu ; toutes les sécurités arrêtent l'installation en cas de défaut simulé.",
     "en": "Commissioning validated the plant's overall operation. The drives control the speed of the pumping and screening motors precisely, following the setpoints sent by the PLC, while the Modbus network provides stable, responsive feedback. The system switches correctly between manual mode, used for maintenance, and automatic mode for the continuous cycle, and every safety stops the installation when a fault is simulated.",
     "he": "ההפעלה הראשונית אימתה את פעולת המתקן כולו. ממירי התדר שולטים בדיוק במהירות מנועי השאיבה והסינון לפי ערכי היעד שהבקר שולח, ורשת ה־Modbus מספקת תקשורת יציבה ומהירה להחזרת המידע. המערכת עוברת כנדרש בין מצב ידני, המיועד לתחזוקה, למצב אוטומטי למחזור רציף, וכל ההגנות עוצרות את המתקן בעת תקלה מדומה."
    },
    "review": {
     "fr": "Cette SAÉ m'a fait passer de la théorie à la pratique sur du matériel industriel réel, en validant des compétences clés en électrotechnique comme la lecture de schémas et le câblage d'armoire. Elle a aussi renforcé ma maîtrise de l'automatisme avancé grâce aux réseaux de terrain Modbus. Diagnostiquer et résoudre de vraies pannes de câblage ou de communication a nettement développé l'autonomie et la rigueur technique indispensables en milieu professionnel.",
     "en": "This project took me from theory to practice on real industrial equipment, and confirmed key electrical skills such as reading schematics and wiring a cabinet. It also strengthened my command of advanced automation through Modbus fieldbus networks. Diagnosing and fixing real wiring and communication faults built the autonomy and technical rigour that professional work demands.",
     "he": "הפרויקט העביר אותי מהתיאוריה למעשה על ציוד תעשייתי אמיתי, וביסס מיומנויות מפתח באלקטרוטכניקה כמו קריאת שרטוטים וחיווט לוחות. הוא גם חיזק את השליטה שלי בבקרה מתקדמת באמצעות רשתות שדה מסוג Modbus. אבחון ותיקון של תקלות חיווט ותקשורת אמיתיות פיתחו את העצמאות ואת ההקפדה הטכנית שנדרשות בעולם המקצועי."
    }
   },
   "media": [
    {
     "src": "images/station-epuration-1.mp4",
     "poster": "images/station-epuration-1.jpg",
     "caption": {
      "fr": "Maquette de la station d'épuration",
      "en": "The treatment plant model",
      "he": "דגם מתקן הטיהור"
     }
    },
    {
     "src": "images/station-epuration-2.jpg",
     "caption": {
      "fr": "Schéma de fonctionnement de la station",
      "en": "How the plant works",
      "he": "תרשים פעולת המתקן"
     }
    },
    {
     "src": "images/station-epuration-3.jpg",
     "caption": {
      "fr": "Configuration de la communication Modbus sous Control Expert",
      "en": "Modbus communication set up in Control Expert",
      "he": "הגדרת תקשורת Modbus ב־Control Expert"
     }
    }
   ],
   "pdf": "projects/station-epuration.pdf",
   "featured": true
  },
  {
   "id": "systeme-arrosage",
   "model": "arrosage",
   "year": "2025",
   "duration": {
    "fr": "120 heures",
    "en": "120 hours",
    "he": "120 שעות"
   },
   "org": {
    "fr": "Projet à l'IUT de Toulon",
    "en": "Project at IUT de Toulon",
    "he": "פרויקט ב־IUT טולון"
   },
   "title": {
    "fr": "Système d'arrosage automatisé",
    "en": "Automated plant watering system",
    "he": "מערכת השקיה אוטומטית"
   },
   "summary": {
    "fr": "Pilotage et supervision d'un système hydroponique : dosage des nutriments par moteurs pas à pas, automate WAGO, Modbus RS485 et interface de commande.",
    "en": "Control and supervision of a hydroponic system: nutrient dosing with stepper motors, a WAGO PLC, Modbus RS485 and an operator interface.",
    "he": "בקרה ופיקוח על מערכת הידרופונית: מינון חומרי הזנה במנועי צעד, בקר WAGO, תקשורת Modbus RS485 וממשק הפעלה."
   },
   "tags": [
    {
     "fr": "CodeSys",
     "en": "CodeSys",
     "he": "CodeSys"
    },
    {
     "fr": "WAGO",
     "en": "WAGO",
     "he": "WAGO"
    },
    {
     "fr": "Modbus RS485",
     "en": "Modbus RS485",
     "he": "Modbus RS485"
    },
    {
     "fr": "Moteurs pas à pas",
     "en": "Stepper motors",
     "he": "מנועי צעד"
    }
   ],
   "sections": {
    "context": {
     "fr": "Projet réalisé dans le cadre de la SAÉ 3.01 au département GEII de l'IUT de Toulon. Il porte sur la conception, la supervision et le contrôle d'un système hydroponique d'arrosage de plantes automatisé.",
     "en": "Carried out for the SAÉ 3.01 module in the GEII department of IUT de Toulon. It covers the design, supervision and control of an automated hydroponic watering system.",
     "he": "הפרויקט בוצע במסגרת קורס SAÉ 3.01 במחלקת GEII של IUT טולון, ועוסק בתכנון, בפיקוח ובבקרה של מערכת הידרופונית אוטומטית להשקיית צמחים."
    },
    "goal": {
     "fr": "L'objectif est de piloter un système complet de gestion de fluides pour l'agriculture. Le système doit :\n\n1. Commander les actionneurs : deux pompes simulées par des moteurs pas à pas, un mélangeur et des électrovannes.\n2. Gérer les dosages : contrôler précisément la quantité d'eau, de 10 L à 2 000 L, et le dosage des nutriments.\n3. Moduler la vitesse : proposer trois modes de vitesse pour les pompes.\n4. Assurer la supervision : offrir une interface homme-machine pour visualiser l'état du système et agir sur les commandes.",
     "en": "The goal is to control a complete fluid-management system for agriculture. The system must:\n\n1. Drive the actuators: two pumps simulated by stepper motors, a mixer and solenoid valves.\n2. Manage dosing: control the water quantity precisely, from 10 L to 2,000 L, and the nutrient dose.\n3. Vary the speed: offer three speed modes for the pumps.\n4. Provide supervision: an operator interface that shows the system state and gives access to the controls.",
     "he": "המטרה היא לשלוט במערכת מלאה לניהול נוזלים לחקלאות. המערכת נדרשת:\n\n1. להפעיל את המפעילים: שתי משאבות המדומות במנועי צעד, מערבל ושסתומי סולנואיד.\n2. לנהל את המינון: לשלוט בדיוק בכמות המים, מ־10 עד 2,000 ליטר, ובמינון חומרי ההזנה.\n3. לשנות מהירות: להציע שלושה מצבי מהירות למשאבות.\n4. לספק פיקוח: ממשק אדם־מכונה שמציג את מצב המערכת ומאפשר לפעול על הפקדים."
    },
    "build": {
     "fr": "Le système repose sur une architecture matérielle et logicielle précise.\n\n1. Matériel et communication : un automate WAGO TP 762 relié à deux drivers EM2RS556 par Ethernet et par une liaison série RS485 Modbus. Deux moteurs pas à pas simulent les pompes à nutriments, avec une précision de 200 pas par tour.\n\n2. Programmation CodeSys et MotionStudio : le pilotage est assuré sous CodeSys. Les profils de vitesse sont configurés dans MotionStudio et appelés par des requêtes Modbus à l'adresse 0x6002. Un algorithme calcule automatiquement le temps d'activation des pompes selon le dosage, la quantité et la vitesse choisie.\n\n3. Interface de supervision : une interface visuelle complète permet de sélectionner les modes, de régler les dosages avec des potentiomètres numériques et de suivre les cycles en temps réel.",
     "en": "The system is built on a precise hardware and software architecture.\n\n1. Hardware and communication: a WAGO TP 762 PLC connected to two EM2RS556 drivers over Ethernet and an RS485 Modbus serial link. Two stepper motors simulate the nutrient pumps with a resolution of 200 steps per revolution.\n\n2. CodeSys and MotionStudio programming: the control runs in CodeSys. Speed profiles are configured in MotionStudio and called through Modbus requests at address 0x6002. An algorithm automatically computes how long each pump runs from the dose, the quantity and the selected speed.\n\n3. Supervision interface: a complete visual interface for selecting modes, setting doses with digital potentiometers and following the cycles in real time.",
     "he": "המערכת בנויה על ארכיטקטורת חומרה ותוכנה מדויקת.\n\n1. חומרה ותקשורת: בקר WAGO TP 762 מחובר לשני דרייברים EM2RS556 ב־Ethernet ובקו טורי RS485 בפרוטוקול Modbus. שני מנועי צעד מדמים את משאבות חומרי ההזנה ברזולוציה של 200 צעדים לסיבוב.\n\n2. תכנות ב־CodeSys וב־MotionStudio: הבקרה רצה ב־CodeSys. פרופילי המהירות מוגדרים ב־MotionStudio ונקראים בבקשות Modbus לכתובת 0x6002. אלגוריתם מחשב אוטומטית את זמן ההפעלה של כל משאבה לפי המינון, הכמות והמהירות שנבחרה.\n\n3. ממשק פיקוח: ממשק חזותי מלא לבחירת מצבים, לכיוון המינונים בפוטנציומטרים דיגיטליים ולמעקב אחר המחזורים בזמן אמת."
    },
    "results": {
     "fr": "Le projet a abouti à un système fonctionnel, piloté par une interface complète.\n\n1. Contrôle global et individuel : l'interface offre une commande générale pour la vitesse et la quantité de mélange, et une commande propre à chaque pompe pour le dosage et le temps.\n2. Synchronisation : le programme gère les deux pompes en parallèle et ne démarre le mélange que lorsque les deux ont terminé leur dosage.\n3. Visualisation en temps réel : l'utilisateur suit en direct le temps restant pour chaque action et le volume dosé.",
     "en": "The project produced a working system driven by a complete interface.\n\n1. Global and individual control: the interface has a general command for speed and mix quantity, and a dedicated command for each pump's dose and run time.\n2. Synchronisation: the program runs both pumps in parallel and only starts mixing once both have finished dosing.\n3. Real-time display: the user sees the time remaining for each action and the volume dosed, live.",
     "he": "התוצאה היא מערכת פועלת הנשלטת מממשק מלא.\n\n1. שליטה כללית ופרטנית: הממשק כולל פקודה כללית למהירות ולכמות התערובת, ופקודה נפרדת לכל משאבה למינון ולזמן ההפעלה.\n2. סנכרון: התוכנה מפעילה את שתי המשאבות במקביל ומתחילה בערבוב רק כששתיהן סיימו את המינון.\n3. תצוגה בזמן אמת: המשתמש רואה בזמן אמת את הזמן שנותר לכל פעולה ואת הנפח שנמדד."
    },
    "review": {
     "fr": "Ce projet a validé mes compétences en conception et en intégration de systèmes automatisés complexes. Il a demandé la prise en main de nouveaux outils logiciels, comme MotionStudio, et de protocoles de communication industriels. La résolution des problèmes de câblage et de programmation a renforcé l'esprit d'équipe et ma capacité à maintenir un système technique.",
     "en": "This project confirmed my skills in designing and integrating complex automated systems. It required learning new software tools such as MotionStudio and working with industrial communication protocols. Solving the wiring and programming problems strengthened our teamwork and my ability to maintain a technical system.",
     "he": "הפרויקט ביסס את היכולות שלי בתכנון ובשילוב של מערכות אוטומטיות מורכבות. הוא דרש לימוד של כלי תוכנה חדשים כמו MotionStudio ועבודה עם פרוטוקולי תקשורת תעשייתיים. פתרון בעיות החיווט והתכנות חיזק את עבודת הצוות ואת היכולת שלי לתחזק מערכת טכנית."
    }
   },
   "media": [
    {
     "src": "images/systeme-arrosage-1.jpg",
     "caption": {
      "fr": "Automate WAGO et câblage du système",
      "en": "The WAGO PLC and the system's wiring",
      "he": "בקר WAGO וחיווט המערכת"
     }
    },
    {
     "src": "images/systeme-arrosage-2.jpg",
     "caption": {
      "fr": "Schéma de fonctionnement du système",
      "en": "How the system works",
      "he": "תרשים פעולת המערכת"
     }
    },
    {
     "src": "images/systeme-arrosage-3.jpg",
     "caption": {
      "fr": "Interface de visualisation du système",
      "en": "The system's operator interface",
      "he": "ממשק התצוגה של המערכת"
     }
    }
   ],
   "pdf": "projects/systeme-arrosage.pdf",
   "featured": false
  },
  {
   "id": "stage-enedis",
   "model": "reseau",
   "year": "2025",
   "duration": {
    "fr": "8 semaines",
    "en": "8 weeks",
    "he": "8 שבועות"
   },
   "org": {
    "fr": "Stage chez Enedis",
    "en": "Internship at Enedis",
    "he": "התמחות ב־Enedis"
   },
   "title": {
    "fr": "Supervision du réseau électrique",
    "en": "Power grid supervision",
    "he": "פיקוח על רשת החשמל"
   },
   "summary": {
    "fr": "Supervision du réseau de distribution à l'agence ASGARD de Toulon : gestion des accès, suivi des dépannages et validation des préparations de chantiers.",
    "en": "Distribution grid supervision at the ASGARD agency in Toulon: access management, outage follow-up and validation of worksite preparations.",
    "he": "פיקוח על רשת החלוקה בסוכנות ASGARD בטולון: ניהול גישות לרשת, מעקב אחר תיקון תקלות ואישור הכנות לעבודות."
   },
   "tags": [
    {
     "fr": "Réseaux HTA et BT",
     "en": "MV and LV networks",
     "he": "רשתות מתח גבוה ונמוך"
    },
    {
     "fr": "Supervision",
     "en": "Supervision",
     "he": "פיקוח"
    },
    {
     "fr": "Sécurité électrique",
     "en": "Electrical safety",
     "he": "בטיחות בחשמל"
    }
   ],
   "sections": {
    "context": {
     "fr": "Au semestre 4 de ma deuxième année de BUT GEII, j'ai réalisé un stage de 8 semaines chez Enedis, le gestionnaire du réseau de distribution d'électricité en France. J'ai intégré l'agence ASGARD (Agence de Supervision et de Gestion des Accès au Réseau de Distribution) à Toulon. Opérationnelle 24 h/24, cette agence est la tour de contrôle qui garantit la sécurité des interventions et la continuité de la fourniture d'électricité sur le réseau régional.",
     "en": "During the fourth semester of my second year, I completed an 8-week internship at Enedis, the operator of France's electricity distribution grid. I joined the ASGARD agency (supervision and access management for the distribution grid) in Toulon. Running around the clock, the agency is the control tower that keeps interventions safe and the regional power supply continuous.",
     "he": "בסמסטר הרביעי, בשנה השנייה של התואר, עשיתי התמחות של 8 שבועות ב־Enedis, מפעילת רשת חלוקת החשמל בצרפת. השתלבתי בסוכנות ASGARD (פיקוח וניהול גישות לרשת החלוקה) בטולון. הסוכנות פועלת 24 שעות ביממה ומשמשת מגדל פיקוח שמבטיח את בטיחות העבודות ואת רציפות אספקת החשמל ברשת האזורית."
    },
    "goal": {
     "fr": "L'objectif était de comprendre le maintien du bon acheminement de l'électricité et d'y participer activement, tout en assurant la sécurité des biens et des personnes. Les missions se répartissaient en deux axes :\n\nLa gestion des accès (GDA) : vérifier et valider les demandes de travaux pour s'assurer qu'elles respectent les normes de sécurité avant toute intervention sur le réseau.\n\nLa gestion des dépannages (GDD) : superviser les incidents en temps réel et coordonner les équipes d'intervention pour rétablir le courant au plus vite chez les clients.",
     "en": "The goal was to understand and take an active part in keeping electricity flowing while protecting people and property. The work had two sides:\n\nAccess management (GDA): checking and validating work requests to make sure they meet safety standards before any intervention on the grid.\n\nOutage management (GDD): supervising incidents in real time and coordinating field crews to restore power to customers as fast as possible.",
     "he": "המטרה הייתה להבין את העבודה ולקחת חלק פעיל בשמירה על אספקת חשמל תקינה, תוך הבטחת בטיחות האנשים והרכוש. המשימות התחלקו לשני תחומים:\n\nניהול גישות (GDA): בדיקה ואישור של בקשות לעבודות, כדי לוודא שהן עומדות בתקני הבטיחות לפני כל התערבות ברשת.\n\nניהול תקלות (GDD): פיקוח על אירועים בזמן אמת ותיאום צוותי השטח כדי להחזיר את החשמל ללקוחות מהר ככל האפשר."
    },
    "build": {
     "fr": "J'ai été formé aux outils métiers d'Enedis (Mercator, Olympe et les logiciels internes de gestion) et j'ai travaillé en binôme sur des missions concrètes.\n\nPréparation et validation des travaux : j'ai participé à la création et à la vérification des DMEO (dossiers de mise en exploitation de l'ouvrage). Il s'agissait de contrôler la conformité des dossiers techniques envoyés par les prestataires, notamment pour les raccordements de coffrets individuels (CIBE) et les extensions de réseau (REMBT). Chaque détail (photos, schémas, normes) devait être validé avant d'autoriser la mise sous tension.\n\nSupervision et dépannage : j'ai assisté les gestionnaires dans le pilotage des incidents sur les réseaux HTA et BT :\n\n1. Analyse des pannes signalées par les compteurs Linky ou par les appels des clients.\n2. Envoi et guidage des techniciens sur le terrain pour localiser les défauts.\n3. Manœuvres à distance, par des interrupteurs aériens télécommandés, pour isoler les tronçons en défaut et réalimenter les clients.",
     "en": "I was trained on Enedis's business tools (Mercator, Olympe and the in-house management software) and worked in a pair on real assignments.\n\nPreparing and validating works: I helped create and check DMEO files (commissioning files for new installations). This meant checking the compliance of technical files sent by contractors, in particular for individual service connections (CIBE) and low-voltage network extensions (REMBT). Every detail (photos, drawings, standards) had to be validated before energising was authorised.\n\nSupervision and outage handling: I assisted the operators in managing incidents on the medium- and low-voltage networks:\n\n1. Analysing outages reported by Linky smart meters or customer calls.\n2. Dispatching and guiding field technicians to locate faults.\n3. Remote switching, using remote-controlled overhead switches, to isolate faulty sections and resupply customers.",
     "he": "הוכשרתי על כלי העבודה של Enedis (Mercator, Olympe ותוכנות הניהול הפנימיות) ועבדתי בצמד על משימות אמיתיות.\n\nהכנה ואישור של עבודות: השתתפתי ביצירה ובבדיקה של תיקי DMEO (תיקי הכנסה לשירות של מתקן). העבודה כללה בדיקת תאימות של התיקים הטכניים ששלחו הקבלנים, בעיקר לחיבורי ארונות פרטיים (CIBE) ולהרחבות רשת במתח נמוך (REMBT). כל פרט (תמונות, שרטוטים, תקנים) נבדק לפני מתן אישור לחיבור למתח.\n\nפיקוח ותיקון תקלות: סייעתי למפעילים בניהול אירועים ברשתות המתח הגבוה והמתח הנמוך:\n\n1. ניתוח תקלות שדווחו על ידי מוני Linky החכמים או בפניות לקוחות.\n2. שיגור והכוונה של טכנאים בשטח לאיתור התקלות.\n3. מיתוג מרחוק, באמצעות מנתקים עיליים נשלטים, כדי לבודד קטעים תקולים ולהחזיר אספקה ללקוחות."
    },
    "results": {
     "fr": "Ce stage m'a fait appréhender la complexité d'un réseau de distribution à grande échelle et contribuer concrètement à la sécurité des interventions. J'ai participé à la validation de nombreux dossiers d'accès (DMEO), garants de la conformité technique des travaux. Mon implication dans la chaîne de décision lors des incidents a aidé à accélérer le rétablissement du courant et à réduire l'impact des pannes pour les clients. J'ai aussi acquis une maîtrise opérationnelle des outils de cartographie et de gestion d'incidents, et montré ma capacité à travailler avec rigueur sous pression.",
     "en": "The internship showed me the complexity of a large-scale distribution grid and let me contribute directly to safe interventions. I took part in validating many access files (DMEO), ensuring the works were technically compliant. Being involved in the decision chain during incidents helped speed up power restoration and reduce the impact of outages on customers. I also became operational on the mapping and incident-management tools, and showed I can work rigorously under pressure.",
     "he": "ההתמחות חשפה אותי למורכבות של רשת חלוקה בקנה מידה גדול ואפשרה לי לתרום ישירות לבטיחות העבודות. השתתפתי באישור של תיקי גישה רבים (DMEO), כדי להבטיח את התאימות הטכנית של העבודות. המעורבות שלי בשרשרת קבלת ההחלטות בזמן אירועים סייעה לקצר את זמן החזרת החשמל ולצמצם את ההשפעה על הלקוחות. רכשתי גם שליטה מעשית בכלי המיפוי וניהול האירועים, והוכחתי שאני יודע לעבוד בקפדנות תחת לחץ."
    },
    "review": {
     "fr": "Cette expérience a été une étape clé de mon parcours. Elle m'a apporté de la maturité en me confrontant aux exigences de sécurité et de réactivité d'une grande entreprise de service public. Elle m'a aussi confirmé que l'automatisme et l'informatique industrielle me passionnent davantage que l'électrotechnique pure, tout en restant une expérience humaine et technique très enrichissante pour comprendre le monde de l'énergie.",
     "en": "This was a key step in my path. It made me more mature by confronting me with the safety and responsiveness standards of a major public-service company. It also confirmed that automation and industrial computing appeal to me more than pure power engineering, while remaining a rich human and technical experience for understanding the energy sector.",
     "he": "ההתנסות הזאת הייתה שלב מפתח במסלול שלי. היא בגרה אותי מקצועית, כי פגשתי את דרישות הבטיחות והתגובה המהירה של חברת שירות ציבורי גדולה. ההתמחות גם חידדה לי שבקרה ומחשוב תעשייתי מושכים אותי יותר מהנדסת חשמל טהורה, ועדיין הייתה התנסות אנושית וטכנית עשירה מאוד להבנת עולם האנרגיה."
    }
   },
   "media": [
    {
     "src": "images/stage-enedis-1.jpg",
     "caption": {
      "fr": "",
      "en": "",
      "he": ""
     },
     "whole": true
    },
    {
     "src": "images/stage-enedis-2.jpg",
     "caption": {
      "fr": "Cartographie des travaux sur la ligne HTA dans le logiciel LEIA",
      "en": "Works map for the medium-voltage line in the LEIA software",
      "he": "מפת העבודות על קו המתח הגבוה בתוכנת LEIA"
     }
    },
    {
     "src": "images/stage-enedis-3.jpg",
     "caption": {
      "fr": "Poste endommagé à la suite d'un éboulement",
      "en": "Substation damaged by a landslide",
      "he": "תחנת השנאה שניזוקה ממפולת"
     }
    }
   ],
   "pdf": "projects/stage-enedis.pdf",
   "featured": false
  },
  {
   "id": "emetteur-recepteur-sonore",
   "model": "sonore",
   "year": "2024",
   "duration": {
    "fr": "45 heures",
    "en": "45 hours",
    "he": "45 שעות"
   },
   "org": {
    "fr": "Projet à l'IUT de Toulon",
    "en": "Project at IUT de Toulon",
    "he": "פרויקט ב־IUT טולון"
   },
   "title": {
    "fr": "Émetteur sonore sélectif à 7 800 Hz",
    "en": "Selective 7,800 Hz sound transmitter",
    "he": "משדר קולי סלקטיבי ב־7,800 הרץ"
   },
   "summary": {
    "fr": "Conception d'un émetteur sonore sélectif qui allume un robot à distance : astable, filtre passe-bas du 2ᵉ ordre et amplificateur.",
    "en": "Designed a selective sound transmitter that switches a robot on remotely: astable oscillator, second-order low-pass filter and amplifier.",
    "he": "תכנון משדר קולי סלקטיבי שמדליק רובוט מרחוק: מתנד א־יציב, מסנן מעביר נמוכים מסדר שני ומגבר."
   },
   "tags": [
    {
     "fr": "Électronique analogique",
     "en": "Analogue electronics",
     "he": "אלקטרוניקה אנלוגית"
    },
    {
     "fr": "Filtrage",
     "en": "Filtering",
     "he": "סינון אותות"
    },
    {
     "fr": "Oscilloscope",
     "en": "Oscilloscope",
     "he": "אוסצילוסקופ"
    }
   ],
   "sections": {
    "context": {
     "fr": "Projet réalisé dans le cadre de la SAÉ 2.02 « Vérifier » au département GEII de l'IUT de Toulon. L'étude porte sur la conception d'une télécommande sonore destinée à allumer et éteindre un robot détecteur d'obstacles. Le travail se concentre sur la partie émettrice du système.",
     "en": "Carried out for the SAÉ 2.02 “Verify” module in the GEII department of IUT de Toulon. The study covers the design of a sound remote control that switches an obstacle-detecting robot on and off. The work focuses on the transmitter side.",
     "he": "הפרויקט בוצע במסגרת קורס SAÉ 2.02 ״אימות״ במחלקת GEII של IUT טולון. העבודה עוסקת בתכנון שלט קולי להדלקה ולכיבוי של רובוט מזהה מכשולים, ומתמקדת בצד המשדר של המערכת."
    },
    "goal": {
     "fr": "Le cahier des charges fixe quatre exigences :\n\nFréquence précise : le robot doit réagir spécifiquement à une fréquence de 7 800 Hz.\n\nFiabilité : le signal doit être émis pendant au moins 2 secondes pour être validé.\n\nSélectivité : l'appareil ne doit réagir ni aux bruits ambiants ni aux fréquences des autres robots.\n\nPortée : le signal doit rester efficace jusqu'à 3 mètres.",
     "en": "The specification sets four requirements:\n\nPrecise frequency: the robot must respond specifically to 7,800 Hz.\n\nReliability: the signal must be emitted for at least 2 seconds to be accepted.\n\nSelectivity: the device must not react to ambient noise or to the frequencies of other robots.\n\nRange: the signal must stay effective up to 3 metres.",
     "he": "המפרט מגדיר ארבע דרישות:\n\nתדר מדויק: הרובוט צריך להגיב רק לתדר של 7,800 הרץ.\n\nאמינות: האות חייב להישמע לפחות 2 שניות כדי להתקבל.\n\nסלקטיביות: המכשיר לא יגיב לרעשי סביבה או לתדרים של רובוטים אחרים.\n\nטווח: האות צריך להיות יעיל עד מרחק של 3 מטרים."
    },
    "build": {
     "fr": "Le système se compose de trois blocs fonctionnels.\n\n1. Génération du signal (astable) : un montage astable génère le signal de base à 7 800 Hz. La résistance théorique de 5 835 Ω est obtenue avec une résistance de 5 600 Ω en série avec un potentiomètre de 470 Ω, pour un réglage fin. Un montage suiveur et un pont diviseur fournissent une tension de référence de 2,5 V.\n\n2. Filtrage (passe-bas) : un filtre passe-bas du 2ᵉ ordre transforme le signal triangulaire en sinusoïde. Les composants calculés (R = 855 Ω et C2 = 57 nF) atténuent fortement les harmoniques indésirables.\n\n3. Amplification : un amplificateur de puissance LM4818 convertit le signal filtré en ondes sonores par un haut-parleur. L'émission est commandée par un bouton-poussoir.",
     "en": "The system is made of three functional blocks.\n\n1. Signal generation (astable): an astable circuit generates the base signal at 7,800 Hz. The theoretical resistance of 5,835 Ω is obtained with a 5,600 Ω resistor in series with a 470 Ω potentiometer for fine tuning. A voltage follower and a divider bridge provide a 2.5 V reference.\n\n2. Filtering (low-pass): a second-order low-pass filter turns the triangular signal into a sine wave. The calculated components (R = 855 Ω and C2 = 57 nF) strongly attenuate the unwanted harmonics.\n\n3. Amplification: an LM4818 power amplifier converts the filtered signal into sound through a loudspeaker. Emission is triggered by a push button.",
     "he": "המערכת בנויה משלושה בלוקים פונקציונליים.\n\n1. יצירת האות (מתנד א־יציב): מעגל א־יציב מייצר את אות הבסיס בתדר 7,800 הרץ. ההתנגדות התיאורטית של 5,835 Ω מתקבלת מנגד של 5,600 Ω בטור עם פוטנציומטר של 470 Ω, לכיוון עדין. מעגל עוקב ומחלק מתח מספקים מתח ייחוס של 2.5 וולט.\n\n2. סינון (מעביר נמוכים): מסנן מעביר נמוכים מסדר שני הופך את האות המשולש לסינוס. הרכיבים שחושבו (R = 855 Ω ו־C2 = 57 nF) מנחיתים היטב את ההרמוניות הלא רצויות.\n\n3. הגברה: מגבר הספק LM4818 ממיר את האות המסונן לגלי קול דרך רמקול. השידור מופעל בלחצן."
    },
    "results": {
     "fr": "Les essais à l'oscilloscope valident les performances du prototype. La fréquence de sortie est calée avec précision sur 7 800 Hz. Le filtre atteint une atténuation de −38 dB entre la fondamentale et la 3ᵉ harmonique. L'écart n'est que de 5 % par rapport à la théorie pour la partie astable. La puissance utile mesurée est de 0,836 W sur une charge de 33 Ω, et le signal sonore final est bien sinusoïdal.",
     "en": "Oscilloscope tests validate the prototype's performance. The output frequency is set precisely at 7,800 Hz. The filter reaches −38 dB of attenuation between the fundamental and the third harmonic. The astable stage is within 5% of theory. The measured useful power is 0.836 W into a 33 Ω load, and the final sound signal is a clean sine wave.",
     "he": "בדיקות האוסצילוסקופ מאמתות את ביצועי האב־טיפוס. תדר המוצא מכוון במדויק ל־7,800 הרץ. המסנן מגיע להנחתה של ‎−38 dB בין התדר היסודי להרמוניה השלישית. הסטייה במעגל הא־יציב היא 5% בלבד מהתיאוריה. ההספק השימושי שנמדד הוא 0.836 ואט על עומס של 33 Ω, והאות הקולי הסופי הוא סינוס נקי."
    },
    "review": {
     "fr": "L'étude pratique a confirmé les calculs théoriques réalisés à la conception. Le système génère et émet la fréquence de 7 800 Hz exigée par le cahier des charges, et l'émetteur est prêt à être testé avec la partie réceptrice du robot.",
     "en": "The practical study confirmed the theoretical calculations made during design. The system generates and emits the 7,800 Hz required by the specification, and the transmitter is ready to be tested with the robot's receiver.",
     "he": "העבודה המעשית אישרה את החישובים התיאורטיים שנעשו בשלב התכנון. המערכת מייצרת ומשדרת את התדר של 7,800 הרץ שנדרש במפרט, והמשדר מוכן לבדיקה מול מעגל המקלט של הרובוט."
    }
   },
   "media": [
    {
     "src": "images/emetteur-recepteur-sonore-1.jpg",
     "caption": {
      "fr": "Câblage du système sur plaque d'essai",
      "en": "The system wired on a breadboard",
      "he": "חיווט המערכת על מטריצה"
     }
    },
    {
     "src": "images/emetteur-recepteur-sonore-2.jpg",
     "caption": {
      "fr": "Schéma électrique global du système",
      "en": "Full circuit diagram",
      "he": "סכמה חשמלית כוללת של המערכת"
     }
    },
    {
     "src": "images/emetteur-recepteur-sonore-3.jpg",
     "caption": {
      "fr": "Entrée et sortie du filtre passe-bas à l'oscilloscope, pour mesurer l'atténuation",
      "en": "Input and output of the low-pass filter on the oscilloscope, to measure attenuation",
      "he": "אותות הכניסה והיציאה של המסנן באוסצילוסקופ, למדידת ההנחתה"
     }
    }
   ],
   "pdf": "projects/emetteur-recepteur-sonore.pdf",
   "featured": false
  },
  {
   "id": "robot-detecteur-obstacles",
   "model": "robot",
   "year": "2024",
   "duration": {
    "fr": "70 heures",
    "en": "70 hours",
    "he": "70 שעות"
   },
   "org": {
    "fr": "Projet à l'IUT de Toulon",
    "en": "Project at IUT de Toulon",
    "he": "פרויקט ב־IUT טולון"
   },
   "title": {
    "fr": "Robot détecteur d'obstacles",
    "en": "Obstacle-detecting robot",
    "he": "רובוט מזהה מכשולים"
   },
   "summary": {
    "fr": "Conception et réalisation d'un robot roulant sous Arduino, radiocommandé ou autonome, qui détecte et évite les obstacles.",
    "en": "Designed and built an Arduino-based wheeled robot, radio-controlled or autonomous, that detects and avoids obstacles.",
    "he": "תכנון ובנייה של רובוט נוסע מבוסס Arduino, בשליטה מרחוק או אוטונומי, שמזהה מכשולים ועוקף אותם."
   },
   "tags": [
    {
     "fr": "Arduino",
     "en": "Arduino",
     "he": "Arduino"
    },
    {
     "fr": "C++",
     "en": "C++",
     "he": "C++‎"
    },
    {
     "fr": "PWM",
     "en": "PWM",
     "he": "PWM"
    },
    {
     "fr": "Capteurs ultrason et infrarouge",
     "en": "Ultrasonic and infrared sensors",
     "he": "חיישנים אולטרסוניים ואינפרה־אדומים"
    }
   ],
   "sections": {
    "context": {
     "fr": "Projet réalisé dans le cadre de la SAÉ 2.01 « Concevoir » au département GEII de l'IUT de Toulon. L'étude porte sur la conception et la réalisation d'un robot détecteur d'obstacles, commandé par une radiocommande et programmé en C++ sur une carte Arduino.",
     "en": "Carried out for the SAÉ 2.01 “Design” module in the GEII department of IUT de Toulon. The study covers the design and build of an obstacle-detecting robot, driven by a radio remote and programmed in C++ on an Arduino board.",
     "he": "הפרויקט בוצע במסגרת קורס SAÉ 2.01 ״תכנון״ במחלקת GEII של IUT טולון. העבודה עוסקת בתכנון ובבנייה של רובוט מזהה מכשולים, הנשלט בשלט רדיו ומתוכנת ב־C++‎ על כרטיס Arduino."
    },
    "goal": {
     "fr": "L'objectif est de construire un robot mobile polyvalent, capable de se déplacer et d'interagir avec son environnement de manière autonome ou pilotée. Le système doit répondre aux besoins suivants :\n\n1. Autonomie énergétique : dimensionner une batterie adaptée pour alimenter les moteurs et la carte de commande.\n2. Pilotage à distance : être contrôlable manuellement par radiocommande (avancer, reculer, tourner).\n3. Intelligence embarquée : disposer d'un mode autonome pour détecter et éviter les obstacles grâce à des capteurs.\n4. Interface : afficher l'état et les distances sur un écran LCD embarqué.",
     "en": "The goal is a versatile mobile robot that can move and interact with its surroundings either autonomously or under manual control. The system must meet these needs:\n\n1. Power autonomy: size a battery suited to powering the motors and the control board.\n2. Remote control: be driven manually by radio remote (forward, reverse, turn).\n3. On-board intelligence: an autonomous mode that detects and avoids obstacles using sensors.\n4. Interface: show status and distances on an on-board LCD screen.",
     "he": "המטרה היא לבנות רובוט נייד ורב־שימושי, שיודע לנוע ולהגיב לסביבה באופן אוטונומי או בשליטה ידנית. המערכת צריכה לענות על הצרכים הבאים:\n\n1. עצמאות אנרגטית: בחירת סוללה מתאימה להזנת המנועים וכרטיס הבקרה.\n2. שליטה מרחוק: נהיגה ידנית בשלט רדיו (קדימה, אחורה, פנייה).\n3. בינה משובצת: מצב אוטונומי שמזהה מכשולים ועוקף אותם בעזרת חיישנים.\n4. ממשק: הצגת מצב ומרחקים על מסך LCD שעל הרובוט."
    },
    "build": {
     "fr": "Le robot s'articule autour d'une carte Arduino.\n\n1. Alimentation et motorisation : l'énergie est fournie par une batterie dimensionnée pour l'autonomie du système. La propulsion est assurée par deux moteurs à courant continu, pilotés par un pont en H (L298N) qui gère le sens de rotation et la vitesse par modulation PWM.\n\n2. Programmation et algorithmique : le programme, développé en C++, est modulaire. Une fonction dédiée, cmd_motor, masque la complexité du pilotage des moteurs. En mode manuel, le robot lit les signaux PWM du récepteur radio et un algorithme de mixage ajuste la vitesse de chaque roue pour des virages fluides (pilotage différentiel). En mode automatique, une loi de puissance linéarise les signaux analogiques des capteurs pour les convertir en distance réelle (cm) ; une logique conditionnelle analyse ensuite l'environnement pour choisir la trajectoire (obstacle au centre : tourner vers la zone libre).\n\n3. Capteurs et interface : la perception repose sur des capteurs à ultrasons et infrarouges placés à l'avant. Un écran LCD affiche en temps réel le mode actif et les distances mesurées, ce qui facilite le débogage et l'utilisation.",
     "en": "The robot is built around an Arduino board.\n\n1. Power and drive: energy comes from a battery sized for the system's autonomy. Two DC motors provide propulsion, driven by an H-bridge (L298N) that sets direction and speed through PWM.\n\n2. Programming and algorithms: the program, written in C++, is modular. A dedicated function, cmd_motor, hides the complexity of driving the motors. In manual mode the robot reads the PWM signals from the radio receiver, and a mixing algorithm adjusts the speed of each wheel for smooth turns (differential steering). In automatic mode a power law linearises the analogue sensor signals into real distance (cm); conditional logic then analyses the surroundings to choose a path (obstacle ahead: turn towards the free side).\n\n3. Sensors and interface: perception relies on ultrasonic and infrared sensors at the front. An LCD screen shows the active mode and the measured distances in real time, which makes debugging and use easier.",
     "he": "הרובוט בנוי סביב כרטיס Arduino.\n\n1. הזנה והנעה: האנרגיה מגיעה מסוללה שנבחרה לפי זמן הפעולה הנדרש. ההנעה נעשית בשני מנועי DC, הנשלטים בגשר H (L298N) שקובע את כיוון הסיבוב ואת המהירות באפנון PWM.\n\n2. תכנות ואלגוריתמיקה: התוכנה, שנכתבה ב־C++‎, מודולרית. פונקציה ייעודית, cmd_motor, מסתירה את מורכבות השליטה במנועים. במצב ידני הרובוט קורא את אותות ה־PWM ממקלט הרדיו, ואלגוריתם מיקס מתאים את מהירות כל גלגל לפניות חלקות (היגוי דיפרנציאלי). במצב אוטומטי חוק חזקה הופך את האותות האנלוגיים של החיישנים למרחק אמיתי (בס״מ); לוגיקה מותנית מנתחת אחר כך את הסביבה ובוחרת מסלול (מכשול במרכז: פנייה לצד הפנוי).\n\n3. חיישנים וממשק: התפיסה מבוססת על חיישנים אולטרסוניים ואינפרה־אדומים בחזית. מסך LCD מציג בזמן אמת את המצב הפעיל ואת המרחקים שנמדדו, וכך מקל על איתור תקלות ועל השימוש."
    },
    "results": {
     "fr": "L'intégration des composants et du code a donné un robot pleinement fonctionnel.\n\n1. Réactivité : le robot bascule instantanément entre les modes manuel et automatique grâce à l'interrupteur de la radiocommande.\n2. Fiabilité du code : la linéarisation des capteurs assure une détection précise des obstacles et évite les collisions en mode autonome.\n3. Motricité : la gestion PWM donne une conduite souple, qui ralentit dans les virages plutôt que de pivoter brusquement.\n4. Supervision : l'écran LCD affiche correctement les informations, ce qui valide la communication entre tous les modules.",
     "en": "Integrating the components and the code produced a fully working robot.\n\n1. Responsiveness: the robot switches instantly between manual and automatic modes with the switch on the remote.\n2. Reliable code: linearising the sensors gives accurate obstacle detection and avoids collisions in autonomous mode.\n3. Handling: PWM control gives smooth driving that slows down in turns instead of pivoting abruptly.\n4. Supervision: the LCD shows the information correctly, which confirms that all modules communicate properly.",
     "he": "שילוב הרכיבים והקוד הניב רובוט שפועל במלואו.\n\n1. תגובתיות: הרובוט עובר מיד בין המצב הידני לאוטומטי בעזרת המתג שבשלט.\n2. אמינות הקוד: הלינאריזציה של החיישנים מבטיחה זיהוי מדויק של מכשולים ומונעת התנגשויות במצב אוטונומי.\n3. נהיגה: שליטת ה־PWM נותנת נסיעה חלקה, שמאטה בפניות במקום להסתובב בחדות.\n4. פיקוח: מסך ה־LCD מציג את המידע כנדרש, וזה מאמת את התקשורת בין כל המודולים."
    },
    "review": {
     "fr": "Ce projet m'a fait maîtriser la chaîne complète de développement d'un système embarqué : du dimensionnement électrique à la programmation en C++, en passant par l'interfaçage des capteurs. Il a montré l'importance de structurer son code pour gérer en même temps la lecture des capteurs, la réception radio et le pilotage des moteurs, sans latence.",
     "en": "This project took me through the full development chain of an embedded system: from electrical sizing to C++ programming, by way of sensor interfacing. It showed how much code structure matters when you have to read sensors, receive radio commands and drive motors at the same time, without lag.",
     "he": "הפרויקט לימד אותי את כל שרשרת הפיתוח של מערכת משובצת: מתכנון חשמלי ועד תכנות ב־C++‎, דרך חיבור החיישנים. הוא המחיש כמה חשוב לבנות את הקוד נכון כדי לקרוא חיישנים, לקלוט פקודות רדיו ולהפעיל מנועים בו־זמנית, בלי השהיה."
    }
   },
   "media": [
    {
     "src": "images/robot-detecteur-obstacles-1.jpg",
     "caption": {
      "fr": "Le robot assemblé",
      "en": "The assembled robot",
      "he": "הרובוט המורכב"
     }
    },
    {
     "src": "images/robot-detecteur-obstacles-2.jpg",
     "caption": {
      "fr": "Schéma de câblage du pont en H",
      "en": "H-bridge wiring diagram",
      "he": "תרשים חיווט של גשר ה־H"
     }
    },
    {
     "src": "images/robot-detecteur-obstacles-3.jpg",
     "caption": {
      "fr": "Courbe de réponse du capteur infrarouge : tension en fonction de la distance",
      "en": "Infrared sensor response curve: voltage against distance",
      "he": "עקומת התגובה של החיישן האינפרה־אדום: מתח כפונקציה של מרחק"
     }
    }
   ],
   "pdf": "projects/robot-detecteur-obstacles.pdf",
   "featured": false
  },
  {
   "id": "lampe-smartlight",
   "model": "lampe",
   "year": "2023",
   "duration": {
    "fr": "90 heures",
    "en": "90 hours",
    "he": "90 שעות"
   },
   "org": {
    "fr": "Projet à l'IUT de Toulon",
    "en": "Project at IUT de Toulon",
    "he": "פרויקט ב־IUT טולון"
   },
   "title": {
    "fr": "Lampe intelligente SmartLight",
    "en": "SmartLight smart lamp",
    "he": "מנורה חכמה SmartLight"
   },
   "summary": {
    "fr": "Conception complète d'une lampe pilotée par Arduino qui adapte son intensité à la lumière ambiante, avec une carte électronique sur mesure routée sous KiCad.",
    "en": "End-to-end design of an Arduino-driven lamp that adapts its brightness to ambient light, with a custom PCB routed in KiCad.",
    "he": "תכנון מלא של מנורה בשליטת Arduino שמתאימה את עוצמתה לאור הסביבה, עם מעגל מודפס ייעודי שתוכנן ב־KiCad."
   },
   "tags": [
    {
     "fr": "KiCad",
     "en": "KiCad",
     "he": "KiCad"
    },
    {
     "fr": "Arduino Nano",
     "en": "Arduino Nano",
     "he": "Arduino Nano"
    },
    {
     "fr": "C++",
     "en": "C++",
     "he": "C++‎"
    },
    {
     "fr": "Soudure",
     "en": "Soldering",
     "he": "הלחמה"
    }
   ],
   "sections": {
    "context": {
     "fr": "Projet du semestre 1 de la formation GEII, portant sur la conception intégrale d'un système électronique embarqué. L'objectif était de créer une carte électronique « SmartLight » dédiée au pilotage intelligent d'une lampe, du schéma structurel jusqu'au produit fini et documenté.",
     "en": "A first-semester GEII project covering the complete design of an embedded electronic system. The aim was to create a “SmartLight” board dedicated to the smart control of a lamp, from the schematic to a finished, documented product.",
     "he": "פרויקט מהסמסטר הראשון בלימודי GEII, שעוסק בתכנון מלא של מערכת אלקטרונית משובצת. המטרה הייתה ליצור כרטיס אלקטרוני בשם ״SmartLight״ לשליטה חכמה במנורה, מהסכמה ועד מוצר גמור ומתועד."
    },
    "goal": {
     "fr": "L'objectif est de concevoir un système d'éclairage autonome et pilotable, capable de s'adapter à son environnement. Le cahier des charges impose une gestion intelligente : la lampe adapte automatiquement son intensité à la lumière ambiante mesurée par un capteur. Le projet exige aussi la réalisation complète du matériel, avec le routage sous KiCad d'une carte électronique sur mesure qui intègre un Arduino Nano et les interfaces de puissance. Enfin, le système doit offrir une expérience utilisateur complète, avec un contrôle par télécommande infrarouge et par boutons physiques, expliqué dans une notice d'utilisation claire.",
     "en": "The goal is a lighting system that is both autonomous and controllable, and adapts to its environment. The specification requires smart management: the lamp automatically adjusts its brightness to the ambient light measured by a sensor. The project also requires building the complete hardware, including routing a custom PCB in KiCad that hosts an Arduino Nano and the power interfaces. Finally, the system has to offer a complete user experience, with control by infrared remote and physical buttons, explained in a clear user manual.",
     "he": "המטרה היא מערכת תאורה עצמאית וניתנת לשליטה, שמתאימה את עצמה לסביבה. המפרט דורש ניהול חכם: המנורה מתאימה אוטומטית את עוצמתה לאור הסביבה שנמדד בחיישן. הפרויקט דורש גם בנייה מלאה של החומרה, כולל עריכה ב־KiCad של מעגל מודפס ייעודי שמשלב Arduino Nano וממשקי הספק. לבסוף, המערכת צריכה להציע חוויית משתמש שלמה, עם שליטה בשלט אינפרה־אדום ובלחצנים פיזיים, המוסברת במדריך למשתמש ברור."
    },
    "build": {
     "fr": "Le projet a suivi une démarche de développement produit, en commençant par une étude photométrique pour dimensionner le système. La conception matérielle s'est déroulée sous KiCad : saisie du schéma électrique, choix des empreintes et routage complet du PCB, qui intègre un Arduino Nano et plusieurs connecteurs (USB-C, jack). La fabrication a consisté à souder les composants traversants et les connecteurs sur le circuit imprimé, avant de passer à la programmation. Le code Arduino gère plusieurs modes : un mode manuel pour varier l'intensité avec les boutons ou la télécommande, un mode automatique, activé par la touche 9, qui régule la lumière selon l'éclairage ambiant, et un mode dégradé pour les variations de couleurs.",
     "en": "The project followed a product-development approach, starting with a photometric study to size the system. The hardware was designed in KiCad: schematic capture, footprint selection and full routing of the PCB, which hosts an Arduino Nano and several connectors (USB-C, jack). Manufacturing meant soldering the through-hole components and connectors onto the board before moving on to programming. The Arduino code handles several modes: a manual mode to vary brightness with the buttons or the remote, an automatic mode, enabled with key 9, that regulates the light according to ambient lighting, and a fade mode for colour transitions.",
     "he": "הפרויקט התנהל כפיתוח מוצר, והחל במחקר פוטומטרי לקביעת ממדי המערכת. תכנון החומרה נעשה ב־KiCad: שרטוט הסכמה החשמלית, בחירת טביעות הרגל ועריכה מלאה של המעגל המודפס, שמשלב Arduino Nano וכמה מחברים (USB-C, ג׳ק). שלב הייצור כלל הלחמה של הרכיבים והמחברים על המעגל, ואחריו התכנות. קוד ה־Arduino מנהל כמה מצבים: מצב ידני לשינוי העוצמה בלחצנים או בשלט, מצב אוטומטי, המופעל במקש 9, שמווסת את האור לפי תאורת הסביבה, ומצב של מעברי צבע הדרגתיים."
    },
    "results": {
     "fr": "Le projet a abouti à un prototype électronique robuste et pleinement fonctionnel. La carte SmartLight présente des soudures propres et une connectique fiable, pour une alimentation stable par USB ou par jack. L'ergonomie a été validée par la fluidité du passage entre les modes manuel et automatique, et par la réactivité de la télécommande pour l'allumage et le choix des couleurs. Une notice d'utilisation graphique a aussi été produite pour guider l'utilisateur final dans les branchements et les fonctionnalités.",
     "en": "The project produced a robust, fully working electronic prototype. The SmartLight board has clean solder joints and reliable connectors, for stable power over USB or jack. Usability was confirmed by the smooth switch between manual and automatic modes and by the responsiveness of the remote for on/off and colour selection. An illustrated user manual was also produced to guide the end user through connections and features.",
     "he": "התוצאה היא אב־טיפוס אלקטרוני חסין שפועל במלואו. בכרטיס SmartLight הלחמות נקיות ומחברים אמינים, להזנה יציבה ב־USB או בג׳ק. הנוחות אומתה במעבר החלק בין המצב הידני לאוטומטי ובתגובה המהירה של השלט להדלקה ולבחירת צבעים. הופק גם מדריך גרפי למשתמש, שמלווה את המשתמש בחיבורים ובתכונות."
    },
    "review": {
     "fr": "Ce projet m'a fait parcourir la chaîne complète de création d'un produit électronique : CAO sous KiCad, fabrication par soudure et programmation embarquée. Au-delà de la technique, la rédaction de la notice a apporté une dimension professionnelle supplémentaire, en m'obligeant à vulgariser un fonctionnement complexe pour le rendre accessible au grand public.",
     "en": "This project took me through the complete chain of creating an electronic product: CAD in KiCad, soldering and embedded programming. Beyond the technical side, writing the manual added a professional dimension, because it forced me to explain a complex system in terms the general public can follow.",
     "he": "הפרויקט העביר אותי את כל שרשרת היצירה של מוצר אלקטרוני: תכנון ב־KiCad, ייצור בהלחמה ותכנות משובץ. מעבר לצד הטכני, כתיבת המדריך הוסיפה ממד מקצועי, כי היא חייבה אותי להסביר מערכת מורכבת בשפה שכל משתמש יבין."
    }
   },
   "media": [
    {
     "src": "images/lampe-smartlight-1.jpg",
     "caption": {
      "fr": "La carte SmartLight assemblée",
      "en": "The assembled SmartLight board",
      "he": "כרטיס SmartLight המורכב"
     }
    },
    {
     "src": "images/lampe-smartlight-2.jpg",
     "caption": {
      "fr": "",
      "en": "",
      "he": ""
     }
    },
    {
     "src": "images/lampe-smartlight-3.jpg",
     "caption": {
      "fr": "Routage du circuit imprimé sous KiCad",
      "en": "PCB routing in KiCad",
      "he": "עריכת המעגל המודפס ב־KiCad"
     }
    }
   ],
   "pdf": "projects/lampe-smartlight.pdf",
   "featured": false
  },
  {
   "id": "maintenance-unilogic",
   "model": "armoire",
   "year": "2023",
   "duration": {
    "fr": "45 heures",
    "en": "45 hours",
    "he": "45 שעות"
   },
   "org": {
    "fr": "Projet à l'IUT de Toulon",
    "en": "Project at IUT de Toulon",
    "he": "פרויקט ב־IUT טולון"
   },
   "title": {
    "fr": "Mise en service d'une armoire UniLogic",
    "en": "Commissioning a UniLogic control cabinet",
    "he": "הפעלה ראשונית של לוח בקרה UniLogic"
   },
   "summary": {
    "fr": "Vérification de conformité et mise en service de la partie électrique d'un système domotique piloté par un automate Unitronics UniStream.",
    "en": "Compliance checks and commissioning of the electrical side of a home-automation system driven by a Unitronics UniStream PLC.",
    "he": "בדיקות תאימות והפעלה ראשונית של החלק החשמלי במערכת בית חכם הנשלטת בבקר Unitronics UniStream."
   },
   "tags": [
    {
     "fr": "UniLogic",
     "en": "UniLogic",
     "he": "UniLogic"
    },
    {
     "fr": "Pt100",
     "en": "Pt100",
     "he": "Pt100"
    },
    {
     "fr": "PWM",
     "en": "PWM",
     "he": "PWM"
    },
    {
     "fr": "Multimètre et oscilloscope",
     "en": "Multimeter and oscilloscope",
     "he": "רב־מודד ואוסצילוסקופ"
    }
   ],
   "sections": {
    "context": {
     "fr": "Projet du premier semestre au département GEII de l'Université de Toulon. Pour cette étude, je me suis placé dans les conditions réelles d'un technicien travaillant pour une société spécialisée dans la réalisation d'armoires électriques pour l'industrie et le bâtiment.",
     "en": "A first-semester project in the GEII department of the University of Toulon. For this study I worked in the real conditions of a technician at a company that builds electrical cabinets for industry and buildings.",
     "he": "פרויקט מהסמסטר הראשון במחלקת GEII של אוניברסיטת טולון. בעבודה הזאת פעלתי בתנאים אמיתיים של טכנאי בחברה שמתמחה בבניית לוחות חשמל לתעשייה ולמבנים."
    },
    "goal": {
     "fr": "L'objectif était de réaliser un dossier de mise en service rigoureux, afin de vérifier la conformité de l'armoire électrique avec son cahier des charges. Cette validation était indispensable pour livrer la partie électrique de ce système domotique, sûre et fonctionnelle, à l'entreprise partenaire chargée de développer la partie automatisme.",
     "en": "The goal was to produce a rigorous commissioning file that verifies the cabinet's compliance with its specification. This validation was essential before delivering the electrical side of the home-automation system, safe and working, to the partner company in charge of the automation side.",
     "he": "המטרה הייתה להכין תיק הפעלה ראשונית קפדני, כדי לוודא שלוח החשמל תואם למפרט שלו. האימות הזה היה תנאי למסירת החלק החשמלי של מערכת הבית החכם, בטוח ומתפקד, לחברה השותפה שאחראית על פיתוח הבקרה."
    },
    "build": {
     "fr": "La vérification a été structurée en quatre étapes d'essais matériels, au multimètre et à l'oscilloscope. J'ai d'abord contrôlé la sonde de température Pt100 en mesurant sa résistance à l'ohmmètre pour la comparer aux valeurs théoriques du constructeur. Je me suis ensuite assuré de la bonne réponse des actionneurs (lampes H1, H2, H3 et ventilateurs V0, V1) en mesurant leurs tensions de commande, qui devaient varier de 0 à 24 V, et en analysant les signaux PWM à l'oscilloscope. Enfin, j'ai vérifié les signaux TOR (tout ou rien) en modifiant leurs états depuis le pupitre de commande, ce qui a validé la bonne réception des informations par les entrées de l'automate.",
     "en": "The verification was organised into four stages of hardware tests, using a multimeter and an oscilloscope. I first checked the Pt100 temperature probe by measuring its resistance and comparing it with the manufacturer's theoretical values. I then confirmed that the actuators (lamps H1, H2, H3 and fans V0, V1) responded correctly by measuring their control voltages, which had to vary from 0 to 24 V, and analysing the PWM signals on the oscilloscope. Finally, I checked the digital on/off signals by changing their states from the control desk, which confirmed that the PLC inputs received the information correctly.",
     "he": "האימות נבנה בארבעה שלבים של בדיקות חומרה, בעזרת רב־מודד ואוסצילוסקופ. תחילה בדקתי את חיישן הטמפרטורה Pt100: מדדתי את ההתנגדות שלו והשוויתי אותה לערכים התיאורטיים של היצרן. אחר כך וידאתי שהמפעילים (נורות H1, H2, H3 ומאווררים V0, V1) מגיבים כנדרש: מדדתי את מתחי הפיקוד שלהם, שאמורים לנוע בין 0 ל־24 וולט, וניתחתי את אותות ה־PWM באוסצילוסקופ. לבסוף בדקתי את האותות הדיגיטליים (On/Off) על ידי שינוי המצבים שלהם מלוח הפיקוד, וכך אימתתי שכניסות הבקר מקבלות את המידע כראוי."
    },
    "results": {
     "fr": "Les séries de mesures ont montré une parfaite cohérence entre les valeurs électriques relevées sur la maquette et le fonctionnement théorique attendu par l'entreprise partenaire. L'analyse de la fréquence du signal du tachymètre a confirmé que le ventilateur tournait à la bonne vitesse. Les essais sur les états discrets, comme l'enclenchement du disjoncteur ou le signal du compteur d'énergie, ont montré que le système générait bien les tensions attendues sur les borniers de l'automate.",
     "en": "The measurement series showed full agreement between the electrical values observed on the test rig and the theoretical behaviour expected by the partner company. Analysing the frequency of the tachometer signal confirmed that the fan was turning at the right speed. Tests on discrete states, such as the circuit breaker closing or the energy meter signal, showed that the system produced the expected voltages on the PLC terminals.",
     "he": "סדרות המדידות הראו התאמה מלאה בין הערכים החשמליים שנמדדו בדגם לבין הפעולה התיאורטית שהחברה השותפה ציפתה לה. ניתוח תדר האות של הטכומטר אישר שהמאוורר מסתובב במהירות הנכונה. בדיקות המצבים הבדידים, כמו הפעלת המפסק או אות מונה האנרגיה, הראו שהמערכת מייצרת את המתחים הצפויים בהדקי הבקר."
    },
    "review": {
     "fr": "Cette mise en service a été très formatrice pour appréhender les exigences du milieu industriel. Elle a consolidé mes compétences d'analyse sur un système complet et ma maîtrise des appareils de mesure. Surtout, ce projet a aiguisé ma capacité à interpréter des données techniques concrètes pour conclure de manière fiable sur la conformité et la sécurité d'une installation.",
     "en": "This commissioning taught me a great deal about the demands of industry. It consolidated my ability to analyse a complete system and to use measuring instruments rigorously. Above all, it sharpened my ability to interpret concrete technical data and reach reliable conclusions about an installation's compliance and safety.",
     "he": "ההפעלה הראשונית הזאת לימדה אותי רבות על דרישות העולם התעשייתי. היא חיזקה את יכולת הניתוח שלי במערכת שלמה ואת השימוש המוקפד במכשירי מדידה. מעל הכול, הפרויקט חידד את היכולת שלי לפרש נתונים טכניים ממשיים ולהסיק מסקנות אמינות על התאימות והבטיחות של מתקן."
    }
   },
   "media": [
    {
     "src": "images/maintenance-unilogic-1.jpg",
     "caption": {
      "fr": "La platine électrique à vérifier",
      "en": "The electrical panel under test",
      "he": "הלוח החשמלי הנבדק"
     }
    },
    {
     "src": "images/maintenance-unilogic-2.jpg",
     "caption": {
      "fr": "Mesure de la tension sur les entrées TOR de l'automate, au multimètre",
      "en": "Measuring the voltage on the PLC's digital inputs with a multimeter",
      "he": "מדידת המתח בכניסות הדיגיטליות של הבקר ברב־מודד"
     }
    },
    {
     "src": "images/maintenance-unilogic-3.jpg",
     "caption": {
      "fr": "Rapport cyclique et fréquence du signal PWM (115,2 Hz) à l'oscilloscope",
      "en": "Duty cycle and frequency of the PWM signal (115.2 Hz) on the oscilloscope",
      "he": "מחזור הפעולה והתדר של אות ה־PWM (115.2 הרץ) באוסצילוסקופ"
     }
    }
   ],
   "pdf": "projects/maintenance-unilogic.pdf",
   "featured": false
  }
 ],
 "experience": [
  {
   "id": "veolia",
   "date": "2026",
   "duration": {
    "fr": "14 semaines",
    "en": "14 weeks",
    "he": "14 שבועות"
   },
   "role": {
    "fr": "Stagiaire en informatique industrielle et systèmes embarqués",
    "en": "Industrial computing and embedded systems intern",
    "he": "מתמחה במחשוב תעשייתי ובמערכות משובצות"
   },
   "org": {
    "fr": "Veolia Eau, agence Assainissement, La Seyne-sur-Mer",
    "en": "Veolia Eau, wastewater agency, La Seyne-sur-Mer",
    "he": "Veolia Eau, סוכנות הביוב, לה סיין־סור־מר"
   },
   "tasks": [
    {
     "fr": "Sélection, paramétrage et intégration de capteurs de mesure (radar Vega C22, sondes piézométriques, dataloggers).",
     "en": "Selected, configured and integrated measurement sensors (Vega C22 radar, pressure probes, data loggers).",
     "he": "בחירה, הגדרה ושילוב של חיישני מדידה (מכ״ם Vega C22, חיישני לחץ, אוגרי נתונים)."
    },
    {
     "fr": "Dimensionnement électrique et validation de l'autonomie de l'architecture embarquée.",
     "en": "Sized the electrical system and validated the autonomy of the embedded architecture.",
     "he": "תכנון חשמלי ואימות זמן הפעולה של המערך המשובץ."
    },
    {
     "fr": "Développement d'un outil d'analyse en Python (Pandas, NumPy) pour synchroniser des milliers de mesures asynchrones.",
     "en": "Built a Python analysis tool (Pandas, NumPy) to time-align thousands of asynchronous measurements.",
     "he": "פיתוח כלי ניתוח ב־Python (Pandas, NumPy) לסנכרון בזמן של אלפי מדידות אסינכרוניות."
    },
    {
     "fr": "Amélioration mécanique et fiabilisation de l'étanchéité du prototype (coffrets, structure en PVC Ø110).",
     "en": "Improved the mechanics and made the prototype reliably watertight (enclosures, Ø110 PVC structure).",
     "he": "שיפור מכני והבטחת אטימות האב־טיפוס (קופסאות, מבנה מצינורות PVC בקוטר 110 מ״מ)."
    },
    {
     "fr": "Essais sur le terrain et post-traitement des données cartographiques et physico-chimiques.",
     "en": "Ran field tests and post-processed the mapping and physico-chemical data.",
     "he": "ניסויי שטח ועיבוד הנתונים הקרטוגרפיים והפיזיקו־כימיים."
    }
   ],
   "projectId": "stage-veolia",
   "logo": "images/veolia.jpg"
  },
  {
   "id": "enedis",
   "date": "2025",
   "duration": {
    "fr": "8 semaines",
    "en": "8 weeks",
    "he": "8 שבועות"
   },
   "role": {
    "fr": "Stagiaire en supervision du réseau",
    "en": "Grid supervision intern",
    "he": "מתמחה בפיקוח על רשת החשמל"
   },
   "org": {
    "fr": "Enedis, agence ASGARD, Toulon",
    "en": "Enedis, ASGARD agency, Toulon",
    "he": "Enedis, סוכנות ASGARD, טולון"
   },
   "tasks": [
    {
     "fr": "Assistance à la supervision en temps réel du réseau HTA et BT.",
     "en": "Assisted with real-time supervision of the medium- and low-voltage grid.",
     "he": "סיוע בפיקוח בזמן אמת על רשת המתח הגבוה והנמוך."
    },
    {
     "fr": "Analyse des incidents et suivi des dépannages avec les équipes de terrain.",
     "en": "Analysed incidents and followed up outages with field crews.",
     "he": "ניתוח אירועים ומעקב אחר תיקון תקלות מול צוותי השטח."
    },
    {
     "fr": "Validation technique des accès au réseau pour les chantiers (préparation des manœuvres).",
     "en": "Technically validated grid access for worksites (switching preparation).",
     "he": "אישור טכני של גישות לרשת לצורך עבודות (הכנת פעולות מיתוג)."
    },
    {
     "fr": "Utilisation des outils métiers de cartographie et de gestion du réseau (ADMS).",
     "en": "Used the mapping and network management tools (ADMS).",
     "he": "שימוש בכלי המיפוי וניהול הרשת (ADMS)."
    }
   ],
   "projectId": "stage-enedis",
   "logo": "images/enedis.jpg"
  },
  {
   "id": "ambassadeur",
   "date": "2024 – 2025",
   "duration": {
    "fr": "",
    "en": "",
    "he": ""
   },
   "role": {
    "fr": "Étudiant ambassadeur du BUT GEII",
    "en": "Student ambassador for the GEII degree",
    "he": "שגריר סטודנטים של תואר GEII"
   },
   "org": {
    "fr": "Université de Toulon",
    "en": "University of Toulon",
    "he": "אוניברסיטת טולון"
   },
   "tasks": [
    {
     "fr": "Promotion de la formation lors de salons d'orientation et de la journée portes ouvertes : présentation aux lycéens et à leurs parents, réponses à leurs questions.",
     "en": "Promoted the degree at education fairs and the open day: presented the programme to high-school students and their parents and answered their questions.",
     "he": "קידום התואר בירידי השכלה וביום הפתוח: הצגת המסלול לתלמידי תיכון ולהוריהם ומענה לשאלות."
    }
   ],
   "projectId": "",
   "logo": "images/univ-toulon.jpg"
  },
  {
   "id": "norauto",
   "date": "2020",
   "duration": {
    "fr": "1 semaine",
    "en": "1 week",
    "he": "שבוע"
   },
   "logo": "images/norauto.jpg",
   "hideInCv": true,
   "projectId": "",
   "role": {
    "fr": "Stage de découverte",
    "en": "Work-shadowing placement",
    "he": "שבוע היכרות עם עולם העבודה"
   },
   "org": {
    "fr": "Norauto Bon-Rencontre",
    "en": "Norauto Bon-Rencontre",
    "he": "Norauto Bon-Rencontre"
   },
   "tasks": [
    {
     "fr": "Observation des mécaniciens en charge des réparations de véhicules.",
     "en": "Observed the mechanics in charge of vehicle repairs.",
     "he": "תצפית על עבודת המכונאים האחראים על תיקון כלי הרכב."
    }
   ]
  }
 ],
 "education": [
  {
   "id": "but-geii",
   "date": "2023 – 2026",
   "title": {
    "fr": "BUT Génie Électrique et Informatique Industrielle (GEII)",
    "en": "BUT in Electrical Engineering and Industrial Computing (GEII)",
    "he": "תואר BUT בהנדסת חשמל ומחשוב תעשייתי (GEII)"
   },
   "school": {
    "fr": "IUT de Toulon, Université de Toulon",
    "en": "IUT de Toulon, University of Toulon",
    "he": "IUT טולון, אוניברסיטת טולון"
   },
   "detail": {
    "fr": "Diplôme Bac+3. Parcours Automatisme et Informatique Industrielle (AII).",
    "en": "Three-year university bachelor of technology. Specialisation in automation and industrial computing (AII).",
    "he": "תואר ראשון טכנולוגי תלת־שנתי. התמחות בבקרה ומחשוב תעשייתי (AII)."
   },
   "image": "images/geii.jpg",
   "page": {
    "subtitle": {
     "fr": "Bachelor Universitaire de Technologie",
     "en": "Three-year university bachelor of technology",
     "he": "תואר ראשון טכנולוגי אוניברסיטאי, שלוש שנים"
    },
    "intro": {
     "fr": "Le BUT Génie Électrique et Informatique Industrielle (GEII) est une formation en 3 ans (niveau Bac+3) qui forme des cadres intermédiaires capables de concevoir, vérifier et maintenir des systèmes automatisés complexes.\n\nMa spécialité, Automatisme et Informatique Industrielle (AII), met l'accent sur la programmation d'automates, la supervision de processus industriels et l'intégration de systèmes robotisés.",
     "en": "The BUT in Electrical Engineering and Industrial Computing (GEII) is a three-year degree that trains technicians and junior engineers to design, test and maintain complex automated systems.\n\nMy track, Automation and Industrial Computing (AII), focuses on PLC programming, supervision of industrial processes and integration of robotic systems.",
     "he": "תואר BUT בהנדסת חשמל ומחשוב תעשייתי (GEII) הוא מסלול של שלוש שנים שמכשיר הנדסאים ומהנדסים זוטרים לתכנן, לבדוק ולתחזק מערכות אוטומטיות מורכבות.\n\nההתמחות שלי, בקרה ומחשוב תעשייתי (AII), מתמקדת בתכנות בקרים, בפיקוח על תהליכים תעשייתיים ובשילוב מערכות רובוטיות."
    },
    "goals": [
     {
      "fr": "Concevoir la partie commande des systèmes automatisés.",
      "en": "Design the control side of automated systems.",
      "he": "תכנון חלק הבקרה של מערכות אוטומטיות."
     },
     {
      "fr": "Mettre en place des réseaux de communication industriels.",
      "en": "Set up industrial communication networks.",
      "he": "הקמת רשתות תקשורת תעשייתיות."
     },
     {
      "fr": "Superviser et piloter des installations à distance.",
      "en": "Supervise and control installations remotely.",
      "he": "פיקוח ושליטה מרחוק על מתקנים."
     }
    ],
    "modules": [
     {
      "title": {
       "fr": "Énergie et électronique",
       "en": "Energy and electronics",
       "he": "אנרגיה ואלקטרוניקה"
      },
      "text": {
       "fr": "Distribution électrique, électronique de puissance, conversion d'énergie.",
       "en": "Electrical distribution, power electronics, energy conversion.",
       "he": "חלוקת חשמל, אלקטרוניקת הספק, המרת אנרגיה."
      }
     },
     {
      "title": {
       "fr": "Automatisme et robotique",
       "en": "Automation and robotics",
       "he": "בקרה ורובוטיקה"
      },
      "text": {
       "fr": "Programmation API (Ladder, Grafcet), robots industriels, IHM.",
       "en": "PLC programming (Ladder, Grafcet), industrial robots, HMI.",
       "he": "תכנות בקרים (סולם, Grafcet), רובוטים תעשייתיים, ממשקי מפעיל."
      }
     },
     {
      "title": {
       "fr": "Informatique industrielle",
       "en": "Industrial computing",
       "he": "מחשוב תעשייתי"
      },
      "text": {
       "fr": "C/C++, Python, réseaux locaux, systèmes embarqués.",
       "en": "C/C++, Python, local networks, embedded systems.",
       "he": "C/C++‎, Python, רשתות מקומיות, מערכות משובצות."
      }
     }
    ]
   }
  },
  {
   "id": "habil-br",
   "date": "2024",
   "title": {
    "fr": "Habilitation électrique BR",
    "en": "BR electrical safety authorisation",
    "he": "הסמכת חשמל BR"
   },
   "school": {
    "fr": "Université de Toulon",
    "en": "University of Toulon",
    "he": "אוניברסיטת טולון"
   },
   "detail": {
    "fr": "Chargé d'intervention générale en basse tension.",
    "en": "French authorisation for general low-voltage interventions.",
    "he": "הסמכה צרפתית לביצוע עבודות כלליות במתח נמוך."
   }
  },
  {
   "id": "bac",
   "date": "2023",
   "title": {
    "fr": "Baccalauréat général",
    "en": "French general baccalauréat",
    "he": "תעודת בגרות צרפתית (Baccalauréat)"
   },
   "school": {
    "fr": "Lycée Bonaparte, Toulon",
    "en": "Lycée Bonaparte, Toulon",
    "he": "תיכון Bonaparte, טולון"
   },
   "detail": {
    "fr": "Spécialités mathématiques, physique-chimie et SVT. Options mathématiques expertes et sport.",
    "en": "Majors in mathematics, physics-chemistry and life and earth sciences. Options: advanced mathematics and sport.",
    "he": "מגמות מתמטיקה, פיזיקה־כימיה ומדעי החיים והאדמה. הרחבות: מתמטיקה מתקדמת וספורט."
   }
  },
  {
   "id": "bafa",
   "date": "2023",
   "title": {
    "fr": "BAFA",
    "en": "BAFA youth leadership certificate",
    "he": "תעודת BAFA להדרכת נוער"
   },
   "school": {
    "fr": "Brevet d'aptitude aux fonctions d'animateur",
    "en": "French state certificate",
    "he": "תעודה ממלכתית צרפתית"
   },
   "detail": {
    "fr": "Encadrement d'enfants et d'adolescents en séjours et en accueils de loisirs.",
    "en": "Qualifies its holder to supervise children and teenagers in camps and activity centres.",
    "he": "מסמיכה להדריך ילדים ונוער במחנות ובמסגרות פנאי."
   }
  },
  {
   "id": "brevet",
   "date": "2020",
   "hideInCv": true,
   "title": {
    "fr": "Brevet des collèges",
    "en": "Brevet des collèges (lower secondary certificate)",
    "he": "תעודת סיום חטיבת ביניים"
   },
   "school": {
    "fr": "Collège Les Pins d'Alep, Toulon",
    "en": "Collège Les Pins d'Alep, Toulon",
    "he": "חטיבת הביניים Les Pins d'Alep, טולון"
   },
   "detail": {
    "fr": "Mention Bien",
    "en": "With honours (mention Bien)",
    "he": "בהצטיינות"
   }
  }
 ],
 "skills": [
  {
   "group": {
    "fr": "Automatisme industriel",
    "en": "Industrial automation",
    "he": "בקרה תעשייתית"
   },
   "items": [
    {
     "fr": "Langages CEI 61131-3 : Ladder, Grafcet (SFC), FBD, CFC",
     "en": "IEC 61131-3 languages: Ladder, SFC (Grafcet), FBD, CFC",
     "he": "שפות IEC 61131-3: Ladder, SFC (Grafcet), FBD, CFC"
    },
    {
     "fr": "CodeSys",
     "en": "CodeSys",
     "he": "CodeSys"
    },
    {
     "fr": "EcoStruxure Control Expert",
     "en": "EcoStruxure Control Expert",
     "he": "EcoStruxure Control Expert"
    },
    {
     "fr": "Vijeo Designer (IHM)",
     "en": "Vijeo Designer (HMI)",
     "he": "Vijeo Designer (HMI)"
    },
    {
     "fr": "Modbus TCP et RS485",
     "en": "Modbus TCP and RS485",
     "he": "Modbus TCP ו־RS485"
    },
    {
     "fr": "Variateurs de vitesse",
     "en": "Variable speed drives",
     "he": "ממירי תדר"
    },
    {
     "fr": "UniLogic (notions)",
     "en": "UniLogic (basics)",
     "he": "UniLogic (בסיסי)"
    },
    {
     "fr": "KNX (notions)",
     "en": "KNX (basics)",
     "he": "KNX (בסיסי)"
    }
   ]
  },
  {
   "group": {
    "fr": "Électronique et systèmes embarqués",
    "en": "Electronics and embedded systems",
    "he": "אלקטרוניקה ומערכות משובצות"
   },
   "items": [
    {
     "fr": "Arduino, ESP32",
     "en": "Arduino, ESP32",
     "he": "Arduino, ESP32"
    },
    {
     "fr": "Capteurs industriels 4–20 mA",
     "en": "Industrial 4–20 mA sensors",
     "he": "חיישנים תעשייתיים ‎4–20 mA"
    },
    {
     "fr": "Conception de PCB sous KiCad",
     "en": "PCB design in KiCad",
     "he": "תכנון מעגלים מודפסים ב־KiCad"
    },
    {
     "fr": "Soudure et câblage d'armoire",
     "en": "Soldering and cabinet wiring",
     "he": "הלחמה וחיווט לוחות"
    },
    {
     "fr": "Oscilloscope et multimètre",
     "en": "Oscilloscope and multimeter",
     "he": "אוסצילוסקופ ורב־מודד"
    },
    {
     "fr": "Dimensionnement énergétique",
     "en": "Power budgeting",
     "he": "תכנון תקציב אנרגיה"
    }
   ]
  },
  {
   "group": {
    "fr": "Programmation",
    "en": "Programming",
    "he": "תכנות"
   },
   "items": [
    {
     "fr": "Python (Pandas, NumPy)",
     "en": "Python (Pandas, NumPy)",
     "he": "Python (Pandas, NumPy)"
    },
    {
     "fr": "C et C++ (notions)",
     "en": "C and C++ (basics)",
     "he": "C ו־C++‎ (בסיסי)"
    },
    {
     "fr": "HTML, PHP, SQL (notions)",
     "en": "HTML, PHP, SQL (basics)",
     "he": "HTML, PHP, SQL (בסיסי)"
    }
   ]
  },
  {
   "group": {
    "fr": "Outils et méthodes",
    "en": "Tools and working style",
    "he": "כלים ושיטות עבודה"
   },
   "items": [
    {
     "fr": "Office 365",
     "en": "Office 365",
     "he": "Office 365"
    },
    {
     "fr": "Travail en équipe",
     "en": "Teamwork",
     "he": "עבודת צוות"
    },
    {
     "fr": "Prise en main rapide de nouveaux logiciels",
     "en": "Quick to pick up new software",
     "he": "לימוד מהיר של תוכנות חדשות"
    }
   ]
  }
 ],
 "languages": [
  {
   "name": {
    "fr": "Français",
    "en": "French",
    "he": "צרפתית"
   },
   "level": {
    "fr": "Langue maternelle",
    "en": "Native",
    "he": "שפת אם"
   }
  },
  {
   "name": {
    "fr": "Anglais",
    "en": "English",
    "he": "אנגלית"
   },
   "level": {
    "fr": "Technique",
    "en": "Technical",
    "he": "טכנית"
   }
  }
 ],
 "interests": [
  {
   "id": "scoutisme",
   "title": {
    "fr": "Scoutisme",
    "en": "Scouting",
    "he": "צופים"
   },
   "text": {
    "fr": "Responsable d'un groupe local depuis un an et animateur depuis trois ans : camps d'été de quatre semaines avec des jeunes de 11 à 17 ans.",
    "en": "Leader of a local group for the past year and camp leader for three years: four-week summer camps with 11-to-17-year-olds.",
    "he": "אחראי על קבוצה מקומית בשנה האחרונה ומדריך זה שלוש שנים: מחנות קיץ של ארבעה שבועות עם בני נוער בגילאי 11 עד 17."
   },
   "image": "images/scoutisme.jpg",
   "details": {
    "fr": "Engagement fort dans le mouvement scout depuis de nombreuses années. En tant que responsable de groupe local et animateur, je développe des compétences en leadership, gestion de groupe, organisation logistique et pédagogie. J'encadre des jeunes de 11 à 17 ans lors de camps et d'activités tout au long de l'année, en favorisant l'entraide et la vie dans la nature.",
    "en": "A strong commitment to scouting for many years. As a local group leader and camp leader I build skills in leadership, group management, logistics and teaching. I supervise 11-to-17-year-olds at camps and activities all year round, encouraging mutual help and outdoor life.",
    "he": "מחויבות עמוקה לתנועת הצופים זה שנים רבות. כאחראי על קבוצה מקומית וכמדריך אני מפתח כישורי מנהיגות, ניהול קבוצה, ארגון לוגיסטי והדרכה. אני מלווה בני נוער בגילאי 11 עד 17 במחנות ובפעילויות לאורך כל השנה, ומעודד עזרה הדדית וחיים בטבע."
   }
  },
  {
   "id": "musique",
   "title": {
    "fr": "Musique",
    "en": "Music",
    "he": "מוזיקה"
   },
   "text": {
    "fr": "Guitare classique et piano, pratiqués en groupe depuis trois ans.",
    "en": "Classical guitar and piano, played in a band for three years.",
    "he": "גיטרה קלאסית ופסנתר, בנגינה בהרכב זה שלוש שנים."
   },
   "image": "images/musique.jpg",
   "details": {
    "fr": "La musique est une passion qui me permet de développer ma créativité et mon écoute. Je pratique la guitare classique et le piano. Jouer en groupe depuis 3 ans m'a appris l'importance de la coordination, de l'écoute mutuelle et du travail collectif pour atteindre une harmonie.",
    "en": "Music is a passion that develops my creativity and my ear. I play classical guitar and piano. Three years of playing in a band have taught me how much coordination, listening to one another and collective work matter to reach harmony.",
    "he": "המוזיקה היא תשוקה שמפתחת אצלי יצירתיות והקשבה. אני מנגן בגיטרה קלאסית ובפסנתר. שלוש שנות נגינה בהרכב לימדו אותי כמה חשובים התיאום, ההקשבה ההדדית והעבודה המשותפת כדי להגיע להרמוניה."
   }
  },
  {
   "id": "sport",
   "title": {
    "fr": "Sport",
    "en": "Sport",
    "he": "ספורט"
   },
   "text": {
    "fr": "Huit ans de tennis en compétition (classé 30/0), option sport au lycée et pratique régulière.",
    "en": "Eight years of competitive tennis (French ranking 30/0), sport option in high school and regular practice.",
    "he": "שמונה שנות טניס תחרותי (דירוג צרפתי 30/0), מגמת ספורט בתיכון ופעילות קבועה."
   },
   "image": "images/sport.jpg",
   "details": {
    "fr": "Le sport fait partie intégrante de mon équilibre de vie. J'ai pratiqué le tennis en compétition pendant 8 ans, jusqu'au classement 30/0. J'ai également suivi l'option sport au lycée. Ces expériences m'ont donné le goût de l'effort, la persévérance et le fair-play.",
    "en": "Sport is an integral part of my balance. I played competitive tennis for 8 years, reaching the French 30/0 ranking, and took the sport option in high school. These experiences gave me a taste for effort, perseverance and fair play.",
    "he": "הספורט הוא חלק בלתי נפרד מהאיזון בחיי. שיחקתי טניס תחרותי במשך 8 שנים והגעתי לדירוג הצרפתי 30/0, ולמדתי גם במגמת ספורט בתיכון. החוויות האלה נטעו בי אהבה למאמץ, התמדה והגינות ספורטיבית."
   }
  }
 ],
 "skillList": [
  {
   "id": "c-cpp",
   "name": {
    "fr": "C/C++",
    "en": "C/C++",
    "he": "C/C++‎"
   },
   "level": {
    "fr": "Notions",
    "en": "Basics",
    "he": "בסיסי"
   },
   "projects": [
    "systeme-arrosage",
    "robot-detecteur-obstacles",
    "lampe-smartlight"
   ],
   "desc": {
    "fr": "Développement bas niveau pour systèmes embarqués et microcontrôleurs (Arduino, ESP32). Compréhension de la gestion mémoire et des structures de données.",
    "en": "Low-level development for embedded systems and microcontrollers (Arduino, ESP32). Understanding of memory management and data structures.",
    "he": "פיתוח ברמה נמוכה למערכות משובצות ולמיקרו־בקרים (Arduino, ESP32). הבנה של ניהול זיכרון ומבני נתונים."
   },
   "val": 50
  },
  {
   "id": "python",
   "name": {
    "fr": "Python",
    "en": "Python",
    "he": "Python"
   },
   "level": {
    "fr": "Avancé",
    "en": "Advanced",
    "he": "מתקדם"
   },
   "projects": [
    "stage-veolia"
   ],
   "desc": {
    "fr": "Scripts avancés, traitement de données et automatisation de tâches. Utilisation de bibliothèques pour l'interfaçage avec des systèmes matériels.",
    "en": "Advanced scripting, data processing and task automation. Use of libraries to interface with hardware.",
    "he": "כתיבת סקריפטים מתקדמים, עיבוד נתונים ואוטומציה של משימות. שימוש בספריות לחיבור למערכות חומרה."
   },
   "val": 60
  },
  {
   "id": "langages-automate",
   "name": {
    "fr": "Langages automate",
    "en": "PLC languages",
    "he": "שפות בקר"
   },
   "level": {
    "fr": "Avancé",
    "en": "Advanced",
    "he": "מתקדם"
   },
   "projects": [
    "station-epuration",
    "systeme-arrosage",
    "maintenance-unilogic"
   ],
   "desc": {
    "fr": "Programmation d'automates programmables industriels (API) selon la norme CEI 61131-3. Maîtrise des diagrammes Ladder, du Grafcet (SFC) et des blocs fonctionnels.",
    "en": "Programming of industrial PLCs to the IEC 61131-3 standard. Proficient with Ladder diagrams, Grafcet (SFC) and function blocks.",
    "he": "תכנות בקרים מתוכנתים תעשייתיים לפי תקן IEC 61131-3. שליטה בדיאגרמות סולם, Grafcet (SFC) ובלוקים פונקציונליים."
   },
   "val": 80
  },
  {
   "id": "electronique",
   "name": {
    "fr": "Électronique",
    "en": "Electronics",
    "he": "אלקטרוניקה"
   },
   "level": {
    "fr": "Avancé",
    "en": "Advanced",
    "he": "מתקדם"
   },
   "projects": [
    "stage-veolia",
    "station-epuration",
    "stage-enedis",
    "emetteur-recepteur-sonore",
    "robot-detecteur-obstacles",
    "lampe-smartlight",
    "maintenance-unilogic"
   ],
   "desc": {
    "fr": "Conception de circuits, soudure, choix de composants et diagnostic de pannes sur cartes électroniques.",
    "en": "Circuit design, soldering, component selection and fault-finding on electronic boards.",
    "he": "תכנון מעגלים, הלחמה, בחירת רכיבים ואיתור תקלות בכרטיסים אלקטרוניים."
   },
   "val": 70
  },
  {
   "id": "energie",
   "name": {
    "fr": "Énergie",
    "en": "Energy",
    "he": "אנרגיה"
   },
   "level": {
    "fr": "Notions",
    "en": "Basics",
    "he": "בסיסי"
   },
   "projects": [
    "station-epuration",
    "robot-detecteur-obstacles"
   ],
   "desc": {
    "fr": "Sensibilisation aux enjeux d'efficacité énergétique et conception de systèmes durables (par exemple la gestion de l'eau).",
    "en": "Awareness of energy-efficiency issues and design of sustainable systems (water management, for example).",
    "he": "מודעות לסוגיות של יעילות אנרגטית ותכנון מערכות בנות־קיימא (למשל ניהול מים)."
   },
   "val": 40
  },
  {
   "id": "robotique",
   "name": {
    "fr": "Robotique",
    "en": "Robotics",
    "he": "רובוטיקה"
   },
   "level": {
    "fr": "Avancé",
    "en": "Advanced",
    "he": "מתקדם"
   },
   "projects": [
    "robot-detecteur-obstacles"
   ],
   "desc": {
    "fr": "Asservissement de moteurs, cinématique simple et intégration de capteurs pour la navigation robotique.",
    "en": "Motor control loops, simple kinematics and sensor integration for robot navigation.",
    "he": "בקרת מנועים, קינמטיקה בסיסית ושילוב חיישנים לניווט רובוטי."
   },
   "val": 70
  },
  {
   "id": "unilogic",
   "name": {
    "fr": "UniLogic",
    "en": "UniLogic",
    "he": "UniLogic"
   },
   "level": {
    "fr": "Notions",
    "en": "Basics",
    "he": "בסיסי"
   },
   "projects": [
    "maintenance-unilogic"
   ],
   "desc": {
    "fr": "Programmation des automates Unitronics (série UniStream), qui intègrent automate et IHM.",
    "en": "Programming Unitronics PLCs (UniStream series), which combine PLC and HMI.",
    "he": "תכנות בקרי Unitronics (סדרת UniStream), המשלבים בקר וממשק מפעיל."
   },
   "val": 40
  },
  {
   "id": "php-sql",
   "name": {
    "fr": "Base de données (PHP/SQL)",
    "en": "Databases (PHP/SQL)",
    "he": "מסדי נתונים (PHP/SQL)"
   },
   "level": {
    "fr": "Notions",
    "en": "Basics",
    "he": "בסיסי"
   },
   "projects": [
    "station-epuration"
   ],
   "desc": {
    "fr": "Capacité à concevoir, interroger et manipuler des données avec SQL au sein d'applications web PHP.",
    "en": "Able to design, query and manipulate data with SQL inside PHP web applications.",
    "he": "יכולת לתכנן, לתשאל ולעבד נתונים ב־SQL בתוך יישומי אינטרנט ב־PHP."
   },
   "val": 40
  },
  {
   "id": "office-365",
   "name": {
    "fr": "Office 365",
    "en": "Office 365",
    "he": "Office 365"
   },
   "level": {
    "fr": "Professionnel",
    "en": "Professional",
    "he": "מקצועי"
   },
   "projects": [
    "stage-veolia",
    "systeme-arrosage",
    "lampe-smartlight"
   ],
   "desc": {
    "fr": "Maîtrise avancée des outils collaboratifs et bureautiques (Excel, Word, PowerPoint, Teams) pour la gestion de projets.",
    "en": "Advanced command of collaborative and office tools (Excel, Word, PowerPoint, Teams) for project work.",
    "he": "שליטה מתקדמת בכלי המשרד ושיתוף הפעולה (Excel, Word, PowerPoint, Teams) לניהול פרויקטים."
   },
   "val": 90
  },
  {
   "id": "vijeo-designer",
   "name": {
    "fr": "Vijeo Designer",
    "en": "Vijeo Designer",
    "he": "Vijeo Designer"
   },
   "level": {
    "fr": "Avancé",
    "en": "Advanced",
    "he": "מתקדם"
   },
   "projects": [
    "station-epuration",
    "systeme-arrosage"
   ],
   "desc": {
    "fr": "Conception et programmation d'interfaces IHM dynamiques pour le pilotage et la supervision de systèmes automatisés.",
    "en": "Design and programming of dynamic HMI screens to control and supervise automated systems.",
    "he": "תכנון ותכנות ממשקי מפעיל דינמיים לשליטה ולפיקוח על מערכות אוטומטיות."
   },
   "val": 70
  },
  {
   "id": "codesys-control-expert",
   "name": {
    "fr": "Codesys / Control Expert",
    "en": "Codesys / Control Expert",
    "he": "Codesys / Control Expert"
   },
   "level": {
    "fr": "Avancé",
    "en": "Advanced",
    "he": "מתקדם"
   },
   "projects": [
    "station-epuration",
    "systeme-arrosage"
   ],
   "desc": {
    "fr": "Programmation et configuration d'automates programmables industriels (API) sur les environnements standards.",
    "en": "Programming and configuring industrial PLCs in the standard environments.",
    "he": "תכנות והגדרה של בקרים תעשייתיים בסביבות הפיתוח המקובלות."
   },
   "val": 80
  },
  {
   "id": "systeme-embarque",
   "name": {
    "fr": "Système embarqué",
    "en": "Embedded systems",
    "he": "מערכות משובצות"
   },
   "level": {
    "fr": "Avancé",
    "en": "Advanced",
    "he": "מתקדם"
   },
   "projects": [
    "stage-veolia"
   ],
   "desc": {
    "fr": "Conception et intégration d'architectures électroniques autonomes multi-capteurs, gestion de l'énergie et étanchéité de systèmes embarqués.",
    "en": "Design and integration of autonomous multi-sensor electronic architectures, power management and waterproofing of embedded systems.",
    "he": "תכנון ושילוב של ארכיטקטורות אלקטרוניות אוטונומיות מרובות חיישנים, ניהול אנרגיה ואיטום של מערכות משובצות."
   },
   "val": 75
  },
  {
   "id": "adaptabilite-logicielle",
   "name": {
    "fr": "Adaptabilité logicielle",
    "en": "Software adaptability",
    "he": "הסתגלות לתוכנות"
   },
   "level": {
    "fr": "Professionnel",
    "en": "Professional",
    "he": "מקצועי"
   },
   "projects": [
    "stage-enedis",
    "lampe-smartlight",
    "maintenance-unilogic"
   ],
   "desc": {
    "fr": "Prise en main rapide et exploitation autonome de tout nouvel environnement logiciel ou outil technique.",
    "en": "Quick to pick up any new software environment or technical tool and use it independently.",
    "he": "למידה מהירה ועבודה עצמאית בכל סביבת תוכנה או כלי טכני חדש."
   },
   "val": 90
  },
  {
   "id": "travail-en-equipe",
   "name": {
    "fr": "Travail en équipe",
    "en": "Teamwork",
    "he": "עבודת צוות"
   },
   "level": {
    "fr": "Professionnel",
    "en": "Professional",
    "he": "מקצועי"
   },
   "projects": [
    "station-epuration",
    "stage-enedis",
    "emetteur-recepteur-sonore",
    "robot-detecteur-obstacles",
    "maintenance-unilogic"
   ],
   "desc": {
    "fr": "Capacité à collaborer efficacement, à communiquer clairement et à coordonner des actions au sein d'un groupe projet.",
    "en": "Able to collaborate effectively, communicate clearly and coordinate work within a project group.",
    "he": "יכולת לשתף פעולה ביעילות, לתקשר בבהירות ולתאם פעולות בתוך צוות פרויקט."
   },
   "val": 90
  }
 ]
};
