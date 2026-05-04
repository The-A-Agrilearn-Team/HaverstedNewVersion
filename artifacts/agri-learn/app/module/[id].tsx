import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { supabase, LearningModule } from "@/lib/supabase";
import { useMarkComplete, useToggleBookmark, useBookmarks } from "@/hooks/useProgress";
import { useAuth } from "@/context/AuthContext";

const C = Colors.light;

const MOCK_MODULES: Record<string, LearningModule> = {
  "1": {
    id: "1", title: "Growing Tomatoes: Complete Guide",
    description: "Step-by-step guide to planting, watering, nurturing, and harvesting tomatoes in South African conditions.",
    category: "Crops", level: "beginner", duration_minutes: 45, language: "en", created_at: new Date().toISOString(),
    content: "Tomatoes are one of the most rewarding vegetables to grow in South Africa. A single plant can produce 4–8 kg of fruit per season.\n\nVIDEO:https://www.youtube.com/results?search_query=how+to+grow+tomatoes+south+africa+step+by+step|Watch: Growing Tomatoes — Step-by-Step Tutorial\n\nBEST PLANTING SEASONS\nSummer rainfall regions (Gauteng, Limpopo, Mpumalanga): Plant September–November\nWinter rainfall regions (Western Cape): Plant February–April\nCoastal regions (KZN, Eastern Cape): Year-round with shelter in winter\n\nSOIL PREPARATION\n1. Choose a sunny spot with at least 6–8 hours of direct sunlight daily\n2. Dig the soil to 30–40 cm deep and remove all stones, weeds, and old roots\n3. Mix in 2–3 buckets of well-rotted compost per square metre\n4. Add 100g of superphosphate fertilizer per square metre and work in\n5. Test soil pH — tomatoes prefer pH 6.0–6.8. Add lime if too acidic\n6. Rake the bed smooth and let it rest for 1 week before planting\n\nSTEP-BY-STEP PLANTING\n1. Start seeds indoors in seed trays 6–8 weeks before transplanting\n2. Fill trays with seedling mix, sow seeds 5mm deep, 2 seeds per cell\n3. Water gently and cover with plastic until germination (7–10 days at 20–25°C)\n4. Once seedlings have 2 true leaves, thin to 1 seedling per cell\n5. Harden off seedlings: place outside in shade for 3–4 days, then full sun\n6. Transplant outdoors when seedlings are 15–20 cm tall and frost risk is past\n7. Dig holes 60 cm apart in rows 80 cm apart\n8. Plant deep — bury up to the lowest leaves to encourage strong roots\n9. Water well immediately after planting\n10. Place a sturdy 1.5 m stake beside each plant and tie loosely with soft string\n\nWATERING SCHEDULE\nWeeks 1–2 after transplant: Water every day — the plant is establishing roots\nWeeks 3 onwards: Water deeply every 2–3 days (more in hot weather)\nRule: Stick your finger 5 cm into soil — if dry, water now\nAmount: 5–10 litres per plant per watering at the base\nCritical: Keep watering consistent — irregular watering causes blossom end rot and cracked fruit\nAvoid: Never water the leaves — keep foliage dry to prevent fungal disease\n\nNURTURING YOUR PLANTS\nWeek 2: Apply mulch (straw or dry grass) 5–8 cm thick around each plant\nWeek 3: Begin side-dressing with balanced fertilizer (3:1:5 or 2:3:4) every 2 weeks\nWeek 4 onwards: Remove suckers — shoots growing between the main stem and a branch\nEvery week: Tie the main stem to the stake as it grows\nEvery week: Remove yellowing lower leaves to improve airflow\n\nFERTILIZING PLAN\nAt planting: Superphosphate (supports root development)\nWeeks 3–6 before flowering: High-nitrogen fertilizer like LAN — promotes growth\nFrom flowering onwards: Switch to low-nitrogen, high-potassium (3:1:5) — promotes fruit\nDo NOT over-fertilize with nitrogen after flowering\n\nPEST AND DISEASE WATCH\n• Red spider mite: Yellowing stippled leaves — spray neem oil\n• Hornworm: Large holes in leaves — hand-pick or spray Bt\n• Early blight: Brown spots with yellow rings — remove leaves, spray copper fungicide\n• Fusarium wilt: Wilting despite good water — remove plant, don't plant tomatoes there for 3 years\n• Whitefly: Clouds of tiny white insects — use yellow sticky traps\n\nHARVESTING\nTomatoes are ready 60–80 days after transplanting\n\nSigns of ripeness:\n• Skin turns from green to red (or yellow/orange depending on variety)\n• Fruit feels slightly soft when gently squeezed\n• Fruit separates easily from the stem with a slight twist\n\nHow to harvest:\n1. Pick in the morning when it is cool\n2. Twist and pull gently — do not yank\n3. If fruit splits on the plant, harvest immediately\n4. Green tomatoes can ripen indoors at room temperature — never in the fridge\n\nSTORAGE\n• Room temperature: Ripe tomatoes keep for 5–7 days\n• Never refrigerate — cold destroys flavour\n• Overripe fruit: Cook immediately, freeze as sauce, or dry in the sun\n• For selling: Harvest slightly underripe — they ripen during transport"
  },
  "2": {
    id: "2", title: "Growing Spinach: Complete Guide",
    description: "How to plant, water, feed, and harvest spinach for a continuous supply throughout the year.",
    category: "Crops", level: "beginner", duration_minutes: 30, language: "en", created_at: new Date().toISOString(),
    content: "Spinach is one of the fastest and easiest vegetables to grow, providing harvests within 6–8 weeks. It thrives in cool conditions and tolerates light frost.\n\nVIDEO:https://www.youtube.com/results?search_query=how+to+grow+spinach+south+africa+tutorial|Watch: Growing Spinach — Complete Tutorial\n\nBEST PLANTING SEASONS\nAll regions: February–April (autumn) and July–September (late winter/spring)\nCool highland areas: Can grow year-round in summer with shade cloth\nAvoid planting in midsummer — spinach bolts rapidly above 25°C\n\nSOIL PREPARATION\n1. Choose a partially shaded spot or one with afternoon shade in summer\n2. Dig the bed to 20–25 cm deep\n3. Add 2 buckets of compost per square metre and fork in thoroughly\n4. Add 60g of 2:3:2 fertilizer per square metre — spinach needs nitrogen-rich soil\n5. Aim for pH 6.5–7.0 — add lime if soil is acidic\n6. Ensure good drainage — spinach roots rot in waterlogged soil\n7. Rake smooth and water the bed the day before planting\n\nSTEP-BY-STEP PLANTING\n1. Soak spinach seeds in water for 12–24 hours before planting — speeds germination\n2. Make furrows 1–2 cm deep, spaced 25–30 cm apart\n3. Drop seeds every 5 cm along each furrow\n4. Cover lightly with fine soil and firm down gently\n5. Water with a fine spray — do not wash seeds away\n6. Germination takes 7–14 days\n7. When seedlings are 5 cm tall, thin to 15–20 cm apart — eat thinnings as baby spinach\n8. For continuous supply, sow a new row every 3 weeks\n\nWATERING SCHEDULE\nSeeds to germination: Keep soil consistently moist — water lightly every day\nEstablished plants: Water every 2 days in moderate weather, daily in hot conditions\nAmount: Spinach has shallow roots — 2–3 litres per square metre is enough\nTechnique: Water at soil level, keep leaves dry to prevent fungal spots\nCritical: Never let the soil dry out completely — stressed spinach bolts prematurely\n\nNURTURING YOUR PLANTS\nWeek 2: Apply 5 cm mulch of straw or grass clippings between rows\nWeek 3: Side-dress with LAN fertilizer — 30g per metre of row, 10 cm from plants, water in\nEvery 2 weeks: Apply compost tea to encourage leaf growth\nWeekly: Remove yellowing outer leaves to keep the plant productive\nWeekly: Hand-weed between rows\n\nCOMMON PROBLEMS\n• Bolting: Caused by heat or dry conditions — ensure water and shade in warm weather\n• Downy mildew: Grey mould on leaf undersides — improve airflow, avoid wetting leaves\n• Leaf miners: Tunnels inside leaves — remove affected leaves, use row covers\n• Slugs: Holes in leaves with slime trails — set beer traps or scatter diatomaceous earth\n\nHARVESTING\nSpinach can be harvested from 40 days after planting\n\nCut-and-come-again method (recommended):\n1. Cut individual outer leaves 2–3 cm above the base with scissors\n2. Always leave the growing centre with at least 4–5 inner leaves intact\n3. The plant will keep producing new leaves for 3–4 months\n4. Harvest every 5–7 days once established\n\nFull harvest:\n1. When the plant shows signs of bolting, cut the whole plant at soil level\n2. The roots may re-sprout for a second smaller harvest\n\nHARVEST TIPS\n• Harvest in the morning when leaves are crisp\n• Young small leaves have the best flavour\n• Wash immediately and refrigerate in a damp cloth\n• Fresh spinach keeps for 5–7 days in the fridge\n• Excess spinach can be blanched and frozen for up to 6 months"
  },
  "3": {
    id: "3", title: "Growing Potatoes: Complete Guide",
    description: "Step-by-step instructions for planting, hilling, watering, and harvesting potatoes in South Africa.",
    category: "Crops", level: "beginner", duration_minutes: 50, language: "en", created_at: new Date().toISOString(),
    content: "Potatoes are a highly productive staple crop. A 10-metre row can yield 20–40 kg, making them excellent value for small-scale farmers.\n\nVIDEO:https://www.youtube.com/results?search_query=how+to+grow+potatoes+south+africa+farming|Watch: Growing Potatoes — Complete Farming Guide\n\nBEST PLANTING SEASONS\nHighveld (Gauteng, Free State): August–September and January–February\nKwaZulu-Natal midlands: May–June and September–October\nWestern Cape: July–August (spring crop)\nAvoid frost — potatoes are damaged by frost, especially when young\n\nCHOOSING SEED POTATOES\n• Use certified disease-free seed potatoes from a reputable supplier\n• Choose region-suited varieties: BP1, Mondial, Agria, or Sifra\n• Each seed potato should be roughly egg-sized (40–80g)\n• Larger potatoes can be cut — each piece needs at least 2 eyes (buds)\n• Allow cut pieces to dry for 24–48 hours before planting\n\nSOIL PREPARATION\n1. Potatoes need deep, loose, well-drained soil — cannot form well in compact soil\n2. Dig or till to 30–40 cm depth\n3. Remove all stones, clods, and weed roots\n4. Add 3–4 buckets of compost per square metre\n5. Add 100g of superphosphate per square metre\n6. Target pH 5.5–6.0 — too much lime causes scab disease\n7. Form ridges 30 cm high and 60 cm apart with a hoe\n\nSTEP-BY-STEP PLANTING\n1. Make holes 15–20 cm deep along the ridge, spaced 30–35 cm apart\n2. Place one seed potato (eye facing up) in each hole\n3. Cover with 10–15 cm of soil — do not fill completely yet\n4. Water gently after planting\n5. Mark rows so you know where plants will emerge\n6. Shoots emerge in 14–21 days\n7. When plants are 20 cm tall, perform first hilling\n\nWATERING SCHEDULE\nPlanting to emergence: Keep soil just moist — water every 3–4 days\nAfter emergence: Water every 3 days; every 2 days in hot weather\nWhen flowering (critical — tubers forming): Water consistently and deeply, 5–8 litres per plant\nAfter flowering subsides: Reduce watering gradually over 2–3 weeks\nLast 2 weeks before harvest: Stop watering — hardens potato skins for storage\n\nNURTURING — HILLING IS ESSENTIAL\nHilling prevents tubers from being exposed to sunlight (which turns them green and toxic)\n\nFirst hilling — when plants are 20 cm tall:\n1. Mound soil up around the stems, leaving only the top 10 cm of leaves exposed\n2. This encourages more tubers to form along the buried stem\n3. Water after hilling\n\nSecond hilling — 3 weeks after first:\n1. Mound soil again, burying another 10–15 cm of stem\n2. Ridges should now be 30–40 cm high\n3. Cover any exposed tubers immediately\n\nFERTILIZING\nAt planting: Superphosphate worked into the soil\n3 weeks after emergence: Side-dress with 3:2:1 fertilizer at 60g per metre of row\nAt flowering: Apply potassium-rich fertilizer (3:1:5) to improve tuber quality\n\nHARVESTING\nEarly potatoes: 10–12 weeks after planting\nMain crop: 16–20 weeks after planting\n\nSigns of readiness:\n• Foliage turns yellow and begins to die back\n• Skin does not rub off easily when pressed\n\nHow to harvest:\n1. Two weeks before harvesting, cut off all above-ground foliage\n2. Leave tubers in the ground for 2 weeks to harden skins\n3. Insert a garden fork 30 cm from the plant base\n4. Lift the soil and gently pull the plant\n5. Feel through the loosened soil with your hands\n6. Do not pierce tubers with the fork — damaged potatoes rot\n7. Let potatoes dry on the soil surface for 2–3 hours if weather is dry\n\nSTORAGE\n• Store in a cool (7–10°C), dark, well-ventilated place — never in sunlight\n• Do NOT wash before storing\n• Store in hessian bags or wooden crates — never airtight plastic\n• Check weekly and remove any rotting potatoes immediately\n• Properly stored potatoes keep for 3–6 months"
  },
  "4": {
    id: "4", title: "Growing Carrots: Complete Guide",
    description: "Learn to plant, thin, water, and harvest carrots for crisp, sweet results in South African gardens.",
    category: "Crops", level: "beginner", duration_minutes: 40, language: "en", created_at: new Date().toISOString(),
    content: "Carrots are a rewarding root vegetable that stores well and sells strongly. Success depends on correct soil preparation and consistent watering.\n\nVIDEO:https://www.youtube.com/results?search_query=how+to+grow+carrots+south+africa+garden|Watch: Growing Carrots — Soil to Harvest Tutorial\n\nBEST PLANTING SEASONS\nAll regions: March–May (autumn sowing) — gives the sweetest carrots\nCooler regions (highveld, KZN midlands): August–September also works\nAvoid midsummer — germination is poor in heat\nCarrots take 70–90 days from sowing to harvest\n\nSOIL PREPARATION — THE MOST CRITICAL STEP\nCarrots grow poorly in compacted, stony, or clay-heavy soils\n\n1. Choose a bed in full sun\n2. Dig deeply — 40–50 cm is ideal\n3. Remove every stone, clod, and root fragment\n4. Add 2 buckets of fine, well-rotted compost per square metre — avoid fresh manure\n5. Add 60g of superphosphate per square metre\n6. Do NOT add nitrogen-heavy fertilizer at planting\n7. Rake to a very fine, smooth texture\n8. Water the prepared bed the day before sowing\n\nSTEP-BY-STEP PLANTING\nCarrot seeds are tiny — sow directly, do not transplant\n\n1. Make shallow furrows 1 cm deep, spaced 25 cm apart\n2. Mix seeds with dry sand (1 part seed, 5 parts sand) for even spreading\n3. Sprinkle the seed-sand mixture thinly along the furrows\n4. Cover with a very thin layer of fine compost (3–5 mm only)\n5. Tamp gently with a flat board\n6. Water very gently with a fine rose — do not wash seeds away\n7. Cover with a light layer of dry grass mulch\n8. Germination is slow: 14–21 days. Do not disturb the bed\n\nWATERING SCHEDULE\nSowing to germination: Water lightly every day — top 3 cm must never dry out\nAfter germination: Water every 2 days, wetting to 15–20 cm depth\nFrom 4 weeks onwards: Deep watering every 3 days encourages roots to grow downward\nCritical: Irregular watering causes carrot roots to crack and split\n\nTHINNING — DO NOT SKIP\nOvercrowded carrots produce stunted, twisted roots\n\nFirst thinning — seedlings 5 cm tall:\n1. Thin to one seedling every 3 cm\n2. Do this in the evening — carrot fly is attracted by the smell\n3. Remove thinnings from the area immediately\n\nSecond thinning — seedlings 10 cm tall:\n1. Thin again to one every 6–8 cm\n2. The thinned seedlings can be eaten as baby carrots\n\nNURTURING\nWeek 2: Apply fine mulch between rows\nWeek 4: Side-dress with balanced fertilizer (3:2:1) at 60g per metre — beside, not on, plants\nWeek 6: Check carrot shoulders — cover any exposed tops, they turn green and bitter\nWeekly: Remove weeds by hand — do not disturb carrot roots\n\nHARVESTING\nCarrots are ready 70–90 days after sowing\n\nSigns of readiness:\n• Root top at soil level is 1.5–2.5 cm in diameter\n• Shoulders push slightly above the soil surface\n\nHow to harvest:\n1. Water the bed well 1–2 hours before harvesting\n2. Insert a garden fork 10 cm beside the row and lever upward\n3. Grasp the foliage close to the root and ease the carrot out\n\nAFTER HARVEST\n1. Twist or cut off foliage immediately — leaves draw moisture from the root\n2. Do not wash before storing\n3. Store in cool, dark place in damp sand or sawdust — keeps carrots crisp for weeks\n4. Refrigerated in a bag with small holes: keeps for 3–4 weeks"
  },
  "5": {
    id: "5", title: "Growing Onions: Complete Guide",
    description: "Complete instructions for raising, transplanting, watering, and curing onions in South Africa.",
    category: "Crops", level: "intermediate", duration_minutes: 55, language: "en", created_at: new Date().toISOString(),
    content: "Onions are a high-value crop that stores for months and is in constant demand. They require patience — 5 months from seed to harvest — but reward the effort greatly.\n\nVIDEO:https://www.youtube.com/results?search_query=how+to+grow+onions+south+africa+farming|Watch: Growing Onions — From Seed to Harvest\n\nBEST PLANTING SEASONS\nHighveld regions: Sow seeds: March–April. Transplant: May–June. Harvest: October–November\nKZN and Eastern Cape: Sow: February–March. Transplant: April. Harvest: September\nWestern Cape: Sow: January–March. Transplant: March–April. Harvest: August–September\n\nSOIL PREPARATION\n1. Choose a sunny, open spot with excellent drainage\n2. Dig to 25–30 cm depth, break up all clods\n3. Add 3 buckets of compost per square metre\n4. Add 80g of 2:3:2 fertilizer per square metre\n5. Target pH 6.0–7.0\n6. Form raised beds 20 cm high for excellent drainage\n\nSTEP-BY-STEP — RAISING SEEDLINGS (weeks 1–8)\n1. Fill seed trays with fine seedling mix\n2. Sow seeds 5 mm deep, roughly 1 cm apart\n3. Water gently and keep at 15–20°C\n4. Germination takes 10–14 days — keep moist throughout\n5. After germination, move to full sun and water daily\n6. After 6 weeks, trim green tops to 8–10 cm with scissors — toughens plants\n7. Repeat trimming at week 8\n8. Seedlings are ready when pencil-thick and 15–20 cm tall\n\nSTEP-BY-STEP TRANSPLANTING (weeks 8–10)\n1. Water the seedbed well the evening before transplanting\n2. Pull seedlings carefully, keeping roots intact\n3. Trim roots to 5 cm and tops to 12–15 cm — reduces transplant shock\n4. Make holes 8–10 cm deep, spaced 10 cm apart in rows 25–30 cm apart\n5. Lower each seedling so the base (slight swelling) is only 1–2 cm below the surface — deep planting produces poor bulbs\n6. Firm soil around each seedling and water immediately\n7. Shade with shade cloth for 3–5 days after transplanting\n\nWATERING SCHEDULE\nAfter transplanting weeks 1–2: Water every day to establish plants\nWeeks 3–10: Water every 2–3 days — consistent moisture, no wet feet\nBulbing stage (week 12+): Reduce to every 4–5 days — excess water dilutes flavour\nFinal 2 weeks before harvest: Stop all watering — critical for neck drying and storage life\nAmount: 5–8 litres per square metre per watering, applied slowly\n\nNURTURING\nWeek 3: Apply 5 cm mulch between rows\nWeek 4: Side-dress with LAN nitrogen fertilizer at 60g per 5-metre row\nWeek 8: Second nitrogen application at same rate\nWeek 12 as bulbs form: Apply potassium-rich fertilizer (3:1:5). Stop all nitrogen now\nWeekly: Hand-weed between rows — onion roots are shallow\n\nHARVESTING\nOnions are ready approximately 5 months after transplanting\n\nSigns of readiness:\n• 50–70% of green tops have fallen over naturally\n• The neck feels soft and thin\n• The outer skin has turned papery and brown\n\nHow to harvest:\n1. On a dry, sunny day, loosen soil beneath bulbs with a fork\n2. Pull bulbs and lay on top of soil or wire mesh for 2–3 weeks to CURE\n3. Curing seals the neck and preserves the bulb\n\nSTORAGE AFTER CURING\n• Trim roots and cut tops to 2 cm above bulb\n• Store in mesh bags or crates in a cool, dry, ventilated place\n• Do not store in plastic bags — onions need airflow\n• Properly cured onions keep for 6–8 months"
  },
  "6": {
    id: "6", title: "Growing Butternut Squash: Complete Guide",
    description: "How to plant, train, water, and harvest butternut squash for excellent yield and quality.",
    category: "Crops", level: "beginner", duration_minutes: 40, language: "en", created_at: new Date().toISOString(),
    content: "Butternut squash is a fast-growing, high-yielding crop that thrives in the South African summer. Each plant can produce 6–12 large fruits weighing 1–2 kg each.\n\nVIDEO:https://www.youtube.com/results?search_query=how+to+grow+butternut+squash+south+africa|Watch: Growing Butternut Squash — Full Guide\n\nBEST PLANTING SEASONS\nAll summer-rainfall regions: September–November (spring/early summer)\nWestern Cape: September–October\nKZN coast: August–October\nButternut is frost-sensitive — do not plant until all frost risk has passed\nCrop matures in 80–100 days from planting\n\nSOIL PREPARATION\n1. Choose a sunny spot with full sun all day\n2. Dig planting holes 60 cm wide and 40 cm deep, spaced 1.5 m apart\n3. Fill each hole with equal parts soil, compost, and kraal manure\n4. Add one tablespoon of superphosphate to each hole\n5. Mound the mixture into a slight hill 15 cm above ground level\n6. Water the mounds well and let settle for a few days\n\nSTEP-BY-STEP PLANTING\n1. Push 3 seeds 2–3 cm deep into each mound, spaced in a triangle\n2. Water gently after sowing\n3. Germination: 7–10 days\n4. When seedlings have 2 true leaves, thin to the strongest 1–2 plants per mound\n5. If transplanting from trays: transplant when seedlings have 2–3 true leaves\n6. Handle roots gently — squash dislikes root disturbance\n\nWATERING SCHEDULE\nSowing to germination: Keep mound moist, water every 1–2 days\nYoung plants weeks 1–4: Water deeply every 2–3 days, 5–8 litres per plant\nFlowering and fruit set weeks 5–8: Water deeply every 2–3 days consistently\nFruit development weeks 8–12: Continue regular watering, 10–15 litres per plant\nFinal 2 weeks before harvest: Reduce watering to harden the skin\nTechnique: Water at the base — wet leaves encourage powdery mildew\n\nNURTURING\nWeek 2: Mulch heavily around the mound and along vine paths\nWeek 3: Side-dress with balanced fertilizer (3:2:1) at 100g per plant in a ring 30 cm from stem\nWeek 4: Begin training the main vine in the direction you want it to grow\nWeek 5 onwards when flowers appear: Female flowers have a small swelling (baby fruit) at their base\nPollination: In the morning, use a small paintbrush to transfer pollen from male to female flowers\nWeek 6: When small fruits are 5 cm long, remove all but 4–6 per plant — directs energy to larger fruit\nWeek 7: Side-dress with potassium-rich fertilizer (3:1:5) to improve skin hardness\n\nHARVESTING\nButternut is ready 80–100 days after planting\n\nSigns of readiness:\n• Skin changes from shiny green to dull beige/tan colour — most reliable sign\n• Skin is hard and cannot be scratched with a fingernail\n• Stem attached to fruit starts to dry, harden, and turn corky\n• Tap the fruit — a hollow sound indicates ripeness\n\nHow to harvest:\n1. Cut the stem 5–8 cm above the fruit with sharp secateurs\n2. A long stem prevents the entry point from rotting in storage\n3. Handle carefully — bruised fruit rots quickly\n4. Leave harvested fruit in the sun for 10–14 days to CURE\n\nSTORAGE\n• After curing, store in a cool, dry place with good airflow\n• Do NOT refrigerate whole butternut\n• Whole, properly cured butternut stores for 3–6 months\n• Once cut, wrap in plastic and refrigerate — use within 5 days"
  },
  "7": {
    id: "7", title: "Growing Mangoes: Complete Guide",
    description: "From young tree establishment to first harvest — a complete mango-growing guide for South African farmers.",
    category: "Crops", level: "intermediate", duration_minutes: 60, language: "en", created_at: new Date().toISOString(),
    content: "Mangoes are a profitable, long-term investment. A healthy tree can produce fruit for 40+ years and yield 100–300 kg per season at full maturity.\n\nVIDEO:https://www.youtube.com/results?search_query=growing+mangoes+south+africa+limpopo+orchard|Watch: Growing Mangoes in South Africa — Orchard Guide\n\nBEST REGIONS AND CLIMATE\n• Ideal: Hot, dry winters and hot, humid summers — Limpopo and Mpumalanga lowveld\n• Suitable: Northern KZN coast, parts of Eastern Cape coast\n• Not suitable: Highveld, Western Cape (too cold)\n• Mangoes need a dry, cool period (15–20°C) in winter to trigger flowering\n• Temperature below 4°C damages flowers and young fruit\n\nCHOOSING VARIETIES\n• Tommy Atkins — red-flushed, excellent for export, firm, fibreless\n• Kent — large, sweet, low fibre, good shelf life\n• Sensation — red-green, good flavour, popular locally\n• Keitt — late-season variety, large, sweet\n• Buy grafted trees from a certified nursery — fruit in 3–5 years vs 6–8 for seedlings\n\nPLANTING SITE AND SOIL PREPARATION\n1. Choose a north-facing slope with full sun and good cold air drainage\n2. Mangoes need deep, well-drained soil — at least 1.5 m deep\n3. Mark positions: 8 m × 8 m spacing for full orchards\n4. Dig planting holes 1 m wide and 1 m deep, 4–6 weeks before planting\n5. Mix removed soil with equal parts compost and refill, mounding slightly\n6. Add 200g superphosphate and 200g agricultural lime to each hole\n\nSTEP-BY-STEP PLANTING\n1. Best planting time: October–November (start of rainy season)\n2. Water the nursery tree well 24 hours before planting\n3. Dig a hole just large enough to fit the root ball\n4. Remove nursery bag without disturbing the root ball\n5. Place tree so the graft union is 10–15 cm ABOVE the soil surface\n6. Backfill with prepared soil mix and firm in gently\n7. Build a small basin 30–40 cm from the trunk to capture water\n8. Water slowly with 20–30 litres per tree\n9. Apply 10 cm mulch in the basin, keeping 10 cm away from the trunk\n10. Install a stake and tie the young tree for wind support\n\nWATERING SCHEDULE\nYear 1 establishment: Water every 3–5 days in dry season — 20–30 litres per tree\nYear 2: Water every 5–7 days during dry spells\nYear 3+: Mature trees survive on rainfall in good rainfall areas (600mm+)\nCritical water timings:\n• Throughout first year\n• During fruit development: regular irrigation increases fruit size significantly\n• Stop irrigating 2–3 weeks before harvest to improve flavour\n\nFERTILIZING PROGRAMME\nYear 1: Every 3 months, 100g balanced fertilizer (3:2:1) in a ring 30 cm from trunk\nYear 2: 200g every 3 months\nYear 3+:\n• Post-harvest (April–May): 300g LAN per tree for new growth\n• Pre-flowering (July–August): 200g potassium fertilizer (3:1:5) for flowering\n• At fruit set: 200g balanced fertilizer per tree\n\nNURTURING AND PRUNING\nYear 1–3 pruning:\n1. After planting, prune the central leader at 60–80 cm height to encourage branching\n2. In year 2, select 3–4 strong, well-spaced branches as the main scaffold\n3. These decisions shape the tree structure for 40 years\n\nAnnual pruning after harvest:\n1. Remove dead, crossing, or inward-growing branches\n2. Trim canopy to allow light and spray coverage into the centre\n3. Remove any rootstock shoots from below the graft union immediately\n\nHARVESTING\nGrafted trees begin bearing in years 3–5. Full production from year 7–10\n\nMaturity indicators:\n• Skin colour changes — varieties lose their bright green colour\n• Shoulders of the fruit become rounded and full\n• A few fruit drop naturally — cut open to assess internal yellow colour\n• Mature fruit floats in water; immature fruit sinks\n\nHow to harvest:\n1. Harvest in the cool of the morning\n2. Cut the stalk 5–8 cm from the fruit — prevents sap burn\n3. Hold fruit stalk-end DOWN to allow sap to drain\n4. Place (do not throw) fruit into lined crates one layer deep\n5. Move to shade immediately\n\nPOST-HARVEST\n• Hot water treatment: Dip fruit in 52°C water for 5 minutes — kills fruit fly eggs\n• Grade by size and quality for market\n• Store at 12–13°C for up to 3 weeks\n• Ripen at room temperature 20–25°C — takes 4–7 days"
  },
  "8": {
    id: "8", title: "Growing Cabbage: Complete Guide",
    description: "Step-by-step guide to raising, transplanting, feeding, and harvesting firm, quality cabbage heads.",
    category: "Crops", level: "beginner", duration_minutes: 42, language: "en", created_at: new Date().toISOString(),
    content: "Cabbage is a consistent, reliable vegetable crop that handles cool temperatures well and produces heavy heads that sell well at markets and to retailers.\n\nVIDEO:https://www.youtube.com/results?search_query=how+to+grow+cabbage+south+africa+farming|Watch: Growing Cabbage — Step-by-Step Guide\n\nBEST PLANTING SEASONS\nSummer rainfall regions (highveld): Transplant March–May for winter crop; also September for summer crop\nKZN and Eastern Cape: Transplant April–June and August–October\nWestern Cape: Transplant March–May\nCabbage grows best at 15–20°C and tolerates light frost\nDays to harvest: 60–90 days after transplanting\n\nCHOOSING A VARIETY\n• Round head types: Star 3301, Conquistador, Grandslam — most common, firm heads\n• Flat/Drumhead types: Larger heads, good for fresh markets\n• Red cabbage: Niche product, premium price, fewer pests\n• Buy fresh, certified seed each season\n\nSOIL PREPARATION\n1. Select a site in full sun\n2. Dig to 25–30 cm depth and remove all previous crop debris\n3. Cabbage is a heavy feeder: add 3–4 buckets of compost per square metre\n4. Add 100g of 2:3:2 fertilizer per square metre\n5. Aim for pH 6.5–7.0 — add lime if below 6.5 to prevent clubroot\n6. Rake smooth and form a fine-textured seedbed\n\nRAISING SEEDLINGS (weeks 1–5)\n1. Fill seed trays with fine seedling mix\n2. Sow 2–3 seeds per cell, 5 mm deep\n3. Water and keep at 15–20°C — germination in 5–8 days\n4. Thin to 1 seedling per cell once the first true leaf appears\n5. Keep in full sun and water daily\n6. At week 3, water with dilute liquid fertilizer to strengthen seedlings\n7. Begin hardening off at week 4: place outside in shade, then full sun\n8. Seedlings are ready with 4–5 true leaves (5–6 weeks old)\n\nSTEP-BY-STEP TRANSPLANTING\n1. Transplant in late afternoon or on a cool, cloudy day\n2. Water seedlings thoroughly 1 hour before transplanting\n3. Spacing: 40–45 cm between plants, 50–60 cm between rows\n4. Plant at the same depth as in the tray — do not plant too deep\n5. Firm soil around the stem and water immediately with 500 ml per plant\n6. Shade with cut branches or shade cloth for 3–4 days if very sunny\n\nWATERING SCHEDULE\nWeeks 1–2 after transplanting: Water every day — keep soil moist\nWeeks 3–6: Water every 2 days, 3–5 litres per plant\nFrom week 6 as heads form: Water every 2–3 days very consistently\nCritical: Irregular watering causes heads to split — maintain consistency\nAvoid: Overhead watering once heads form — water trapped in head causes inner rot\n\nNURTURING\nWeek 2: Apply 5 cm mulch between rows\nWeek 3: Side-dress with LAN at 60g per metre of row — beside the row, water in well\nWeek 5: Second nitrogen application at same rate\nWeek 7: Apply potassium fertilizer (3:1:5) as heads form for firmness and quality. Stop nitrogen now\nWeekly: Inspect outer leaves and remove heavily damaged ones to improve airflow\nWeekly: Hand-weed between rows\n\nPEST AND DISEASE MANAGEMENT\n• Diamondback moth: Small green caterpillars with windows in leaves — the most damaging pest. Spray with Bt or spinosad. Rotate chemical classes to prevent resistance\n• Cabbage looper: Large looping caterpillar — hand-pick early, spray Bt\n• Aphids: Grey clusters under leaves — spray insecticidal soap\n• Clubroot: Swollen distorted roots, wilting plants — no cure. Apply lime to raise pH, avoid brassicas for 6+ years\n• Black rot: Yellow V-shaped lesions on leaf edges — remove affected leaves, spray copper fungicide\n\nHARVESTING\nCabbage heads are ready 60–90 days after transplanting\n\nSigns of readiness:\n• The head feels firm and solid when squeezed\n• Head has reached expected size for the variety (1–2 kg)\n• Outer leaves begin to curl slightly outward\n• Do not wait too long — overripe heads split and lose market value\n\nHow to harvest:\n1. In the morning when it is cool\n2. Cut the head from the stem with a sharp knife, leaving 3–4 wrapper leaves attached\n3. Leave the root and stem in the ground — secondary side-heads develop and harvest 3–4 weeks later\n4. Grade heads by size and firmness\n\nSTORAGE AND HANDLING\n• Fresh-cut cabbages keep in a cool, shaded place for up to 2 weeks\n• Do not wash before storage — moisture promotes rot\n• For market: Keep the outer wrapper leaves — they protect during transport\n• Refrigerated: Whole heads keep for 3–5 weeks at 0–4°C"
  },
};

function useSingleModule(id: string) {
  return useQuery({
    queryKey: ["module", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_modules")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        return MOCK_MODULES[id] ?? MOCK_MODULES["1"];
      }
      return data as LearningModule;
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

export default function ModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const { data: mod, isLoading } = useSingleModule(id ?? "1");
  const { data: bookmarkedIds = [] } = useBookmarks();
  const toggleBookmark = useToggleBookmark();
  const markComplete = useMarkComplete();
  const [completed, setCompleted] = useState(false);

  const role = profile?.role ?? "";
  const canAccess = role === "farmer" || role === "admin";
  const isBookmarked = mod ? bookmarkedIds.includes(mod.id) : false;

  const handleMarkComplete = async () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    setCompleted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (mod) {
      markComplete.mutate(mod.id);
    }
  };

  const handleBookmark = () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    if (!mod) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleBookmark.mutate({ moduleId: mod.id, isBookmarked });
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Feather name="book-open" size={36} color="#2D6A4F" />
        </View>
        <Text style={{ fontSize: 24, fontFamily: "Inter_700Bold", color: C.text, marginBottom: 10, textAlign: "center" }}>
          Farmers Only
        </Text>
        <Text style={{ fontSize: 15, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 23, marginBottom: 32 }}>
          Learning modules are exclusively available to registered farmers. Create a farmer account to access this content.
        </Text>
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, backgroundColor: "#2D6A4F", borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, width: "100%", alignItems: "center" })}
          onPress={() => router.replace("/(auth)/register")}
        >
          <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" }}>Register as a Farmer</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginTop: 14, paddingVertical: 10 })}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: C.primary }}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    );
  }

  if (!canAccess) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Feather name="lock" size={32} color="#2D6A4F" />
        </View>
        <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: C.text, marginBottom: 8, textAlign: "center" }}>
          Access Restricted
        </Text>
        <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: C.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: 28 }}>
          Learning modules are only available to farmers and admins. Your account type ({role}) does not have access.
        </Text>
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, backgroundColor: "#2D6A4F", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 13, flexDirection: "row", alignItems: "center", gap: 8 })}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={16} color="#fff" />
          <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading || !mod) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const levelColor = mod.level === "beginner" ? "#059669" : mod.level === "intermediate" ? "#D97706" : "#DB2777";
  const levelBg = mod.level === "beginner" ? "#D1FAE5" : mod.level === "intermediate" ? "#FEF3C7" : "#FCE7F3";

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color={C.text} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.navBtn,
            isBookmarked && { backgroundColor: `${C.primary}18` },
            { opacity: pressed ? 0.6 : 1 },
          ]}
          onPress={handleBookmark}
        >
          <Feather name="bookmark" size={22} color={isBookmarked ? C.primary : C.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Feather name="book-open" size={36} color={C.primary} />
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.levelPill, { backgroundColor: levelBg }]}>
              <Text style={[styles.levelText, { color: levelColor }]}>{mod.level}</Text>
            </View>
            <View style={styles.metaChip}>
              <Feather name="clock" size={12} color={C.textSecondary} />
              <Text style={styles.metaChipText}>{mod.duration_minutes} min read</Text>
            </View>
            <View style={styles.metaChip}>
              <Feather name="tag" size={12} color={C.textSecondary} />
              <Text style={styles.metaChipText}>{mod.category}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{mod.title}</Text>
          <Text style={styles.heroDesc}>{mod.description}</Text>
        </View>

        <View style={styles.contentCard}>
          {(mod.content || "").split("\n\n").map((block, i) => {
            const trimmed = block.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith("VIDEO:")) {
              const rest = trimmed.slice(6);
              const pipeIdx = rest.indexOf("|");
              const url = pipeIdx !== -1 ? rest.slice(0, pipeIdx) : rest;
              const label = pipeIdx !== -1 ? rest.slice(pipeIdx + 1) : "Watch Tutorial";
              return (
                <Pressable
                  key={i}
                  style={({ pressed }) => [styles.videoCard, { opacity: pressed ? 0.85 : 1 }]}
                  onPress={() => Linking.openURL(url)}
                >
                  <View style={styles.videoIconWrap}>
                    <Feather name="play" size={22} color="#fff" />
                  </View>
                  <View style={styles.videoTextWrap}>
                    <Text style={styles.videoLabel}>{label}</Text>
                    <Text style={styles.videoSub}>Tap to watch on YouTube</Text>
                  </View>
                  <Feather name="external-link" size={16} color={C.primary} />
                </Pressable>
              );
            }

            const isHeading = trimmed === trimmed.toUpperCase() && trimmed.length < 60 && !trimmed.startsWith("•") && !trimmed.match(/^\d/);
            if (isHeading) {
              return <Text key={i} style={styles.contentHeading}>{trimmed}</Text>;
            }
            const lines = trimmed.split("\n");
            return (
              <View key={i} style={styles.contentBlock}>
                {lines.map((line, j) => {
                  if (line.startsWith("•")) {
                    return (
                      <View key={j} style={styles.bulletRow}>
                        <View style={styles.bulletDot} />
                        <Text style={styles.bulletText}>{line.slice(2)}</Text>
                      </View>
                    );
                  }
                  if (line.match(/^\d+\./)) {
                    return (
                      <View key={j} style={styles.bulletRow}>
                        <Text style={styles.bulletNum}>{line.match(/^\d+/)?.[0]}.</Text>
                        <Text style={styles.bulletText}>{line.replace(/^\d+\.\s*/, "")}</Text>
                      </View>
                    );
                  }
                  return <Text key={j} style={styles.contentText}>{line}</Text>;
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {completed || markComplete.isSuccess ? (
          <View style={styles.completedBadge}>
            <Feather name="check-circle" size={20} color={C.success} />
            <Text style={styles.completedText}>Module Completed!</Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.completeBtn, { opacity: pressed || markComplete.isPending ? 0.85 : 1 }]}
            onPress={handleMarkComplete}
            disabled={markComplete.isPending}
          >
            <Feather name="check" size={20} color="#fff" />
            <Text style={styles.completeBtnText}>
              {markComplete.isPending ? "Saving..." : "Mark as Complete"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: C.background,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.surfaceSecondary, alignItems: "center", justifyContent: "center",
  },
  heroSection: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  heroIcon: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: `${C.primary}14`, alignItems: "center", justifyContent: "center",
  },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  levelPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  levelText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaChipText: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.textSecondary },
  heroTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: C.text, lineHeight: 32 },
  heroDesc: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.textSecondary, lineHeight: 22 },
  contentCard: {
    backgroundColor: C.surface, marginHorizontal: 20, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.border, gap: 4,
  },
  contentHeading: {
    fontSize: 12, fontFamily: "Inter_700Bold", color: C.primary, letterSpacing: 0.8, marginTop: 16, marginBottom: 6,
  },
  contentBlock: { gap: 4, marginBottom: 4 },
  contentText: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 24 },
  bulletRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginLeft: 4 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary, marginTop: 9 },
  bulletNum: { fontSize: 15, fontFamily: "Inter_700Bold", color: C.primary, width: 20 },
  bulletText: { fontSize: 15, fontFamily: "Inter_400Regular", color: C.text, lineHeight: 24, flex: 1 },
  footer: {
    paddingHorizontal: 20, paddingTop: 16, backgroundColor: C.background, borderTopWidth: 1, borderTopColor: C.border,
  },
  completeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: C.primary, borderRadius: 14, padding: 16,
  },
  completeBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  completedBadge: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: `${C.success}12`, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: `${C.success}20`,
  },
  completedText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: C.success },
  videoCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: `${C.primary}10`, borderRadius: 14,
    borderWidth: 1, borderColor: `${C.primary}30`,
    padding: 14, marginVertical: 6,
  },
  videoIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: C.primary,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  videoTextWrap: { flex: 1 },
  videoLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: C.text, lineHeight: 20 },
  videoSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSecondary, marginTop: 2 },
});
