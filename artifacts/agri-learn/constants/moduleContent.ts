export interface LessonSection {
  type: "heading" | "paragraph" | "tip" | "warning" | "steps" | "bullets" | "highlight";
  text?: string;
  items?: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
  video_url: string;
  sections: LessonSection[];
  quiz: QuizQuestion[];
}

export interface CourseModule {
  moduleId: string;
  lessons: Lesson[];
}

const VIDEOS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
];

export const MODULE_COURSES: CourseModule[] = [
  {
    moduleId: "1",
    lessons: [
      {
        id: "1-1",
        title: "Site Selection & Soil Preparation",
        description: "Choose the right location and prepare healthy soil for a strong tomato crop.",
        duration_seconds: 480,
        video_url: VIDEOS[0],
        sections: [
          { type: "heading", text: "Choosing the Right Site" },
          { type: "paragraph", text: "Tomatoes need a minimum of 6–8 hours of direct sunlight daily. Choose a south-facing slope where possible and protect from prevailing winds using a windbreak or shade cloth on the windward side. Avoid low-lying areas that collect cold air or standing water." },
          { type: "bullets", items: ["6–8 hours direct sunlight per day", "Sheltered from strong south-westerly winds", "Slope for natural drainage — never flat boggy ground", "Within reach of a reliable water source", "Away from other Solanaceae crops (potatoes, peppers, eggplant)"] },
          { type: "heading", text: "Understanding Your Soil" },
          { type: "paragraph", text: "Tomatoes perform best in a deep, well-drained loam with a pH between 6.0 and 6.8. In South Africa, many red sandy soils are too acidic (pH 5.2–5.5) and need lime before planting. Clay-heavy soils in the Highveld need organic matter incorporated to improve drainage and aeration." },
          { type: "tip", text: "Buy a simple pH test kit from your local co-op (about R45). Take 5–8 samples at 20 cm depth, mix them together, and test. Do this 2–3 months before planting so you have time to adjust." },
          { type: "heading", text: "Preparing the Bed" },
          { type: "steps", items: ["Clear all weeds and old crop debris — do not leave on the surface", "Deep-till to 40 cm using a fork or ripper to break up compaction", "Add 3–4 kg of mature compost per square metre and mix in thoroughly", "If pH is below 6.0, apply agricultural lime at 1–2 kg per 10 m² and water in", "Form raised beds 1.2 m wide to allow easy access without compacting soil", "Leave beds to settle for at least two weeks before planting"] },
          { type: "heading", text: "Choosing the Right Variety for SA Conditions" },
          { type: "highlight", text: "Best SA varieties: Moneymaker (budget-friendly, widely available), Floradade (heat and crack resistant), Roma VF (great for processing and drying), STAR 9009F1 (hybrid, high yield for commercial growers)." },
          { type: "warning", text: "Never use fresh manure within 3 months of planting — it burns roots and introduces harmful pathogens. Only fully composted manure is safe." },
        ],
        quiz: [
          { question: "What is the ideal soil pH range for growing tomatoes?", options: ["4.5 – 5.5", "6.0 – 6.8", "7.5 – 8.0", "5.0 – 5.8"], correct: 1, explanation: "Tomatoes prefer a slightly acidic pH of 6.0–6.8. Outside this range, nutrients become locked up in the soil and unavailable to the plant." },
          { question: "How deep should you till the soil when preparing a tomato bed?", options: ["10 cm", "20 cm", "40 cm", "60 cm"], correct: 2, explanation: "Tilling to 40 cm breaks compaction and allows the tomato's deep root system to establish fully, accessing water and nutrients from the subsoil." },
          { question: "Which of the following should you avoid planting near tomatoes?", options: ["Maize", "Beans", "Potatoes", "Onions"], correct: 2, explanation: "Tomatoes and potatoes are both Solanaceae (nightshade family) and share the same diseases and pests. Planting them near each other or in rotation increases disease pressure." },
        ],
      },
      {
        id: "1-2",
        title: "Planting & Caring for Your Crop",
        description: "Transplant seedlings correctly and keep your tomatoes thriving through the season.",
        duration_seconds: 600,
        video_url: VIDEOS[1],
        sections: [
          { type: "heading", text: "Raising Healthy Seedlings" },
          { type: "paragraph", text: "Sow tomato seed 6–8 weeks before your intended transplant date. Use a sterile seedling mix in trays — never garden soil, which harbours damping-off fungi. Sow at 5 mm depth, water gently, and keep at 25–28°C. Germination takes 7–10 days. Thin to one seedling per cell once the first true leaves appear." },
          { type: "tip", text: "Harden off seedlings for 7–10 days before transplanting: move trays outside into dappled shade each morning and bring in before sunset. This reduces transplant shock by 60–70%." },
          { type: "heading", text: "Transplanting" },
          { type: "steps", items: ["Water seedlings thoroughly 2 hours before transplanting", "Dig holes 60 cm apart in rows 1.2 m apart", "Plant deeply — bury the stem up to the lowest leaves (tomatoes root along the buried stem)", "Firm the soil around the base and create a small watering basin around each plant", "Water immediately with 500 ml per plant", "Apply a light layer of mulch (straw or dry grass) to conserve moisture"] },
          { type: "heading", text: "Staking & Trellising" },
          { type: "paragraph", text: "Indeterminate varieties (like Moneymaker) grow continuously and must be staked or trellised. Install 1.8 m wooden stakes or T-bar end posts with wire at 30 cm, 60 cm, 90 cm, and 120 cm from the ground. Tie plants loosely with plant tape or strips of old hose." },
          { type: "heading", text: "Watering — The Most Critical Factor" },
          { type: "paragraph", text: "Inconsistent watering is the number one cause of blossom end rot and cracking in tomatoes. Aim for 25–30 mm of water per week, applied evenly. Drip irrigation is ideal. If using hand watering, water deeply twice a week rather than lightly every day." },
          { type: "warning", text: "Never wet the foliage when watering — this spreads bacterial speck and early blight. Always water at the base of the plant in the morning so the soil surface can dry before nightfall." },
          { type: "heading", text: "Fertilising" },
          { type: "bullets", items: ["At planting: 2:3:2 (22) at 30 g per plant, mixed into the hole", "3 weeks after transplanting: LAN (28% N) at 15 g per plant side-dressed 10 cm from stem", "When first flowers open: switch to a high-K fertiliser (3:1:5 ratio) to support fruit set", "Every 3 weeks through fruiting: foliar feed with diluted seaweed or fish emulsion"] },
        ],
        quiz: [
          { question: "Why do you plant tomato seedlings deeply, burying part of the stem?", options: ["To prevent wind rock", "Because tomatoes root along the buried stem", "To keep the plant cool", "To reduce watering needs"], correct: 1, explanation: "Tomatoes form adventitious roots along any part of the stem that is buried. Planting deeply gives the plant a larger root system, improving drought tolerance and nutrient uptake." },
          { question: "How much water do tomatoes need per week?", options: ["5–10 mm", "15–20 mm", "25–30 mm", "50–60 mm"], correct: 2, explanation: "Tomatoes need 25–30 mm of water per week, applied consistently. Fluctuating moisture causes physiological disorders like blossom end rot and fruit cracking." },
          { question: "When should you switch to a high-potassium fertiliser?", options: ["At transplanting", "After 4 weeks of growth", "When first flowers open", "After first harvest"], correct: 2, explanation: "Once flowers open, the plant's nutritional demand shifts from leafy growth (nitrogen) to fruit development. High-potassium fertilisers improve fruit size, quality, and shelf life." },
        ],
      },
      {
        id: "1-3",
        title: "Pest Control & Harvesting",
        description: "Identify and manage key tomato pests, and harvest at peak quality for maximum returns.",
        duration_seconds: 420,
        video_url: VIDEOS[2],
        sections: [
          { type: "heading", text: "The 4 Pests You Must Know" },
          { type: "bullets", items: ["Tomato leafminer (Tuta absoluta): Tiny white tunnels inside leaves; use pheromone traps + Spinosad spray", "Aphids: Clusters on growing tips; wash off with soapy water, introduce ladybirds", "Whitefly: Yellowing leaves + sticky honeydew; use yellow sticky traps + neem oil", "Bollworm (Helicoverpa armigera): Eats into fruit; spray with Bt (Bacillus thuringiensis) when eggs are seen"] },
          { type: "tip", text: "Walk your field every Monday morning and record what you find. Early detection reduces pesticide costs by 80%. Treat when you exceed the action threshold — not before." },
          { type: "heading", text: "Controlling Fungal Diseases" },
          { type: "paragraph", text: "Early blight (Alternaria solani) appears as dark brown spots with yellow halos on older leaves. Septoria leaf spot creates small circular spots with dark borders. Both spread rapidly in humid conditions." },
          { type: "steps", items: ["Remove and burn affected leaves — never compost diseased material", "Apply copper oxychloride spray preventively every 14 days during wet seasons", "Maintain good airflow by removing suckers and tying up plants", "Mulch the soil surface to prevent spore splash-up from the ground"] },
          { type: "heading", text: "Harvesting at the Right Time" },
          { type: "paragraph", text: "Tomatoes for fresh market should be harvested at the breaker stage — when 30–50% of the surface has turned pink or red. They will ripen fully off the vine. For home use, harvest fully red. Check colour at the blossom end (bottom of the fruit) first — it colours before the shoulder." },
          { type: "highlight", text: "Yield guide: A well-managed indeterminate variety should produce 4–6 kg per plant per season. A 100 m² plot with 60 plants should yield 240–360 kg — enough to earn R2,400–R3,600 at R10/kg farm gate." },
          { type: "heading", text: "Post-Harvest Handling" },
          { type: "bullets", items: ["Harvest in the cool of morning or late afternoon — never in midday heat", "Use plastic crates, not hessian bags which bruise fruit", "Sort on-farm: remove cracked, split, or diseased fruit immediately", "Store at 13–15°C (never in a cold room below 10°C — cold damage ruins flavour)", "Shelf life: breaker-stage fruit lasts 10–14 days at 13°C"] },
        ],
        quiz: [
          { question: "Which biological spray is most effective against bollworm in tomatoes?", options: ["Copper oxychloride", "Neem oil", "Bacillus thuringiensis (Bt)", "Spinosad"], correct: 2, explanation: "Bt (Bacillus thuringiensis) is a naturally occurring soil bacterium that produces proteins toxic specifically to caterpillars (lepidopteran larvae) like bollworm, without harming beneficial insects, humans, or animals." },
          { question: "At what stage should tomatoes be harvested for fresh market?", options: ["Fully green", "Breaker stage (30–50% colour change)", "Fully red on the vine", "After the first frost"], correct: 1, explanation: "Harvesting at breaker stage allows the fruit to ripen off the vine, extending shelf life and giving flexibility for transport. Fully red tomatoes have a much shorter shelf life after harvest." },
          { question: "What is the minimum safe storage temperature for tomatoes?", options: ["4°C", "7°C", "10°C", "13°C"], correct: 3, explanation: "Tomatoes suffer chilling injury below 10°C. The ideal storage temperature is 13–15°C. Never store tomatoes in a cold room set for other vegetables — the cold permanently destroys their flavour and texture." },
        ],
      },
    ],
  },
  {
    moduleId: "2",
    lessons: [
      {
        id: "2-1",
        title: "Varieties, Soil & Bed Preparation",
        description: "Choose the right spinach variety and prepare a productive growing bed.",
        duration_seconds: 360,
        video_url: VIDEOS[3],
        sections: [
          { type: "heading", text: "Choosing Your Spinach Type" },
          { type: "paragraph", text: "In South Africa, three types of spinach are grown commercially: true spinach (Spinacia oleracea), Swiss chard (Beta vulgaris var. cicla) — often called 'spinach' in SA — and New Zealand spinach (Tetragonia tetragonioides) for summer heat. Swiss chard is the most widely grown due to its heat tolerance and continuous harvest capability." },
          { type: "highlight", text: "Recommended varieties: Fordhook Giant (chard, large-leafed, productive), Rainbow Chard (colourful stems, high market value), Viroflay (true spinach, fast-growing, cool season), Perpetual Spinach (beet-leaf, best for year-round production)." },
          { type: "heading", text: "Soil Requirements" },
          { type: "paragraph", text: "Spinach and chard prefer a fertile, moisture-retentive soil with a pH of 6.2–7.0. They are heavy nitrogen feeders. Sandy soils need 4–5 kg of compost per m² to retain moisture. Clay soils need gypsum (1 kg per 5 m²) to improve drainage and prevent root rot." },
          { type: "tip", text: "Spinach is one of the best crops for recycling kitchen waste compost. It responds dramatically to high-organic-matter soils — leaves become large, dark green, and productive." },
          { type: "heading", text: "Preparing the Bed" },
          { type: "steps", items: ["Mark out beds 1.0–1.2 m wide — you should be able to reach the centre from either side", "Fork to 30 cm depth and break up all clods", "Incorporate 4 kg of mature compost per square metre", "Broadcast 2:3:2 fertiliser at 60 g per m² and rake in", "Form a level, fine seedbed — spinach seed is small and needs firm contact with the soil", "Water the bed thoroughly 24 hours before sowing to settle the soil"] },
          { type: "warning", text: "Spinach is extremely sensitive to waterlogging. If water pools on your bed for more than 30 minutes after rain, raise the bed by 15–20 cm or add a drainage channel at the base." },
        ],
        quiz: [
          { question: "Which spinach type is most widely grown commercially in South Africa?", options: ["True spinach (Spinacia oleracea)", "Swiss chard (Beta vulgaris)", "New Zealand spinach", "All three equally"], correct: 1, explanation: "Swiss chard is most widely grown in SA because it tolerates the summer heat far better than true spinach, produces continuously, and is what most South Africans recognise as 'spinach' in the market." },
          { question: "What is the ideal soil pH range for growing spinach?", options: ["5.0–5.5", "5.5–6.0", "6.2–7.0", "7.5–8.0"], correct: 2, explanation: "Spinach performs best at pH 6.2–7.0. Below pH 6.0, manganese and aluminium become toxic at levels that stunt growth. Above 7.5, iron and zinc become unavailable." },
          { question: "How much compost should be added per square metre for sandy soil?", options: ["1 kg", "2 kg", "4–5 kg", "10 kg"], correct: 2, explanation: "Sandy soils need 4–5 kg of compost per m² to improve water retention and provide nutrients. Sandy soils drain too quickly for spinach, which needs consistent moisture to produce tender, non-bitter leaves." },
        ],
      },
      {
        id: "2-2",
        title: "Sowing, Thinning & Growing",
        description: "Direct seed correctly and manage your crop through its growing phase.",
        duration_seconds: 420,
        video_url: VIDEOS[4],
        sections: [
          { type: "heading", text: "Direct Sowing Technique" },
          { type: "paragraph", text: "Spinach and chard are almost always direct-seeded — they do not transplant well once roots are disturbed. Sow seeds 1 cm deep in rows spaced 30 cm apart. Place 2–3 seeds every 15 cm. Chard seeds are actually a cluster of 2–4 seeds in a dried fruit — multiple seedlings will emerge from each 'seed'." },
          { type: "steps", items: ["Draw seed furrows 1 cm deep with a stick or the edge of a hoe", "Sow 2–3 seeds every 15 cm along the furrow", "Cover lightly and tamp down firmly with the back of your hand", "Water gently with a rose head — never a hard stream that washes seeds out", "Keep the soil surface moist until germination (7–14 days)"] },
          { type: "tip", text: "Soak chard seeds in water for 24 hours before sowing. This softens the seed coat and improves germination rate from about 60% to over 85%." },
          { type: "heading", text: "Thinning — The Most Neglected Step" },
          { type: "paragraph", text: "Thinning is critical but most small-scale farmers skip it. Overcrowded spinach produces small, stressed, disease-prone plants. When seedlings reach 5 cm tall, thin to the strongest plant every 20–25 cm. The thinned seedlings can be eaten immediately as microgreens." },
          { type: "warning", text: "Do not pull out thinned seedlings — this disturbs roots of adjacent plants. Use scissors to cut them off at soil level." },
          { type: "heading", text: "Fertilising Through the Season" },
          { type: "bullets", items: ["3 weeks after germination: side-dress with LAN at 20 g per metre of row (10 cm from stems)", "Every 3–4 weeks: repeat LAN top-dressing to maintain fast leafy growth", "Yellowing of older leaves = nitrogen deficiency, apply LAN immediately", "Purple tints on leaves = phosphorus deficiency, apply superphosphate in diluted form", "Foliar spray with diluted fish emulsion every 2 weeks boosts leaf size and colour"] },
          { type: "heading", text: "Watering for Best Quality" },
          { type: "paragraph", text: "Keep soil consistently moist but never waterlogged. Spinach that dries out between waterings produces bitter, tough leaves. In summer, water every 2 days; in winter, every 3–4 days. Apply water in the morning to reduce fungal disease risk." },
        ],
        quiz: [
          { question: "Why is spinach mostly direct-seeded rather than transplanted?", options: ["It is cheaper", "The seeds are too small to transplant", "Transplanting disturbs roots and causes bolting", "Spinach cannot be grown from seedlings"], correct: 2, explanation: "Spinach has a taproot that is easily damaged during transplanting. Root disturbance causes the plant to bolt (flower and go to seed prematurely), making the leaves bitter and unusable." },
          { question: "What is the correct thinning spacing for spinach?", options: ["5 cm apart", "10 cm apart", "20–25 cm apart", "50 cm apart"], correct: 2, explanation: "Thinning to 20–25 cm between plants gives each spinach plant enough space to develop a full-sized head without competition for light, water, or nutrients." },
          { question: "What does purple tinting on spinach leaves indicate?", options: ["Potassium deficiency", "Nitrogen deficiency", "Phosphorus deficiency", "Iron deficiency"], correct: 2, explanation: "Purple or reddish tints on spinach leaves are a classic sign of phosphorus deficiency. Phosphorus is needed for energy transfer and root development. Apply superphosphate or bone meal." },
        ],
      },
      {
        id: "2-3",
        title: "Harvesting for Continuous Supply",
        description: "Use cut-and-come-again harvesting to keep your spinach producing for months.",
        duration_seconds: 300,
        video_url: VIDEOS[5],
        sections: [
          { type: "heading", text: "When to Harvest" },
          { type: "paragraph", text: "Spinach is ready to harvest 6–8 weeks after sowing when leaves are 15–20 cm long. Swiss chard can be harvested slightly larger. The key is to harvest before the central leaves start standing upright — that signals the plant is about to bolt." },
          { type: "tip", text: "Harvest in the early morning when leaves contain the most moisture. They will be crisp and have the longest shelf life." },
          { type: "heading", text: "Cut-and-Come-Again Technique" },
          { type: "paragraph", text: "The most productive method for small-scale farming is cut-and-come-again: remove the outer, older leaves first, leaving the young central leaves and growing point intact. The plant regenerates and produces new leaves within 2–3 weeks. A well-managed bed can be harvested 6–8 times before replanting." },
          { type: "steps", items: ["Grasp 3–4 outer leaves together at the base", "Snap or cut cleanly 2–3 cm above the soil — do not tear", "Leave the 4–6 youngest central leaves completely untouched", "After harvesting, immediately top-dress with LAN at 10 g per metre of row", "Water in the fertiliser within an hour of application", "Mark the date — next harvest will be ready in 14–21 days"] },
          { type: "heading", text: "Post-Harvest Handling" },
          { type: "bullets", items: ["Bundle immediately — 500 g or 1 kg bundles sell best at informal markets", "Stand cut ends in cool water for 2 hours to rehydrate after harvest", "Store in a cool, humid environment — not in an open crate in the sun", "Do not wash before storage — wet leaves rot quickly", "Shelf life: 5–7 days at 4–5°C; 2–3 days at room temperature"] },
          { type: "heading", text: "Replanting Strategy" },
          { type: "highlight", text: "Succession planting tip: Sow a new bed every 3–4 weeks so you always have spinach at different stages. With 3 beds of 10 m², you can harvest fresh spinach every week of the year — a steady income stream with low input cost." },
          { type: "warning", text: "When plants start to bolt (send up a central flower stalk), remove them immediately. Bolted plants become bitter, tie up nutrients in the bed, and produce seeds that self-sow as weeds." },
        ],
        quiz: [
          { question: "What is the cut-and-come-again harvesting method?", options: ["Cutting the entire plant at once", "Removing outer leaves while leaving young central leaves intact", "Harvesting every leaf every week", "Only harvesting every 6 weeks"], correct: 1, explanation: "Cut-and-come-again involves harvesting only the outer, older leaves while leaving the growing centre intact. This allows the plant to regrow and be harvested multiple times — typically 6–8 harvests per planting." },
          { question: "What does it mean when spinach leaves begin standing upright in the centre?", options: ["The plant needs more water", "The plant is about to bolt", "The plant needs fertiliser", "The leaves are ready for the first harvest"], correct: 1, explanation: "When the central leaves start standing upright and elongating, the plant is transitioning from vegetative to reproductive growth (bolting). Harvest immediately — leaves will become bitter within days." },
          { question: "How long does fresh spinach last at room temperature?", options: ["2–3 days", "5–7 days", "10–14 days", "3–4 weeks"], correct: 0, explanation: "Spinach has a very high respiration rate and wilts quickly at ambient temperature. It lasts only 2–3 days at room temperature but up to 7 days at 4–5°C with high humidity." },
        ],
      },
    ],
  },
  {
    moduleId: "3",
    lessons: [
      {
        id: "3-1",
        title: "Seed Potatoes & Soil Preparation",
        description: "Select certified seed potatoes and prepare deep, fertile soil for a strong crop.",
        duration_seconds: 480,
        video_url: VIDEOS[0],
        sections: [
          { type: "heading", text: "Why Seed Potatoes Matter" },
          { type: "paragraph", text: "Never plant potatoes from the supermarket — these are often treated with sprout inhibitors and carry diseases. Always buy certified seed potatoes from an accredited supplier (ARC, Seed Co, or your provincial agricultural department). Certified seed is tested for virus, bacterial wilt, and nematodes." },
          { type: "highlight", text: "Best SA varieties: Mondial (early, high yield, popular for chips), Up-to-Date (versatile, good for boiling), BP1 (disease resistant, Highveld standard), Fianna (excellent for crisps), Valor (main-season, stores well)." },
          { type: "heading", text: "Chitting Your Seed Potatoes" },
          { type: "paragraph", text: "Chitting is the process of allowing seed potatoes to sprout before planting. Lay tubers in a single layer in a bright, cool room (15–18°C) for 3–6 weeks before planting. Each tuber should develop 2–3 strong, dark-green sprouts about 2 cm long. This reduces time to emergence by 7–10 days." },
          { type: "tip", text: "Cut large seed potatoes (over 80 g) into pieces with at least 2 eyes each. Dust the cut surfaces with wood ash or sulphur powder and leave to cure for 48 hours before planting — this prevents rotting." },
          { type: "heading", text: "Soil Requirements" },
          { type: "paragraph", text: "Potatoes need a deep (45 cm), loose, well-drained soil with a pH of 5.0–6.0. They are unusual in preferring a slightly acidic soil — this helps suppress common scab disease. If your soil tests above pH 6.5, do not add lime before a potato crop." },
          { type: "steps", items: ["Deep rip or fork to 45 cm — potatoes need room to expand", "Incorporate 3–4 kg compost per m² plus 60 g superphosphate per m²", "Form raised ridges 25–30 cm high and 75 cm apart (centre to centre)", "The ridge profile should be flat on top — not pointed like a roof"] },
          { type: "warning", text: "Potatoes grown in compacted soil produce misshapen, stunted tubers. If you cannot easily push a garden fork to 40 cm depth, the soil is too compacted for a good potato crop." },
        ],
        quiz: [
          { question: "Why should you never plant supermarket potatoes as seed?", options: ["They are too expensive", "They are often treated with sprout inhibitors and carry diseases", "They produce only small tubers", "They need a different climate"], correct: 1, explanation: "Supermarket potatoes are treated with chemicals to prevent sprouting during storage. They also commonly carry viruses and bacterial diseases that will infect your entire crop and soil for years." },
          { question: "What is the ideal soil pH range for potatoes?", options: ["4.0–4.5", "5.0–6.0", "6.5–7.5", "7.0–8.0"], correct: 1, explanation: "Potatoes prefer slightly acidic soil at pH 5.0–6.0. This range helps suppress common scab (Streptomyces scabies), which thrives in neutral to alkaline soils. Do not lime before growing potatoes." },
          { question: "What is the purpose of chitting seed potatoes before planting?", options: ["To clean the surface", "To check for diseases", "To develop sprouts and reduce emergence time", "To increase the number of eyes"], correct: 2, explanation: "Chitting allows the seed potato to develop strong, light-conditioned sprouts before planting. This reduces time to emergence by 7–10 days and gives the plant a head start on the growing season." },
        ],
      },
      {
        id: "3-2",
        title: "Planting, Hilling & Watering",
        description: "Plant at the right depth, hill correctly, and manage water for maximum tuber development.",
        duration_seconds: 540,
        video_url: VIDEOS[1],
        sections: [
          { type: "heading", text: "Planting Depth & Spacing" },
          { type: "paragraph", text: "Plant seed potatoes 10–12 cm deep on top of the ridge, spaced 30 cm apart in the row. Rows should be 75 cm apart. Deeper planting (up to 15 cm) is better in hot, dry climates as it protects developing tubers from light and heat." },
          { type: "heading", text: "Hilling — The Most Important Potato Practice" },
          { type: "paragraph", text: "Hilling means drawing soil up around the base of potato plants as they grow. This is the single most important cultural practice for potatoes. Tubers that are exposed to light turn green and produce solanine — a toxic alkaloid that causes illness. Hilling also promotes more tuber formation along the buried stem." },
          { type: "steps", items: ["First hilling: when plants are 15–20 cm tall, draw soil up to leave only 5–8 cm of the top exposed", "Second hilling: 3 weeks later, hill again to maintain a ridge 25–30 cm high", "Final check: before any tubers could emerge, ensure all soil is firm and ridges are intact", "After rain or irrigation, check ridges for washing and repair as needed"] },
          { type: "tip", text: "Add compost to the hill during the second hilling rather than plain soil. The extra organic matter creates ideal conditions for tuber formation — loose, cool, and moisture-retentive." },
          { type: "heading", text: "Critical Watering Periods" },
          { type: "bullets", items: ["Planting to emergence: keep moist but not wet — soil temperature matters more than moisture", "Emergence to flowering: increase watering; this is the main vegetative growth phase", "Flowering to tuber bulking: most critical period — never let soil dry out; 30–40 mm per week", "Last 2–3 weeks before harvest: reduce water to harden skins and extend storage life"] },
          { type: "warning", text: "Waterlogging during tuber bulking causes lenticel enlargement — small raised bumps on potato skin — and dramatically increases the risk of blackleg disease and rotting. Install drainage channels on all sides of potato beds." },
          { type: "heading", text: "Fertilising Potatoes" },
          { type: "paragraph", text: "Potatoes are heavy feeders. Apply 3:2:1 (25) at 80 g per metre of row at planting, mixed into the ridge. Side-dress with LAN (28% N) at 20 g per metre 3 weeks after emergence. A third application of potassium fertiliser (0:0:50 or LKS) at 15 g per metre when flowering begins greatly improves tuber yield and quality." },
        ],
        quiz: [
          { question: "Why do potatoes turn green when exposed to light?", options: ["It is a sign of ripeness", "Chlorophyll production — harmless", "Solanine production — toxic alkaloid", "Iron deficiency"], correct: 2, explanation: "Light triggers solanine production in potato tubers — a bitter, toxic glycoalkaloid that can cause illness if eaten in large quantities. Green potatoes must never be eaten. Hilling prevents this by keeping tubers covered." },
          { question: "When is the most critical watering period for potatoes?", options: ["Planting to emergence", "Emergence to first hilling", "Flowering to tuber bulking", "Two weeks before harvest"], correct: 2, explanation: "The flowering to tuber bulking phase is when tubers are actively filling with starch and water. Moisture stress during this period causes small, misshapen tubers and can reduce yield by 30–50%." },
          { question: "What do you add during the second hilling to improve tuber formation?", options: ["Sand", "Compost", "Lime", "Superphosphate"], correct: 1, explanation: "Adding compost during the second hilling creates loose, organic-rich material around the developing tubers. Loose soil allows tubers to expand without resistance, while organic matter retains moisture and moderates soil temperature." },
        ],
      },
      {
        id: "3-3",
        title: "Harvesting & Storing Potatoes",
        description: "Know when to harvest and how to cure and store potatoes for maximum shelf life.",
        duration_seconds: 420,
        video_url: VIDEOS[2],
        sections: [
          { type: "heading", text: "Signs of Maturity" },
          { type: "paragraph", text: "Potatoes are ready to harvest when the foliage turns yellow and begins to die back naturally — typically 90–120 days after planting depending on variety. For new potatoes (small, thin-skinned), you can harvest 2–3 weeks earlier by carefully digging around one plant." },
          { type: "tip", text: "Test skin set before harvesting for storage: rub the potato surface firmly with your thumb. If the skin slides off easily, the tubers need another 7–10 days. If the skin is firm and does not slide, they are ready to harvest and store." },
          { type: "heading", text: "Harvesting Method" },
          { type: "steps", items: ["Stop watering 2 weeks before harvest to allow skins to harden", "Cut or pull dead foliage off at soil level 10 days before harvest", "Use a fork, not a spade — insert 20 cm away from the plant base to avoid skewering tubers", "Lift the entire ridge and gather all tubers — even tiny ones left behind sprout as volunteers", "Leave tubers on the soil surface for 2–3 hours to dry (not in direct sun)", "Sort immediately: separate bruised, cut, and diseased tubers for immediate consumption"] },
          { type: "heading", text: "Curing" },
          { type: "paragraph", text: "Curing is essential for long storage. Store freshly harvested potatoes in a dark, well-ventilated space at 15–18°C and 85–90% humidity for 10–14 days. During curing, wounds heal over (suberisation) and skins thicken, dramatically extending shelf life." },
          { type: "heading", text: "Long-Term Storage" },
          { type: "bullets", items: ["Store in crates or hessian bags — never plastic bags (promotes rotting)", "Ideal storage: dark room at 7–10°C, 85–90% humidity, good airflow", "Check monthly for rotting — one rotten tuber spreads quickly ('one bad apple' principle)", "Do not store near apples, pears, or bananas — ethylene gas promotes sprouting", "Well-cured storage varieties (Valor, Up-to-Date) keep for 4–6 months"] },
          { type: "highlight", text: "Yield benchmark: A well-managed 100 m² potato plot (130+ plants) should produce 400–600 kg. At R8–R12/kg wholesale, this is R3,200–R7,200 gross return from 100 m² — one of the highest returns per square metre in SA smallholder farming." },
        ],
        quiz: [
          { question: "How do you test whether potato skins are set for storage?", options: ["Check the foliage colour", "Rub the skin firmly with your thumb — set skin does not slide", "Cut one open and check the flesh colour", "Weigh them individually"], correct: 1, explanation: "Rubbing the skin is the standard test for skin set. Unset skins (slide easily) mean the potato is still immature and will shrivel and rot in storage. Set skins (firm, do not slide) indicate mature, storable tubers." },
          { question: "What is the purpose of curing potatoes after harvest?", options: ["To clean the skin", "To reduce moisture content", "To heal wounds and thicken skins for long-term storage", "To convert starch to sugar for better flavour"], correct: 2, explanation: "Curing causes suberisation — a process where wounds are sealed with a corky layer and the skin thickens. Uncured potatoes have thin, easily damaged skins that allow moisture loss and fungal infection during storage." },
          { question: "What is the ideal long-term storage temperature for potatoes?", options: ["0–2°C", "4–6°C", "7–10°C", "15–18°C"], correct: 2, explanation: "The ideal long-term storage temperature is 7–10°C. Below 7°C, starch converts to sugar, making potatoes sweet and unsuitable for chips or crisps. Above 12°C, sprouting accelerates dramatically." },
        ],
      },
    ],
  },
  {
    moduleId: "4",
    lessons: [
      {
        id: "4-1",
        title: "Bed Preparation & Variety Selection",
        description: "Create the deep, stone-free bed carrots need and choose the right variety for your market.",
        duration_seconds: 360,
        video_url: VIDEOS[3],
        sections: [
          { type: "heading", text: "What Carrots Need from Soil" },
          { type: "paragraph", text: "Carrots are a root crop that grows straight and smooth only in deep, loose, stone-free soil. Any obstacle — a stone, clod, or hard layer — causes the root to fork, twist, or develop 'hairy' roots. The soil must be free of large organic matter too: fresh compost or manure causes the same forking as stones." },
          { type: "highlight", text: "Recommended SA varieties: Chantenay Red Core (short, tolerates heavy soils, good for home gardens), Nantes (cylindrical, sweet, main commercial variety), Kuroda (orange, heat-tolerant, summer cropping), Autumn King (long, excellent for cooler regions)." },
          { type: "heading", text: "Deep Bed Preparation" },
          { type: "steps", items: ["Fork or rip to a depth of 45 cm — this is non-negotiable for straight carrots", "Remove every stone larger than 1 cm — sieve the top 20 cm if necessary", "Break up all clods to a fine, crumbly texture — carrots cannot grow through hard lumps", "Add aged compost from previous season only (not fresh) at 2 kg per m² and mix in", "Add superphosphate at 40 g per m² for root development", "DO NOT add nitrogen fertiliser at this stage — it causes excessive leaf growth at expense of roots"] },
          { type: "warning", text: "Fresh compost or green manure in a carrot bed causes hairy, forked, unmarkable roots. Only apply well-rotted, dark-brown compost made at least 6 months previously." },
          { type: "heading", text: "Raised Bed Advantage" },
          { type: "paragraph", text: "Raised beds (25–30 cm high) are ideal for carrots in SA. They provide the deep, well-drained root run carrots need and warm up faster in spring for early sowing. In Highveld red clay soils, raised beds are essentially mandatory for producing straight, marketable carrots." },
        ],
        quiz: [
          { question: "What is the main cause of forked or twisted carrot roots?", options: ["Too much watering", "Stones, clods, or fresh organic matter in the soil", "Too much fertiliser", "Incorrect spacing"], correct: 1, explanation: "Carrot roots grow straight down by following the path of least resistance. Any physical obstacle — stone, clod, or fresh organic matter — causes the growing tip to deflect, producing forked or twisted roots that are difficult to sell." },
          { question: "Why should you NOT apply nitrogen fertiliser to a carrot bed at planting?", options: ["Nitrogen makes carrots bitter", "Nitrogen causes excessive leaf growth at the expense of root development", "Nitrogen raises soil pH", "Nitrogen burns carrot seeds"], correct: 1, explanation: "High nitrogen encourages vegetative (leaf) growth. For root crops like carrots, you want the plant's energy directed into root development. Nitrogen at planting produces large, lush tops and small, poor roots." },
          { question: "What is the minimum depth you should prepare soil for carrots?", options: ["15 cm", "25 cm", "35 cm", "45 cm"], correct: 3, explanation: "Carrot roots need at least 45 cm of loose, obstacle-free soil to develop straight, full-length roots. Shallower soil preparation forces roots to bend or stop growing when they hit compaction." },
        ],
      },
      {
        id: "4-2",
        title: "Sowing, Thinning & Watering",
        description: "Master the critical skills of carrot germination, thinning, and water management.",
        duration_seconds: 420,
        video_url: VIDEOS[4],
        sections: [
          { type: "heading", text: "Sowing Carrot Seed" },
          { type: "paragraph", text: "Carrot seeds are extremely small and difficult to space accurately. The standard approach is to sow thinly in a shallow furrow and thin later. Draw furrows 2–3 mm deep, spaced 25 cm apart. Mix seed with dry sand (1 part seed: 4 parts sand) to help spread it evenly." },
          { type: "tip", text: "A simple seed spacer: take a toilet roll, punch holes 3 cm apart along it, fill with seed-and-sand mix, and roll it along the furrow. This gives more even distribution than hand-sprinkling and makes thinning easier." },
          { type: "heading", text: "Germination — The Critical 14 Days" },
          { type: "paragraph", text: "Carrot seed germinates slowly and the seedbed must remain moist for the entire 10–14 day germination period. If the surface dries out even once, germination can drop by 50–70%. In hot, dry weather, lay a thin layer of hessian or shade cloth over the bed until the first green shoots appear." },
          { type: "bullets", items: ["Germination temperature: 15–25°C (optimal 20°C)", "Keep surface moist with gentle watering twice daily until emergence", "Never allow a hard crust to form — break gently with a rake if it does", "Expect germination rate of 60–75% from quality seed"] },
          { type: "heading", text: "Thinning" },
          { type: "paragraph", text: "Thin in two stages: first at 5 cm tall to 3 cm apart; second at 10 cm tall to 7–8 cm apart. The second thinning is when mini-carrots can be eaten. Use scissors, not pulling — pulling disturbs neighbours and can damage the remaining plants' roots." },
          { type: "warning", text: "Do not skip thinning. Overcrowded carrots produce spindly, unmarketable roots the size of pencils. Thinning to 7–8 cm produces roots 200–300 g each — the size that commands the best market price." },
          { type: "heading", text: "Watering Carrots" },
          { type: "paragraph", text: "Consistent moisture is crucial. Alternating wet and dry periods cause cracking in mature roots. Apply 20 mm of water per week in cool weather; 30 mm in summer heat. Drip irrigation on carrot beds dramatically improves root quality and reduces cracking by 60–70% compared to overhead watering." },
        ],
        quiz: [
          { question: "Why do you mix carrot seed with sand before sowing?", options: ["Sand provides nutrients", "Sand helps spread tiny seeds more evenly", "Sand improves germination rate", "Sand prevents damping off"], correct: 1, explanation: "Carrot seeds are extremely small and light — it is almost impossible to sow them evenly by hand. Mixing with dry sand (4:1 sand:seed) bulks up the mix and helps distribute seeds more evenly along the furrow, reducing the amount of thinning needed." },
          { question: "What happens if the seedbed dries out during the 14-day germination period?", options: ["Seeds germinate later but normally", "Germination rate drops by 50–70%", "Seeds rot in the soil", "No effect — carrots are drought resistant"], correct: 1, explanation: "Carrot seed has a hard seed coat and requires continuous moisture to germinate. Even a brief drying event during the first 14 days can cause a 50–70% drop in germination, leaving huge gaps in the bed." },
          { question: "What is the final thinning spacing for commercial-size carrots?", options: ["2–3 cm", "5–6 cm", "7–8 cm", "15–20 cm"], correct: 2, explanation: "Thinning to 7–8 cm apart allows each carrot to develop a full root of 150–300 g — the ideal commercial size. Closer spacing produces undersized, pencil-thin roots; wider spacing wastes bed space." },
        ],
      },
      {
        id: "4-3",
        title: "Harvesting, Grading & Storage",
        description: "Harvest at peak sweetness, grade for maximum market value, and store correctly.",
        duration_seconds: 300,
        video_url: VIDEOS[5],
        sections: [
          { type: "heading", text: "Knowing When to Harvest" },
          { type: "paragraph", text: "Nantes carrots are ready 70–80 days from sowing. Check by carefully brushing soil from the shoulder (top) of the root — a root diameter of 2–3 cm at the shoulder indicates readiness. Overripe carrots crack and become woody in the core." },
          { type: "heading", text: "Harvesting Technique" },
          { type: "steps", items: ["Loosen soil with a fork inserted 15 cm away from the row before pulling", "Grip the foliage close to the root and pull with a firm, steady upward motion", "Immediately twist off foliage 2 cm above the root (foliage left on draws moisture from the root)", "Do not let roots lie in the sun — cover with hessian or move immediately to shade"] },
          { type: "heading", text: "Grading for Market" },
          { type: "bullets", items: ["Grade 1 (premium): 150–250 g, smooth, straight, uniform orange, no forking", "Grade 2 (standard): 100–350 g, minor surface defects allowed, slight taper variation", "Reject: forked, cracked, green shoulders, pest damage, diameter under 1.5 cm", "Wash Grade 1 before market — clean carrots sell for 30–40% more than muddy ones"] },
          { type: "tip", text: "Bundle carrots in 500 g or 1 kg bunches with a rubber band for informal markets. Supermarkets and retailers prefer pre-washed, loose carrots in 1 kg bags or 10 kg open-weave bags." },
          { type: "heading", text: "Storage & Shelf Life" },
          { type: "paragraph", text: "Carrots store exceptionally well. After twisting off tops, store in perforated plastic bags or damp sand at 0–4°C for up to 4 months. At room temperature, they last 5–7 days. Never store with apples, pears, or avocados — ethylene gas from these fruit causes carrots to develop a bitter taste." },
          { type: "highlight", text: "Yield benchmark: A well-managed 100 m² carrot bed produces 800 kg–1,200 kg at harvest. At R5–R7/kg wholesale, this is R4,000–R8,400 gross from 100 m² — one of the best returns in vegetable farming." },
        ],
        quiz: [
          { question: "What root shoulder diameter indicates that Nantes carrots are ready to harvest?", options: ["0.5–1 cm", "2–3 cm", "4–5 cm", "Over 5 cm"], correct: 1, explanation: "A shoulder diameter of 2–3 cm at the top of the root indicates that a Nantes carrot has reached the ideal commercial size — typically 150–250 g. Smaller roots are undersize; larger roots risk splitting or becoming woody." },
          { question: "Why should carrot foliage be removed immediately after harvest?", options: ["Foliage causes disease in storage", "Foliage draws moisture from the root, causing shrivelling", "Foliage contains toxic compounds", "Foliage reduces storage temperature"], correct: 1, explanation: "Carrot foliage continues to transpire (lose water) after harvest, drawing moisture directly from the root. Leaving tops on causes roots to become limp and shrivelled within hours. Always twist off tops within 30 minutes of harvest." },
          { question: "With which fruits should carrots NEVER be stored?", options: ["Oranges and lemons", "Bananas and mangoes", "Apples, pears, and avocados", "Grapes and berries"], correct: 2, explanation: "Apples, pears, and avocados produce ethylene gas as they ripen. Ethylene causes carrots to develop isocoumarins — bitter, toxic compounds that make the carrots inedible. Always store carrots away from ethylene-producing fruit." },
        ],
      },
    ],
  },
  {
    moduleId: "5",
    lessons: [
      {
        id: "5-1",
        title: "Varieties, Nursery & Seedbed Prep",
        description: "Select the right onion variety for your market and grow strong transplant seedlings.",
        duration_seconds: 420,
        video_url: VIDEOS[0],
        sections: [
          { type: "heading", text: "Understanding Onion Types" },
          { type: "paragraph", text: "Onions are divided by day-length response: short-day varieties bulb when days are 10–12 hours long (best for SA summer plantings in subtropical regions), and long-day varieties bulb in 14–16 hour days (best for winter/spring plantings in cooler, southern regions). Choosing the wrong type is the single most common cause of failure." },
          { type: "highlight", text: "Key SA varieties: Texas Early Grano (short-day, mild flavour, best for subtropical regions), Pyramid (intermediate, widely adaptable), Hybelle F1 (high-yield commercial hybrid), Granex F1 (short-day, large bulbs, excellent for retail)." },
          { type: "heading", text: "Growing Seedlings in a Nursery Bed" },
          { type: "paragraph", text: "Onions are almost always transplanted in SA, not direct-seeded. Raise seedlings in a dedicated nursery bed for 6–8 weeks before transplanting. This gives the grower control over seedling quality and allows soil preparation to be completed while seedlings grow." },
          { type: "steps", items: ["Prepare a fine seedbed in a sheltered location", "Sow seed thinly in rows 10 cm apart at 5 mm depth", "Cover with a thin layer of fine compost and firm gently", "Water daily with a fine rose head — never a strong stream", "Thin to 2–3 cm apart when 10 cm tall", "Feed weekly with diluted LAN solution (5 g per litre of water)"] },
          { type: "tip", text: "Trim seedlings to 15 cm tall one week before transplanting. This reduces transpiration stress and gives the transplanted seedling a better chance of establishment. It sounds drastic but dramatically reduces transplant shock." },
        ],
        quiz: [
          { question: "What determines when an onion plant starts to form a bulb?", options: ["Temperature", "Soil moisture level", "Day length (photoperiod)", "Soil pH"], correct: 2, explanation: "Onion bulbing is triggered by day length (photoperiod). Short-day varieties respond to 10–12 hour days; long-day varieties need 14–16 hours. Planting the wrong type means the onion will either bulb too early (tiny bulbs) or never bulb at all." },
          { question: "How long should onion seedlings be grown in the nursery before transplanting?", options: ["2–3 weeks", "4–5 weeks", "6–8 weeks", "10–12 weeks"], correct: 2, explanation: "Onion seedlings need 6–8 weeks in the nursery to develop sufficient root mass and stem thickness for successful transplanting. Younger seedlings have high transplant mortality; older seedlings are too set in their growth pattern." },
          { question: "Why should you trim onion seedlings before transplanting?", options: ["To separate them from each other", "To reduce transpiration stress and improve establishment", "To stimulate root growth", "To check for disease"], correct: 1, explanation: "Trimming seedlings to 15 cm before transplanting reduces the leaf area that must be supported by the newly damaged root system. Less leaf area means less water demand, dramatically reducing transplant shock and mortality." },
        ],
      },
      {
        id: "5-2",
        title: "Transplanting, Watering & Feeding",
        description: "Establish your onion crop correctly and feed it through the growing season.",
        duration_seconds: 540,
        video_url: VIDEOS[1],
        sections: [
          { type: "heading", text: "Transplanting Technique" },
          { type: "paragraph", text: "Transplant on a cool, overcast day or in the late afternoon. Make holes with a dibber (a sharpened stick) 5 cm deep and 10 cm apart in rows 25–30 cm apart. Place one seedling per hole, firming the soil around the base so there are no air pockets." },
          { type: "warning", text: "Plant onion seedlings at the correct depth: the white part of the stem should be fully buried, with the green foliage starting just at or slightly above soil level. Planting too deep delays growth; too shallow causes the bulb to sit on top of the soil and sunburn." },
          { type: "heading", text: "Critical Watering Management" },
          { type: "bullets", items: ["Week 1–2 after transplanting: water daily to establish roots", "Weeks 3–8: water every 2–3 days, applying 20–25 mm per week", "Bulbing phase: reduce to every 4–5 days — reduced water stresses the bulb into hardening", "Final 3 weeks before harvest: stop watering completely to cure bulbs in the ground"] },
          { type: "tip", text: "Drip irrigation on onions increases yield by 25–40% compared to furrow irrigation and dramatically reduces fungal disease by keeping foliage dry. One line of drip tape per row (not between rows) is the most efficient layout." },
          { type: "heading", text: "Fertilising Programme" },
          { type: "steps", items: ["At transplanting: 2:3:2 fertiliser at 30 g per metre of row, worked into the bed", "3 weeks post-transplant: LAN at 20 g per metre, side-dressed and watered in", "6 weeks post-transplant: LAN again at 20 g per metre", "When bulbing begins (tops flop over): apply potassium nitrate at 20 g per metre to harden bulbs and extend shelf life", "Do NOT apply nitrogen after bulbing starts — it causes lush tops and soft bulbs that rot in storage"] },
          { type: "heading", text: "Pest & Disease Management" },
          { type: "paragraph", text: "Thrips (Thrips tabaci) are the main pest — silvery patches on leaves indicate their feeding. Spray with spinosad or insecticidal soap every 7 days during peak infestation. Purple blotch fungal disease causes oval lesions with purple centres — treat with mancozeb spray preventively every 10–14 days during wet weather." },
        ],
        quiz: [
          { question: "At what depth should onion seedlings be transplanted?", options: ["White stem fully exposed above soil", "White stem fully buried, green foliage at soil level", "Green foliage buried to first leaf junction", "Any depth — onions are adaptable"], correct: 1, explanation: "The white stem (base) must be fully buried with the junction between white and green just at or slightly above soil level. Too deep delays growth; too shallow causes sunburned, flat-topped bulbs with poor shelf life." },
          { question: "When should you STOP applying nitrogen to onions?", options: ["After the first month", "When plants reach 30 cm tall", "When bulbing begins (tops flop over)", "One week before harvest"], correct: 2, explanation: "Once bulbing begins, applying nitrogen causes the plant to produce lush new foliage instead of hardening the bulb. The result is thick, soft necks that rot in storage and bulbs that will not keep for more than a few weeks." },
          { question: "Which insect pest causes silvery streaks on onion leaves?", options: ["Aphids", "Whitefly", "Thrips", "Cutworms"], correct: 2, explanation: "Thrips (Thrips tabaci) are tiny, 1–2 mm insects that rasp the leaf surface and suck the cell contents, leaving characteristic silvery-white streaks or patches. They also transmit Iris Yellow Spot Virus, a serious disease in SA onion crops." },
        ],
      },
      {
        id: "5-3",
        title: "Curing, Harvesting & Storage",
        description: "Harvest at the right time and cure onions properly for maximum shelf life and market value.",
        duration_seconds: 480,
        video_url: VIDEOS[2],
        sections: [
          { type: "heading", text: "Signs of Maturity" },
          { type: "paragraph", text: "Onions are ready to harvest when 50–70% of the tops have naturally fallen over (lodged). Do not wait for all tops to fall — late-harvested onions have thick necks that rot in storage. The average time from transplanting to harvest is 100–130 days depending on variety and season." },
          { type: "tip", text: "For a uniform harvest, push over any remaining standing tops by hand when 60% have naturally fallen. This synchronises the final curing stage in the field and allows you to harvest the entire block at once." },
          { type: "heading", text: "In-Ground Curing" },
          { type: "paragraph", text: "After tops fall, leave onions in the ground for 7–10 days to begin curing (skin papering-over). If rain threatens, lift them immediately — wet conditions after tops fall cause neck rot within days." },
          { type: "heading", text: "Lifting & Curing" },
          { type: "steps", items: ["Loosen soil with a fork before pulling, gripping the dried tops", "Lay onions in windrows (rows) on the soil surface, overlapping so onion bulbs are shaded by the tops of the adjacent row", "Field cure for 10–14 days in dry weather with good airflow", "If rain comes, move to a ventilated shed with raised slatted shelves immediately", "Trim dried tops to 2 cm from bulb using clean scissors or a knife"] },
          { type: "heading", text: "Grading & Storage" },
          { type: "bullets", items: ["Grade by size: Jumbo (>75 mm), Large (65–75 mm), Medium (55–65 mm), Small (45–55 mm)", "Jumbo and Large command highest market price — R8–R15/kg at farm gate", "Store in cool, dry, well-ventilated conditions (10–15°C, below 70% humidity)", "Cured onions last 4–6 months in good storage; short-day varieties store for only 2–3 months"] },
          { type: "highlight", text: "Yield target: A well-managed commercial onion block yields 35–50 tonnes per hectare (3.5–5 kg per m²). A 100 m² home block should produce 350–500 kg — enough for personal use and significant surplus for market." },
          { type: "warning", text: "Never store onions in sealed bags or containers — they need airflow to prevent condensation and neck rot. Traditional net bags or open wooden crates with slats are ideal for farm storage." },
        ],
        quiz: [
          { question: "When exactly should you harvest onions?", options: ["When all tops have fallen over", "When 50–70% of tops have naturally fallen over", "When tops are still upright and green", "After the first frost"], correct: 1, explanation: "Harvesting when 50–70% of tops have fallen is the commercial standard. Waiting for all tops to fall means the earliest-maturing onions have thick necks that are already rotting. Harvesting too early means bulbs are undersized and thin-skinned." },
          { question: "What is the main risk if onions get wet after tops have fallen?", options: ["Sunburn on exposed bulbs", "Neck rot develops within days", "Bulbs split", "Colour fades"], correct: 1, explanation: "Once onion tops fall and the neck softens, the plant has no defence against Botrytis and other neck-rot fungi. Wet conditions during this window cause devastating losses — the entire crop can be lost within 3–5 days of rain." },
          { question: "What is the ideal humidity for storing cured onions?", options: ["Above 90%", "70–80%", "Below 70%", "50–60%"], correct: 2, explanation: "Onions must be stored below 70% relative humidity. High humidity promotes Botrytis neck rot and sprout regrowth. Dry, well-ventilated conditions at 10–15°C are essential for the 4–6 month storage life of good cured onions." },
        ],
      },
    ],
  },
  {
    moduleId: "6",
    lessons: [
      {
        id: "6-1",
        title: "Planning & Soil Preparation",
        description: "Set up beds and enrich soil for vigorous butternut squash growth.",
        duration_seconds: 360,
        video_url: VIDEOS[3],
        sections: [
          { type: "heading", text: "Space Requirements" },
          { type: "paragraph", text: "Butternut squash is a sprawling vine crop that needs 3–4 m² per plant. In small gardens, train vines along a fence or trellis. For field production, plant in rows 2.4 m apart with 1.5 m between plants in the row. A 100 m² bed can support 12–15 plants — enough to produce 120–180 kg of squash." },
          { type: "heading", text: "Soil & Fertiliser" },
          { type: "steps", items: ["Prepare mounds 60 cm in diameter and 20 cm high, spaced 1.5 m apart", "Fill each mound with a mix of 50% topsoil, 50% mature compost", "Add one handful of 2:3:2 fertiliser per mound and mix in thoroughly", "Water mounds to settle and leave for one week before planting"] },
          { type: "tip", text: "Make compost mounds in the exact position where you will plant. The concentrated fertility directly around each plant's root zone is far more efficient than broadcast fertiliser across the entire area." },
          { type: "heading", text: "When to Plant" },
          { type: "paragraph", text: "In SA, butternut squash is a warm-season crop. Plant after the last frost when soil temperatures are above 18°C. In most provinces this means October–November. In subtropical KZN and Limpopo, a February planting for autumn harvest is also productive." },
          { type: "warning", text: "Squash is frost-sensitive — a single frost kills the plant. In frost-prone areas (Highveld, interior), always wait until mid-October and have shade cloth ready to protect plants during unexpected late frosts." },
        ],
        quiz: [
          { question: "How much space does one butternut squash plant need?", options: ["0.5 m²", "1–2 m²", "3–4 m²", "10 m²"], correct: 2, explanation: "Butternut squash produces long vines (2–4 m) that sprawl across the ground. Each plant needs 3–4 m² of growing space. Overcrowding reduces airflow, increases powdery mildew disease, and reduces yield." },
          { question: "What is the minimum soil temperature for planting butternut squash?", options: ["10°C", "14°C", "18°C", "25°C"], correct: 2, explanation: "Squash seed germinates poorly below 18°C and plants grow slowly until soil warms to 20°C+. Planting in cold soil causes seed to rot rather than germinate, resulting in poor, patchy establishment." },
          { question: "What is the ideal composition of a planting mound for butternut squash?", options: ["Pure compost", "50% topsoil, 50% compost plus fertiliser", "Sand and lime", "Clay and fertiliser"], correct: 1, explanation: "A 50:50 blend of topsoil and compost creates the perfect balance — compost provides nutrients and moisture retention; topsoil provides structure and prevents the mound from shrinking. Adding fertiliser ensures nutrients are available immediately after germination." },
        ],
      },
      {
        id: "6-2",
        title: "Planting, Training & Pollination",
        description: "Germinate seeds correctly, train your vines, and ensure good fruit set through pollination.",
        duration_seconds: 480,
        video_url: VIDEOS[4],
        sections: [
          { type: "heading", text: "Direct Sowing" },
          { type: "paragraph", text: "Sow 3 seeds per mound, 2 cm deep, in a triangle formation. When seedlings have 2 true leaves, thin to the strongest 1–2 plants per mound. Transplanting seedlings raised in pots is possible but must be done carefully to avoid root disturbance — squash hates having its roots disturbed." },
          { type: "heading", text: "Training Vines" },
          { type: "paragraph", text: "Once vines begin to run (3–4 weeks after germination), direct them away from each other and into the allotted space. Peg vines to the ground with wire clips at 60 cm intervals — vines that flop in wind can snap off at the crown. Pinch out the growing tip after the first 2 fruits have set on each vine — this concentrates the plant's energy into those fruits." },
          { type: "tip", text: "Remove all female flowers (the ones with a tiny swollen base) for the first 3 weeks of vine growth. This forces the plant to put all energy into root and vine establishment before committing to fruit production — resulting in larger, better-quality fruit." },
          { type: "heading", text: "Understanding Squash Flowers" },
          { type: "bullets", items: ["Male flowers: appear first, have a straight, thin stalk, produce pollen", "Female flowers: appear 1–2 weeks after males, have a small swollen mini-squash at the base", "Pollination: bees transfer pollen from male to female flowers in the morning", "Without pollination: female flowers open and then fall off without setting fruit"] },
          { type: "heading", text: "Hand Pollination" },
          { type: "paragraph", text: "In areas with few bees, or in tunnel/greenhouse production, hand-pollinate in the early morning (before 10 AM). Pick a fully open male flower, peel back its petals to expose the pollen-covered stamen, and gently touch it to the stigma (centre) of an open female flower. One male flower can pollinate 2–3 female flowers." },
          { type: "warning", text: "Squash fruit that are not properly pollinated abort — they start to grow then shrivel and fall off. If you have poor fruit set, check for bee activity early in the morning and hand-pollinate if necessary." },
        ],
        quiz: [
          { question: "Why should you remove female flowers for the first 3 weeks of vine growth?", options: ["Female flowers attract pests", "To force the plant to establish roots and vines before fruiting", "Female flowers compete with male flowers for nutrients", "To prevent cross-pollination"], correct: 1, explanation: "Removing early female flowers prevents premature fruiting before the plant has a developed root system. Plants that fruit too early produce fewer, smaller squash. Waiting for the plant to mature fully before allowing fruit to set results in larger yields." },
          { question: "What distinguishes a female squash flower from a male?", options: ["Female flowers are larger", "Female flowers have a tiny swollen squash at the base", "Female flowers are yellow; male flowers are white", "Female flowers appear before male flowers"], correct: 1, explanation: "Female squash flowers have a miniature squash (the ovary) at the base of the flower stalk — this is the future fruit. Male flowers have a simple, straight, thin stalk with no swelling. Without pollination, the mini-squash behind the female flower shrivels and falls off." },
          { question: "When is the best time for hand-pollinating squash flowers?", options: ["After noon when flowers are fully open", "Early morning before 10 AM", "In the evening before flowers close", "Any time of day"], correct: 1, explanation: "Squash flowers are only receptive in the morning. Female flowers are open and the stigma is sticky and receptive from sunrise until about 10 AM. After mid-morning, flowers close and remain closed. Pollen also loses viability rapidly in heat." },
        ],
      },
      {
        id: "6-3",
        title: "Pest Control, Harvesting & Curing",
        description: "Manage key pests and harvest at the right stage for longest shelf life.",
        duration_seconds: 360,
        video_url: VIDEOS[5],
        sections: [
          { type: "heading", text: "Key Pests in SA Butternut Production" },
          { type: "bullets", items: ["Powdery mildew: white powdery coating on older leaves — spray with dilute milk (1:9 milk:water) or potassium bicarbonate", "Pumpkin fly: lays eggs in young fruit causing rot — use protein bait traps near the crop", "Aphids on growing tips: spray with soapy water; encourage ladybirds", "Squash bug: grey, flat insects under leaves; hand-pick and crush egg masses"] },
          { type: "tip", text: "Milk spray for powdery mildew is genuinely effective — studies show 80% control equal to commercial fungicides. Spray once per week when conditions are hot and dry. This is a zero-cost, safe, and effective solution." },
          { type: "heading", text: "When to Harvest" },
          { type: "paragraph", text: "Butternut squash is ready to harvest 90–110 days after sowing. Look for: the skin changing from bright tan-yellow to a deeper, dull tan; the stem drying and becoming corky; and a hollow sound when tapped. The fruit should feel heavy for its size." },
          { type: "steps", items: ["Cut — never break — the stem 5 cm from the fruit using a sharp knife", "Leave the 5 cm stub intact — it seals the fruit and dramatically extends shelf life", "Do not carry by the stem — hold the fruit body; broken stems invite rot", "Harvest before any cold nights below 10°C — cold sweetens squash but chilling injury reduces storage life"] },
          { type: "heading", text: "Curing & Storage" },
          { type: "paragraph", text: "Curing is essential: leave harvested squash in a warm (27–32°C), well-ventilated location for 10–14 days. This hardens the skin and heals any surface cuts, extending shelf life from 2 months to 4–6 months." },
          { type: "highlight", text: "Yield benchmark: Each plant typically produces 8–15 butternuts weighing 800 g–1.5 kg each. A 100 m² plot with 15 plants should yield 100–200 kg. At R8–R12/kg, this is R800–R2,400 from a small plot with very little input cost." },
        ],
        quiz: [
          { question: "What household substance is effective against powdery mildew on squash?", options: ["Vinegar", "Diluted milk (1:9 with water)", "Baking soda spray", "Garlic extract"], correct: 1, explanation: "Diluted milk (1 part milk to 9 parts water) contains proteins that create an inhospitable environment for powdery mildew fungi when they contact sunlight. Studies consistently show 80%+ control. It is safe, cheap, and as effective as most commercial fungicides." },
          { question: "Why should you leave a 5 cm stem stub when harvesting butternut?", options: ["For easier carrying", "It seals the fruit and extends shelf life significantly", "To identify the harvest date", "To allow the plant to continue growing"], correct: 1, explanation: "The stem stub dries and forms a natural cork-like seal over the wound. Butternuts with the full stub intact last 4–6 months in storage. Those with the stem broken off or cut flush develop a rot entry point and rarely last more than 6–8 weeks." },
          { question: "How long should butternut squash be cured after harvest?", options: ["2–3 days", "7 days", "10–14 days", "4–6 weeks"], correct: 2, explanation: "Curing at 27–32°C for 10–14 days allows the skin to harden and any surface wounds to suberise (form a protective layer). Uncured squash has thin, easily damaged skin and poor storage life. Properly cured squash can last 4–6 months at room temperature." },
        ],
      },
    ],
  },
  {
    moduleId: "7",
    lessons: [
      {
        id: "7-1",
        title: "Establishing Your Mango Orchard",
        description: "Site selection, variety choice, and correct planting of young mango trees.",
        duration_seconds: 600,
        video_url: VIDEOS[0],
        sections: [
          { type: "heading", text: "Climate & Site Requirements" },
          { type: "paragraph", text: "Mangoes are subtropical trees that need hot, dry conditions during flowering and fruit development. They are grown commercially in Limpopo (Hoedspruit, Tzaneen), the lowveld of Mpumalanga, and coastal KZN. They require a dry period of 4–8 weeks before flowering to stimulate uniform bud break." },
          { type: "highlight", text: "Best SA commercial varieties: Tommy Atkins (red, export quality, tough skin), Kent (large, yellow-red, excellent flavour), Keitt (large, mostly green when ripe, late-season), Sensation (red, medium, popular in local markets), Heidi (South African origin, red blush, aromatic)." },
          { type: "heading", text: "Planting Your Trees" },
          { type: "steps", items: ["Space trees 8–10 m apart in rows 10–12 m apart (or 5 m apart with hedgerow training)", "Dig holes 1 m wide and 1 m deep, at least 6 weeks before planting", "Fill with mixture of topsoil, compost, and superphosphate (2 kg per hole)", "Plant grafted trees only — seedling trees take 8–10 years to fruit; grafted trees 3–4 years", "Plant at exactly the same depth as in the nursery bag — never deeper", "Stake each tree and protect with a tree guard against termites and hares"] },
          { type: "tip", text: "Water new trees twice a week for the first 3 months. After establishment, reduce to once a week. Overwatering young mango trees is the most common mistake — waterlogged roots kill them within days." },
          { type: "warning", text: "Never plant mango trees in poorly drained soils or depressions where water collects. Phytophthora root rot caused by waterlogging kills young trees rapidly and can devastate an established orchard." },
        ],
        quiz: [
          { question: "How many years does it take a grafted mango tree to produce its first fruit?", options: ["1–2 years", "3–4 years", "8–10 years", "12–15 years"], correct: 1, explanation: "Grafted trees produce fruit in 3–4 years because they are grown on an established rootstock and already have part of their root system mature. Seedling-grown trees take 8–10 years because they must develop the entire root and canopy from scratch." },
          { question: "What climate condition do mangoes need before flowering?", options: ["Heavy rainfall", "Extreme cold", "A dry period of 4–8 weeks", "Soil waterlogging"], correct: 2, explanation: "A dry period (stress period) of 4–8 weeks with no irrigation causes the tree to enter a rest phase and break vegetative growth. This triggers uniform floral bud differentiation. Without this dry period, trees produce patchy, vegetative flushes instead of flowers." },
          { question: "What is the most important reason to use grafted mango trees rather than seedlings?", options: ["Grafted trees are cheaper", "Grafted trees fruit in 3–4 years vs 8–10 for seedlings, with known variety characteristics", "Grafted trees need less water", "Grafted trees are disease-free"], correct: 1, explanation: "Grafted trees have two critical advantages: they fruit much sooner (3–4 vs 8–10 years), dramatically reducing the period before income begins, and they maintain the exact characteristics of the parent variety (fruit size, flavour, colour). Seedlings are genetically variable." },
        ],
      },
      {
        id: "7-2",
        title: "Nutrition, Irrigation & Pruning",
        description: "Feed your mango trees correctly and prune for maximum light penetration and yield.",
        duration_seconds: 720,
        video_url: VIDEOS[1],
        sections: [
          { type: "heading", text: "Annual Fertiliser Programme" },
          { type: "bullets", items: ["January–February (pre-flowering): 8:1:5 at 500 g per tree — stimulates flowering", "After fruit set (March–April): 3:1:5 (potassium-rich) at 500 g per tree — improves fruit size", "After harvest (July–August): 2:3:2 at 500 g per tree — restores tree health", "Young trees (1–3 years): divide adult doses by half; apply every 3 months", "Apply fertiliser in a ring under the drip line, not at the trunk"] },
          { type: "tip", text: "Foliar spray with boron (10 g per 10 litres) at full bloom dramatically improves fruit set in mango. Boron deficiency causes flower abortion and is very common in SA's leached soils. One application per season is enough." },
          { type: "heading", text: "Irrigation Scheduling" },
          { type: "paragraph", text: "Established mango trees are relatively drought-tolerant but respond strongly to irrigation. The most important period is fruit development (January–April) when regular water increases fruit size and prevents premature drop. Drip irrigation at 25–40 litres per tree per day during fruiting produces significantly larger fruit." },
          { type: "warning", text: "Stop irrigation completely for 6–8 weeks before the expected flowering date (usually May–June in Limpopo, June–July in coastal KZN). Continued irrigation delays flowering and produces vegetative flushes instead of flowers. This is the most critical management decision in mango production." },
          { type: "heading", text: "Pruning Principles" },
          { type: "steps", items: ["Prune after harvest (July–August) — never during flowering or fruiting", "Remove all crossing, dead, and diseased branches first", "Open the centre of the tree to allow sunlight into all fruiting zones", "Keep tree height under 3.5–4 m for easy harvesting without ladders", "Make all cuts at a 45° angle 5 mm above a bud or branch junction", "Seal large cuts with grafting wax or Steriseal to prevent disease entry"] },
        ],
        quiz: [
          { question: "When should you irrigate mango trees most intensively?", options: ["During the dry stress period before flowering", "After harvest when trees are recovering", "During fruit development (January–April)", "During winter when trees are dormant"], correct: 2, explanation: "Fruit development is when water makes the biggest difference to fruit size and yield. Consistent moisture during the January–April fruiting period prevents premature drop, reduces split fruit, and increases individual fruit weight by 20–40%." },
          { question: "Why is foliar boron spray applied at mango flowering?", options: ["To repel insects", "To improve fruit set by correcting a common boron deficiency", "To prevent fungal diseases", "To stimulate leaf growth"], correct: 1, explanation: "Boron is essential for pollen germination and tube growth — without adequate boron, pollen cannot fertilise the ovule and the flower aborts. SA's sandy, high-rainfall soils are commonly boron-deficient. One foliar spray of 10 g/10 L at full bloom can increase fruit set by 15–30%." },
          { question: "When is the correct time to prune mango trees in South Africa?", options: ["Before flowering in May", "During fruit development in January", "After harvest in July–August", "Any time of year"], correct: 2, explanation: "Pruning after harvest (July–August) allows wounds to heal before the next flowering period and does not disturb flower or fruit development. Pruning during flowering removes flower clusters; pruning during fruiting removes developing fruit and stresses the tree." },
        ],
      },
      {
        id: "7-3",
        title: "Pest Management & First Harvest",
        description: "Control mango pests effectively and harvest your first crop at peak quality.",
        duration_seconds: 540,
        video_url: VIDEOS[2],
        sections: [
          { type: "heading", text: "The Four Major Mango Pests in SA" },
          { type: "bullets", items: ["Mango fruit fly (Ceratitis cosyra): Lays eggs in fruit; maggots rot the flesh. Use protein bait traps + neem oil spray around stone development", "Mango seed weevil (Sternochetus mangiferae): Grub inside seed; no effective spray — plant weevil-free areas and quarantine new material", "Powdery mildew (Oidium mangiferae): White powder on flowers and young fruit; spray sulphur-based fungicide at bud break", "Anthracnose (Colletotrichum gloeosporioides): Black spots on fruit and shoot die-back; apply copper oxychloride every 14 days from late flowering"] },
          { type: "tip", text: "Install fruit fly protein bait traps (GF-120 bait or a mixture of yeast, sugar, and water) 3 months before harvest. Check and refresh every 2 weeks. One trap per 4 trees. This alone can reduce fruit fly damage by 70–80% without broad-spectrum insecticide use." },
          { type: "heading", text: "Harvesting Mangoes" },
          { type: "paragraph", text: "Mango harvest timing varies by variety. Tommy Atkins is harvested at the hard-ripe stage (skin colour beginning to develop, flesh still firm). Keitt and Kent are harvested by fruit firmness — press the fruit with your thumb; a slight give with no indentation indicates readiness." },
          { type: "steps", items: ["Always use a picking pole or ladder — never pull fruit from the ground or shake the tree", "Leave 10 cm of stem attached and cut with a curved knife", "Hold fruit STEM DOWN for 5 minutes after cutting — latex will drip from the stem, not onto the fruit surface", "Latex on the fruit skin causes chemical burn and black marks that make fruit unsaleable", "Place gently in padded crates — do not drop or throw", "Sort and grade immediately: Premium (no marks, correct colour), Standard (minor blemish), Processing (bruised, overripe)"] },
          { type: "highlight", text: "Yield progression: Year 3–4 (first harvest): 10–20 kg per tree. Year 5–7: 50–100 kg per tree. Mature tree (10+ years): 150–400 kg per tree. A 1-hectare orchard with 200 trees at maturity should produce 30–80 tonnes annually." },
        ],
        quiz: [
          { question: "What is the most effective non-chemical method to reduce mango fruit fly damage?", options: ["Covering each fruit in a bag", "Protein bait traps near the trees", "Removing all fallen fruit daily", "Painting tree trunks with lime"], correct: 1, explanation: "Protein bait traps containing a fermenting protein attractant (yeast + sugar or commercial GF-120 bait) lure female fruit flies away from the fruit to feed and are then killed by an included insecticide. One trap per 4 trees reduces damage by 70–80%, far more cost-effective than broad-spectrum spraying." },
          { question: "Why should a freshly harvested mango be held STEM DOWN for 5 minutes?", options: ["To allow the flesh to firm up", "To let latex drip from the stem rather than onto the skin", "To check for pest damage", "To cool the fruit faster"], correct: 1, explanation: "Mango latex (the milky sap) causes contact chemical burn on the fruit skin, creating black markings that make the fruit unsaleable. Holding the fruit stem-down after cutting allows gravity to drain latex away from the fruit surface before it can cause damage." },
          { question: "What is the expected yield from a single mature (10+ year) mango tree?", options: ["5–20 kg", "30–60 kg", "150–400 kg", "500–800 kg"], correct: 2, explanation: "A healthy, well-managed mature mango tree produces 150–400 kg per season depending on variety, soil, and management. Trees 10–15 years old are in their peak production phase. Younger trees (3–5 years) produce only 10–50 kg." },
        ],
      },
    ],
  },
  {
    moduleId: "8",
    lessons: [
      {
        id: "8-1",
        title: "Nursery Setup & Seedling Production",
        description: "Grow uniform, healthy cabbage transplants in a dedicated nursery for best field performance.",
        duration_seconds: 420,
        video_url: VIDEOS[3],
        sections: [
          { type: "heading", text: "Why a Nursery Matters" },
          { type: "paragraph", text: "Direct seeding cabbage in the field wastes expensive hybrid seed and results in variable stands. Growing transplants in a nursery allows you to produce uniform seedlings, select only the strongest for the field, and maintain the main bed for other crops during the 4–5 week nursery period." },
          { type: "highlight", text: "Best SA cabbage varieties: Star 3369 F1 (round head, widely adapted, 90 days), Conquistador (flat head, excellent shelf life), Grandslam F1 (round, large, commercial standard), Parel (early, 55 days, baby cabbage market)." },
          { type: "heading", text: "Nursery Setup" },
          { type: "steps", items: ["Prepare nursery bed in a sheltered, sunny location with frost cloth or shade cloth available", "Mix nursery medium: 50% composted bark, 30% fine compost, 20% coarse river sand", "Use plug trays (50 or 72 cell) OR sow in open beds 5 mm deep, rows 10 cm apart", "Sow 1–2 seeds per cell; cover with thin layer of vermiculite", "Water twice daily with fine rose head — keep moist but not waterlogged", "Germination occurs in 5–7 days at 18–25°C"] },
          { type: "tip", text: "Fill plug trays the day before sowing and water to saturation. The medium settles and compacts slightly, giving better contact between seed and growing medium. Dry medium at sowing causes poor, patchy germination." },
          { type: "warning", text: "Damping-off fungus (Pythium and Fusarium) is the main nursery killer. Prevent it by: using sterile growing medium, avoiding overwatering, ensuring good airflow, and drenching with Previcur N at first sign of seedling collapse at the soil line." },
        ],
        quiz: [
          { question: "What is the main advantage of using a nursery for cabbage production?", options: ["Cheaper than direct seeding", "Allows selection of only strongest transplants and maintains the field for other crops", "Produces larger cabbages", "Eliminates the need for irrigation"], correct: 1, explanation: "Nursery production allows you to select only the best, most uniform seedlings for transplanting — typically 80–90% of what was sown. This improves field uniformity and final crop quality. It also extends the use of your main growing area during the 4–5 week nursery period." },
          { question: "What causes damping-off in cabbage nurseries?", options: ["Over-fertilising", "Too much sunlight", "Pythium and Fusarium fungi in overwatered conditions", "Cold temperatures"], correct: 2, explanation: "Damping-off is caused by Pythium and Fusarium water mould fungi that thrive in wet, poorly aerated growing media. Prevention: sterile medium, controlled watering, and good ventilation. If it appears, treat immediately with Previcur N fungicide drench." },
          { question: "What is the germination time for cabbage seed at ideal temperatures?", options: ["2–3 days", "5–7 days", "14–21 days", "4–6 weeks"], correct: 1, explanation: "Cabbage seed germinates rapidly at 18–25°C, typically within 5–7 days. At cooler temperatures (below 15°C), germination slows to 10–14 days. At temperatures below 5°C or above 35°C, germination fails." },
        ],
      },
      {
        id: "8-2",
        title: "Transplanting & Fertilisation",
        description: "Establish a uniform stand and feed cabbages through the rapid head-forming phase.",
        duration_seconds: 480,
        video_url: VIDEOS[4],
        sections: [
          { type: "heading", text: "Hardening Off Seedlings" },
          { type: "paragraph", text: "Before transplanting, harden seedlings over 7 days: reduce watering, move to full sun exposure, and stop feeding. This acclimatises them to field conditions. Seedlings are ready when they are 10–15 cm tall with 4–6 true leaves and a pencil-thick stem." },
          { type: "heading", text: "Transplanting" },
          { type: "steps", items: ["Transplant on a cloudy day or late afternoon — hot midday sun wilts new transplants severely", "Water seedlings 2 hours before transplanting and again immediately after", "Spacing: 50 cm between plants, 60 cm between rows for round varieties; 60 × 70 cm for large flat varieties", "Firm soil around each plant — no air pockets around roots", "Apply 500 ml of starter solution per plant (LAN 5 g dissolved in 10 L water)", "Water daily for the first 7 days until roots are established"] },
          { type: "heading", text: "Fertilising Cabbages" },
          { type: "bullets", items: ["At transplanting: 2:3:2 (22) at 40 g per plant hole — worked in before transplanting", "3 weeks post-transplant: LAN at 25 g per plant side-dressed and watered in", "6 weeks post-transplant: LAN again at 25 g per plant", "When heads begin to form: switch to 3:1:5 fertiliser at 30 g per plant to harden heads", "Never apply nitrogen once heads are ¾ formed — it causes split heads in wet weather"] },
          { type: "tip", text: "Calcium is critical for preventing tipburn — brown leaf edges inside the head. Spray calcium nitrate (5 g per litre) directly onto the developing head every 10 days from when heads begin to close. Calcium is not mobile in plants and must be applied where needed." },
          { type: "warning", text: "Bolting (premature flowering) occurs when seedlings are exposed to cold (below 10°C) for 2–3 weeks — this vernalises the plant and triggers it to flower instead of forming a head. Keep transplants protected from cold snaps in the first 4 weeks." },
        ],
        quiz: [
          { question: "What is the transplanting spacing for standard round-head cabbage varieties?", options: ["25 × 30 cm", "50 × 60 cm", "80 × 90 cm", "1 m × 1 m"], correct: 1, explanation: "Standard round-head cabbage varieties are planted at 50 cm between plants in rows 60 cm apart. This gives a density of about 33,000 plants per hectare — the commercial standard that balances yield per plant with maximum heads per hectare." },
          { question: "Why is calcium important for cabbage, and how is it best applied?", options: ["For root development — add to soil", "To prevent tipburn — spray directly onto developing head", "For green leaf colour — apply as foliar spray on leaves", "For disease resistance — add to irrigation water"], correct: 1, explanation: "Calcium prevents tipburn (brown leaf margins inside the head), which makes cabbages unmarketable. Calcium is not mobile in plants — it cannot move from older leaves to new tissue. It must be sprayed directly onto the developing head where it is needed." },
          { question: "What causes bolting (premature flowering) in cabbage transplants?", options: ["Too much nitrogen fertiliser", "Overwatering in the first 4 weeks", "Exposure to cold temperatures (below 10°C) for 2–3 weeks", "Planting too deep"], correct: 2, explanation: "Vernalisation occurs when cabbage seedlings are exposed to temperatures below 10°C for an extended period. The plant interprets this cold period as winter and transitions to reproductive growth (flowering) instead of head formation. This produces plants with loose, leafy tops instead of tight heads." },
        ],
      },
      {
        id: "8-3",
        title: "Pest Control, Harvesting & Grading",
        description: "Manage the main cabbage pests and harvest uniform, marketable heads.",
        duration_seconds: 420,
        video_url: VIDEOS[5],
        sections: [
          { type: "heading", text: "The Big Three Cabbage Pests" },
          { type: "bullets", items: ["Diamondback moth (Plutella xylostella): Most destructive; tiny green caterpillars eat leaves and bore into heads. Spray Bt (Bacillus thuringiensis) every 5–7 days — this pest develops resistance to conventional pesticides rapidly", "Cabbage aphid (Brevicoryne brassicae): Grey-green colonies on inner leaves; spray insecticidal soap or neem; introduce parasitic wasps", "Harlequin bug and stink bug: Brown/orange shield-shaped bugs suck sap; hand-pick adults and egg masses; use pyrethrin if numbers are high"] },
          { type: "tip", text: "Rotate your Bt sprays with another mode of action every 3rd spray to delay resistance development in diamondback moth. Use Spinosad as the alternate — it targets caterpillars safely and has a different resistance mechanism." },
          { type: "heading", text: "Black Rot Disease Management" },
          { type: "paragraph", text: "Black rot (Xanthomonas campestris) causes V-shaped yellow lesions from leaf margins with black veins. It spreads rapidly in warm, wet conditions and is seed-borne. Plant resistant varieties, avoid overhead irrigation, and never work in the crop when wet. There is no effective cure — prevention through rotation and certified seed is essential." },
          { type: "heading", text: "Harvesting Technique" },
          { type: "paragraph", text: "Cabbages are ready when the head feels firm when squeezed and does not give or spring back. Split heads indicate overripeness — harvest immediately once any splitting is noticed in the field. Cut the head from the stem with a sharp knife, leaving 3–4 outer wrapper leaves to protect the head." },
          { type: "steps", items: ["Squeeze test: firm, no movement = ready; springy = needs 5–10 more days", "Cut with a single sharp stroke — saw-cutting bruises the base", "Leave 3–4 outer leaves on for market protection", "Do not harvest in midday heat — cabbages harvested cool last 40% longer", "Grade on-farm: Jumbo (>2 kg), Large (1.5–2 kg), Medium (1–1.5 kg), Undersized (reject)"] },
          { type: "highlight", text: "Yield benchmark: A well-managed 100 m² cabbage plot (300 plants) should produce 600–900 kg of marketable heads. At R4–R7/kg, this is R2,400–R6,300 gross. Production cost is roughly R3–R4 per plant including seed, fertiliser, and water." },
        ],
        quiz: [
          { question: "Why is Bacillus thuringiensis (Bt) the preferred spray for diamondback moth?", options: ["It is the cheapest option", "It targets only caterpillars without harming beneficial insects, and delays resistance", "It works for all pests simultaneously", "It has residual activity for 30+ days"], correct: 1, explanation: "Bt specifically targets Lepidopteran larvae (caterpillars) through crystal proteins that are toxic only when eaten by caterpillars. It is safe for beneficial insects, humans, birds, and mammals. Conventional chemical pesticides, used exclusively, cause rapid resistance development in diamondback moth within 3–5 seasons." },
          { question: "How do you test whether a cabbage head is ready to harvest?", options: ["Measure the diameter with a ruler", "Check that all outer leaves have yellowed", "Squeeze firmly — no spring back means ready", "Count days from transplanting only"], correct: 2, explanation: "The squeeze test is the most reliable field check: press the head firmly with both hands. A ready head is solid and does not compress or spring back. A head that compresses is still forming; one that springs back is already overripe and about to split." },
          { question: "What disease causes V-shaped yellow lesions from leaf margins with black veins?", options: ["Clubroot", "Downy mildew", "Black rot (Xanthomonas)", "Sclerotinia white mould"], correct: 2, explanation: "Black rot (Xanthomonas campestris pv. campestris) is the most serious bacterial disease of cabbages. Its diagnostic feature is the V-shaped yellow lesion starting from the leaf margin, with blackened veins. It is seed-borne and spreads rapidly via water splash. There is no cure — prevention through certified seed and rotation is essential." },
        ],
      },
    ],
  },
];

export function getModuleCourse(moduleId: string): CourseModule | null {
  return MODULE_COURSES.find((c) => c.moduleId === moduleId) ?? null;
}

export function getLessonById(moduleId: string, lessonId: string): Lesson | null {
  const course = getModuleCourse(moduleId);
  return course?.lessons.find((l) => l.id === lessonId) ?? null;
}
