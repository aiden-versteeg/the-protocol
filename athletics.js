// =========================================================================
// ATHLETICS ENGINE: UCSB MAC DATABASE, ADAPTIVE REST, MUSCLE HEATMAP & AI COACH
// =========================================================================

const DEFAULT_PRESETS = {
  push1: { title: "Push A (Chest/Delts/Tri)", exercises: ["barbell_bench", "overhead_press", "incline_db_bench", "cable_lateral_raise", "tricep_rope_pushdown"] },
  pull1: { title: "Pull A (Lats/Upper Back/Bi)", exercises: ["pullups", "barbell_row", "chest_supported_tbar", "cable_face_pull", "incline_db_curl", "hammer_curls"] },
  legs: { title: "Legs (Quads/Hams/Calves)", exercises: ["barbell_squat", "romanian_deadlift", "bulgarian_split_squat", "leg_extensions", "seated_leg_curl", "standing_calf_raise"] },
  push2: { title: "Push B (Incline/Side Delts)", exercises: ["incline_db_bench", "flat_db_bench", "seated_db_press", "lateral_raises_db", "overhead_cable_tricep", "chest_dips"] },
  pull2: { title: "Pull B (Deadlift/Rows/Arms)", exercises: ["barbell_deadlift", "lat_pulldown_wide", "db_row_single", "rear_delt_flye", "barbell_curl", "preacher_curl"] }
};

function getActivePresets() {
  return customPresets || DEFAULT_PRESETS;
}

// 80+ UCSB MAC EXERCISE REPOSITORY WITH DETAILED FORM & ANATOMY
const EXERCISE_DATABASE = [
  // CHEST
  { id: "barbell_bench", name: "Barbell Bench Press", category: "Chest", equipment: "Barbell / Flat Bench", target: "Sternal Pectoralis Major, Anterior Deltoid, Triceps Brachii", form: "Plant feet firmly. Retract and depress scapulae. Grip bar ~1.5x shoulder width. Lower under control touching lower sternum with elbows tucked at ~45-60°. Press straight up without flaring.", tips: "Maintain upper-back arch and leg drive; avoid bouncing bar off the ribcage.", fatigueTier: "heavy_compound" },
  { id: "incline_db_bench", name: "Incline Dumbbell Bench Press", category: "Chest", equipment: "Dumbbells / 30° Incline Bench", target: "Clavicular Pectoralis (Upper Chest), Anterior Deltoid", form: "Set bench to 30°. Retract scapulae. Start with dumbbells above upper chest. Lower slowly feeling deep stretch across collarbones. Press up in slight natural arc without clacking weights.", tips: "Avoid steep angles (>45°) which shift load primarily onto front delts.", fatigueTier: "moderate_compound" },
  { id: "hammer_incline_press", name: "Hammer Strength ISO Incline Press", category: "Chest", equipment: "Hammer Strength Plate-Loaded", target: "Upper Chest (Clavicular Head), Triceps", form: "Adjust seat so handles sit at upper chest level. Push elbows forward and drive converging handles upward. Squeeze at top for 1s, lower through 3s eccentric.", tips: "Great for safe progressive overload without needing a spotter.", fatigueTier: "moderate_compound" },
  { id: "hammer_wide_chest", name: "Hammer Strength ISO Wide Chest", category: "Chest", equipment: "Hammer Strength Plate-Loaded", target: "Mid/Lower Pectoralis Major, Sternal Head", form: "Pin back to pad. Drive handles forward through converging arc. Focus on bringing inner biceps across chest.", tips: "Keep shoulder blades locked back into pad at full lockout.", fatigueTier: "moderate_compound" },
  { id: "pec_deck", name: "Machine Pec Deck Flye", category: "Chest", equipment: "Pin-Loaded Machine", target: "Sternal Pectoralis Major (Inner/Mid Chest Isolation)", form: "Seat height so elbows and wrists align with mid-chest. Maintain slight elbow bend. Drive through inner elbows until pads touch. Squeeze peak contraction 1s.", tips: "Do not let shoulders roll forward at the stretch.", fatigueTier: "isolation" },
  { id: "cable_crossover_high", name: "Cable Flyes (High-to-Low)", category: "Chest", equipment: "Cable Jungle / Dual Pulley", target: "Costal & Sternal Pectoralis (Lower Chest)", form: "Set pulleys high. Step forward in staggered stance with slight torso lean. Sweep hands downward across waistband like hugging a tree.", tips: "Keep elbows fixed in slight bend; don't turn it into a press.", fatigueTier: "isolation" },
  { id: "cable_crossover_low", name: "Cable Incline Flyes (Low-to-High)", category: "Chest", equipment: "Cable Jungle / Dual Pulley", target: "Clavicular Pectoralis (Upper Chest Shelf)", form: "Pulleys at lowest point. Palms facing forward and up. Scoop arms upward and inward to chin height with elbows soft.", tips: "Lead with pinkies slightly upward to maximize upper chest recruitment.", fatigueTier: "isolation" },
  { id: "chest_dips", name: "Chest Dips (Parallel Bars)", category: "Chest", equipment: "Dip Station / Weight Belt", target: "Lower Pectoralis, Anterior Delt, Triceps", form: "Lean torso forward ~30°. Flare elbows slightly out. Descend until shoulders are level with elbows. Press back up powerfully.", tips: "Stay pitched forward. Upright posture shifts load exclusively to triceps.", fatigueTier: "moderate_compound" },
  { id: "flat_db_bench", name: "Flat Dumbbell Press", category: "Chest", equipment: "Dumbbells / Flat Bench", target: "Pectoralis Major, Triceps", form: "Tuck elbows 45°. Descend dumbbells to chest depth for full stretch. Press in slight converging arc.", tips: "Offers superior range of motion compared to straight barbells.", fatigueTier: "moderate_compound" },
  { id: "machine_chest_press", name: "Selectorized Machine Chest Press", category: "Chest", equipment: "Pin-Loaded Machine", target: "General Pectoralis Major", form: "Grip handles at mid-chest height. Keep head and shoulders glued to pad. Smooth tempo.", tips: "Ideal drop-set or burnout finisher after heavy barbell work.", fatigueTier: "isolation" },

  // BACK
  { id: "barbell_deadlift", name: "Conventional Barbell Deadlift", category: "Back", equipment: "Olympic Platform / Barbell", target: "Erector Spinae, Gluteus Maximus, Hamstrings, Lats, Traps", form: "Bar over mid-foot. Hip hinge to grab bar just outside knees. Wedge shins to bar, pull slack out, lock lats. Drive floor away pushing through midfoot.", tips: "Do not let lower back round. Lock out hips and glutes fully at the top.", fatigueTier: "heavy_compound" },
  { id: "barbell_row", name: "Barbell Bent-Over Row", category: "Back", equipment: "Barbell / Plates", target: "Latissimus Dorsi, Rhomboids, Middle Trapezius", form: "Hinge torso to ~45°. Grip slightly wider than shoulder width. Pull bar towards belly button, driving elbows back. Squeeze shoulder blades together.", tips: "Avoid excessive torso jerking. Control the eccentric downward.", fatigueTier: "moderate_compound" },
  { id: "pullups", name: "Overhand Pull-Ups", category: "Back", equipment: "Pull-Up Bar / Belt", target: "Latissimus Dorsi (Width), Teres Major, Biceps", form: "Overhand grip ~1.5x shoulder width. Start from dead hang with active shoulders. Drive elbows down into back pockets until chin clears bar.", tips: "Avoid swinging or kicking legs. Full lockout at the bottom.", fatigueTier: "moderate_compound" },
  { id: "chinups", name: "Underhand Chin-Ups", category: "Back", equipment: "Pull-Up Bar", target: "Lats, Biceps Brachii (Short Head)", form: "Supinated grip shoulder-width. Pull chest towards bar emphasizing elbow drive.", tips: "Allows heavier loading and massive bicep recruitment.", fatigueTier: "moderate_compound" },
  { id: "lat_pulldown_wide", name: "Lat Pulldown (Wide Grip)", category: "Back", equipment: "Cable Lat Machine", target: "Latissimus Dorsi, Teres Major", form: "Thighs locked under pads. Lean back ~10°. Pull bar down to collarbone, leading with elbows. Control bar on ascent.", tips: "Never pull behind the neck; this causes rotator cuff impingement.", fatigueTier: "moderate_compound" },
  { id: "hammer_high_row", name: "Hammer Strength ISO High Row", category: "Back", equipment: "Hammer Strength Plate-Loaded", target: "Upper Lats, Rhomboids, Mid Trapezius", form: "Chest firm against pad. Pull handles down and back in diagonal arc. Squeeze scapulae at finish.", tips: "Independent arms eliminate muscular imbalances.", fatigueTier: "moderate_compound" },
  { id: "hammer_low_row", name: "Hammer Strength ISO Low Row", category: "Back", equipment: "Hammer Strength Plate-Loaded", target: "Lower Lats, Rhomboids", form: "Single-arm or bilateral. Pull handle low toward hip pocket, keeping elbow tight to ribcage.", tips: "Pause for 1 second in contracted position.", fatigueTier: "moderate_compound" },
  { id: "seated_cable_row", name: "Seated Cable Row (V-Bar)", category: "Back", equipment: "Low Cable Station / V-Grip", target: "Mid-Back Thickness, Rhomboids, Lats", form: "Sit upright with knees slightly bent. Pull handle into lower abdomen. Pinch shoulder blades together.", tips: "Do not hyperextend or swing your lower back.", fatigueTier: "moderate_compound" },
  { id: "chest_supported_tbar", name: "Chest-Supported T-Bar Row", category: "Back", equipment: "T-Bar Machine", target: "Rhomboids, Traps, Rear Deltoids", form: "Lie face down on pad. Pull handles until elbows pass torso. Squeeze mid-back.", tips: "Zero spinal loading allows pure back overload without lumbar fatigue.", fatigueTier: "moderate_compound" },
  { id: "lat_prayer", name: "Straight-Arm Lat Pulldown (Cable)", category: "Back", equipment: "Cable Pulley / Rope or Bar", target: "Latissimus Dorsi Isolation", form: "Hinge hips slightly. Keep arms almost straight with elbows soft. Pull bar/rope down in wide arc to thighs.", tips: "Pure lat isolation without involving biceps.", fatigueTier: "isolation" },
  { id: "db_row_single", name: "Single-Arm Dumbbell Row", category: "Back", equipment: "Dumbbell / Flat Bench", target: "Latissimus Dorsi, Rhomboids", form: "Place one knee and hand on bench. Pull dumbbell in arc towards hip pocket.", tips: "Don't rotate torso excessively at the top.", fatigueTier: "moderate_compound" },
  { id: "db_shrugs", name: "Dumbbell Shrugs", category: "Back", equipment: "Heavy Dumbbells", target: "Upper Trapezius", form: "Elevate shoulders straight up towards ears. Hold peak contraction for 2s.", tips: "Do not roll shoulders; rolling damages the rotator cuff.", fatigueTier: "isolation" },

  // SHOULDERS
  { id: "overhead_press", name: "Overhead Barbell Press (OHP)", category: "Shoulders", equipment: "Barbell / Squat Rack", target: "Anterior Deltoid, Lateral Deltoid, Triceps, Core", form: "Grip shoulder width. Clench glutes and brace core. Press vertically, moving head back slightly to clear chin, then push head forward under bar at lockout.", tips: "Lockout with active shoulder shrug at top.", fatigueTier: "heavy_compound" },
  { id: "seated_db_press", name: "Seated Dumbbell Shoulder Press", category: "Shoulders", equipment: "Dumbbells / High-Incline Bench", target: "Anterior & Lateral Deltoids", form: "Bench at 75-80°. Lower dumbbells until level with ears. Press upward without clacking weights.", tips: "Keep wrists stacked directly over elbows throughout.", fatigueTier: "moderate_compound" },
  { id: "hammer_shoulder_press", name: "Hammer Strength Shoulder Press", category: "Shoulders", equipment: "Hammer Strength Plate-Loaded", target: "Deltoid Anterior & Lateral Heads", form: "Adjust seat so handles are at ear height. Drive converging handles overhead.", tips: "Allows heavy pressing volume without stabilization breakdown.", fatigueTier: "moderate_compound" },
  { id: "lateral_raises_db", name: "Dumbbell Lateral Raises", category: "Shoulders", equipment: "Dumbbells", target: "Lateral Deltoid (Shoulder Width)", form: "Slight forward torso lean. Raise dumbbells out to sides leading with elbows. Stop at shoulder height. 3-second eccentric down.", tips: "Do not swing hips or shrug upper traps.", fatigueTier: "isolation" },
  { id: "cable_lateral_raise", name: "Cable Lateral Raises (Behind Back)", category: "Shoulders", equipment: "Low Cable Station / D-Handle", target: "Lateral Deltoid (Continuous Tension)", form: "Cable set to knee/hip height. Cable passes behind back. Pull outward to shoulder height.", tips: "Maintains peak tension at bottom where dumbbells provide zero load.", fatigueTier: "isolation" },
  { id: "cable_face_pull", name: "Cable Face Pulls (with External Rotation)", category: "Shoulders", equipment: "High Cable / Rope Attachment", target: "Posterior Deltoid, Infraspinatus, Teres Minor, Rhomboids", form: "Set rope at eye level. Pull rope towards bridge of nose, pulling handles apart while rotating thumbs backward.", tips: "Essential posture and rotator cuff health builder.", fatigueTier: "isolation" },
  { id: "rear_delt_flye", name: "Reverse Pec Deck Flye", category: "Shoulders", equipment: "Machine Pec Deck", target: "Posterior Deltoid", form: "Chest against pad. Arms parallel to floor with soft elbows. Sweep arms back squeezing rear delts.", tips: "Focus on pulling with the back of the shoulders, not squeezing shoulder blades.", fatigueTier: "isolation" },
  { id: "arnold_press", name: "Arnold Dumbbell Press", category: "Shoulders", equipment: "Dumbbells", target: "Anterior & Lateral Deltoids", form: "Start with palms facing chest. Rotate wrists outward as you press overhead.", tips: "Controls rotation through full shoulder ROM.", fatigueTier: "moderate_compound" },

  // LEGS
  { id: "barbell_squat", name: "Barbell Back Squat", category: "Legs", equipment: "Squat Rack / Barbell", target: "Quadriceps, Gluteus Maximus, Adductor Magnus", form: "Bar resting on upper traps or rear delts. Feet shoulder width. Inhale 360° belly brace. Break at hips and knees, descend to parallel or below. Drive out of the hole through midfoot.", tips: "Knees must track in line with toes; avoid knee caving (valgus).", fatigueTier: "heavy_compound" },
  { id: "front_squat", name: "Barbell Front Squat", category: "Legs", equipment: "Squat Rack / Barbell", target: "Quadriceps (Vastus Medialis), Thoracic Spine, Core", form: "Fingertip clean grip or cross-arm. Keep elbows high parallel to floor. Descend upright deep into squat.", tips: "High quad and core recruitment with reduced spinal compression.", fatigueTier: "heavy_compound" },
  { id: "hack_squat", name: "Linear Machine Hack Squat", category: "Legs", equipment: "Hack Squat Sled", target: "Quadriceps Isolation (Rectus Femoris, Vastus)", form: "Shoulders locked into pads. Place feet mid-to-low on platform. Descend into full knee flexion without lower back lifting.", tips: "Elite movement for deep hypertrophy with zero spinal shear.", fatigueTier: "heavy_compound" },
  { id: "romanian_deadlift", name: "Romanian Deadlift (RDL)", category: "Legs", equipment: "Barbell or Heavy Dumbbells", target: "Hamstrings (Semitendinosus, Biceps Femoris), Gluteus Maximus", form: "Stand tall. Soft knee bend. Hinge hips back pushing butt toward wall. Bar glides down thighs/shins until deep hamstring stretch. Squeeze glutes to return.", tips: "Do not bend knees further during descent; it is a hip hinge, not a squat.", fatigueTier: "heavy_compound" },
  { id: "leg_press_45", name: "45-Degree Leg Press", category: "Legs", equipment: "Plate-Loaded Leg Press", target: "Quadriceps, Glutes", form: "Feet shoulder-width on carriage. Lower sled until knees are 90°. Drive through midfoot.", tips: "Never lock knees out violently at the top.", fatigueTier: "heavy_compound" },
  { id: "bulgarian_split_squat", name: "Bulgarian Split Squat", category: "Legs", equipment: "Dumbbells / Flat Bench", target: "Quadriceps, Gluteus Medius & Maximus", form: "Rear foot on bench. Drop rear knee straight down toward floor. Forward torso lean hits glutes; upright torso hits quads.", tips: "Dominant unilateral movement for athletic symmetry.", fatigueTier: "moderate_compound" },
  { id: "hip_thrust", name: "Barbell Hip Thrust", category: "Legs", equipment: "Barbell / Hip Pad / Bench", target: "Gluteus Maximus (Peak Contraction)", form: "Upper back against bench. Bar placed over hips with pad. Feet flat under knees. Drive hips up into posterior pelvic tilt, lock out with horizontal torso.", tips: "Keep chin tucked and eyes forward, not looking at ceiling.", fatigueTier: "heavy_compound" },
  { id: "leg_extensions", name: "Seated Leg Extension Machine", category: "Legs", equipment: "Pin-Loaded Machine", target: "Quadriceps (Rectus Femoris Shortened Position)", form: "Back flat against seat. Shin pad on lower shins. Extend knees fully, hold 1s at top contraction, 3s eccentric.", tips: "Hold handles to keep butt glued to seat.", fatigueTier: "isolation" },
  { id: "seated_leg_curl", name: "Seated Hamstring Curl", category: "Legs", equipment: "Pin-Loaded Machine", target: "Hamstrings (Shortened & Lengthened)", form: "Lap pad clamped firmly against thighs. Curl heels under seat. Controlled return.", tips: "Seated hamstring curls produce superior hypertrophy over lying curls due to hip flexion stretch.", fatigueTier: "isolation" },
  { id: "standing_calf_raise", name: "Standing Machine Calf Raise", category: "Legs", equipment: "Calf Machine", target: "Gastrocnemius", form: "Balls of feet on block. Deep stretch at bottom (pause 2s). Explode upward onto big toes, pause at top 1s.", tips: "Bouncing eliminates tension by relying on Achilles tendon elasticity.", fatigueTier: "isolation" },
  { id: "copenhagen_plank", name: "Copenhagen Adductor Plank", category: "Legs", equipment: "Flat Bench / Bodyweight", target: "Groin / Adductor Longus & Magnus, Obliques", form: "Side plank position with top foot resting on bench. Bottom leg hovered off floor. Hold rigid isometric line.", tips: "Essential protocol rehab movement for groin injury prevention.", fatigueTier: "isolation" },

  // ARMS
  { id: "barbell_curl", name: "Barbell Bicep Curl", category: "Arms", equipment: "Barbell or EZ-Bar", target: "Biceps Brachii (Short & Long Heads)", form: "Elbows pinned to sides. Curl bar up focusing on bicep squeeze without swinging lower back.", tips: "Lower through full extension at the bottom.", fatigueTier: "isolation" },
  { id: "incline_db_curl", name: "Incline Dumbbell Curl", category: "Arms", equipment: "Dumbbells / 45° Incline Bench", target: "Long Head Biceps (Peak Stretch)", form: "Lie on 45° bench. Arms hang vertically behind torso. Curl dumbbells while supinating wrists outward.", tips: "The backward arm angle stretches the long head across the shoulder joint.", fatigueTier: "isolation" },
  { id: "hammer_curls", name: "Dumbbell Hammer Curls", category: "Arms", equipment: "Dumbbells", target: "Brachialis, Brachioradialis (Forearm & Arm Thickness)", form: "Neutral grip (palms facing each other). Curl dumbbells upward keeping wrists stiff.", tips: "Pushes biceps upward for thicker upper arm profile.", fatigueTier: "isolation" },
  { id: "preacher_curl", name: "EZ-Bar Preacher Curl", category: "Arms", equipment: "Preacher Bench / EZ-Bar", target: "Short Head Biceps (Strict Isolation)", form: "Armpits snug against top of pad. Curl bar to vertical without elbows lifting off pad.", tips: "Stop just short of vertical to maintain tension; don't overextend elbows at bottom.", fatigueTier: "isolation" },
  { id: "skull_crushers", name: "EZ-Bar Skull Crushers", category: "Arms", equipment: "EZ-Bar / Flat Bench", target: "Triceps Brachii (Long & Medial Heads)", form: "Arms angled slightly backward ~10°. Lower bar to crown of head or just behind bench. Extend elbows forcefully.", tips: "Keeping elbows angled back maintains continuous tension on long head.", fatigueTier: "isolation" },
  { id: "tricep_rope_pushdown", name: "Cable Tricep Rope Pushdown", category: "Arms", equipment: "Cable Pulley / Rope", target: "Triceps Lateral & Medial Heads", form: "Elbows locked at sides. Push rope down, flaring ends apart at bottom for full contraction.", tips: "Keep torso still; avoid leaning over the rope.", fatigueTier: "isolation" },
  { id: "overhead_cable_tricep", name: "Overhead Cable Tricep Extension", category: "Arms", equipment: "Cable Pulley / Rope", target: "Triceps Long Head", form: "Face away from high or mid pulley. Lean forward with rope behind head. Extend elbows straight forward.", tips: "Provides maximum long-head stretch which cannot be achieved with standard pushdowns.", fatigueTier: "isolation" },

  // CORE & CLIMBING
  { id: "hanging_leg_raise", name: "Hanging Leg Raises", category: "Core & Climbing", equipment: "Pull-Up Bar", target: "Rectus Abdominis, Hip Flexors, Grip", form: "Hang with active shoulders. Curl pelvis upward bringing toes to the bar without swinging.", tips: "Think of rolling your pelvis toward your sternum rather than simply lifting legs.", fatigueTier: "isolation" },
  { id: "cable_crunch", name: "Kneeling Cable Crunch", category: "Core & Climbing", equipment: "High Cable / Rope", target: "Upper & Mid Rectus Abdominis", form: "Kneel holding rope by ears. Crunch ribcage down toward pelvis rounding upper back.", tips: "Do not sit back on your calves; hips stay stationary.", fatigueTier: "isolation" },
  { id: "ab_wheel", name: "Ab Wheel Rollout", category: "Core & Climbing", equipment: "Ab Wheel", target: "Transverse Abdominis, Anterior Core Anti-Extension", form: "Tuck pelvis into posterior tilt. Roll wheel forward keeping core braced until chest nears floor. Pull back with abs.", tips: "Do not let lower back sag or hyperextend.", fatigueTier: "isolation" },
  { id: "hangboard_hangs", name: "Hangboard Deadhangs (Half-Crimp)", category: "Core & Climbing", equipment: "Climbing Hangboard / Campus Rung", target: "Finger Flexors (FDP/FDS), Grip Strength, Forearms", form: "Half-crimp or open-hand on 20mm edge. Engage scaps and shoulders. Hold strictly for 7-10 seconds.", tips: "Crucial for rock climbing tendon strength; warm up thoroughly first.", fatigueTier: "isolation" },
  { id: "farmers_walk", name: "Trap Bar / Heavy DB Farmer's Walk", category: "Core & Climbing", equipment: "Trap Bar or Heavy Dumbbells", target: "Grip, Forearms, Upper Trapezius, Core Stability", form: "Pick up weight with flat back. Stand tall with chest up. Walk in smooth, controlled strides.", tips: "Resist lateral sway and keep shoulders packed down.", fatigueTier: "heavy_compound" }
];

// MUSCLE GROUP TARGET MAPPINGS
const MUSCLE_MAPPING = {
  barbell_bench: { chest: 1.0, front_delt: 0.5, triceps: 0.5 },
  incline_db_bench: { chest: 1.0, front_delt: 0.6, triceps: 0.4 },
  hammer_incline_press: { chest: 1.0, front_delt: 0.5, triceps: 0.4 },
  hammer_wide_chest: { chest: 1.0, triceps: 0.3 },
  pec_deck: { chest: 1.0 },
  cable_crossover_high: { chest: 1.0 },
  cable_crossover_low: { chest: 1.0 },
  chest_dips: { chest: 0.8, triceps: 0.8, front_delt: 0.4 },
  flat_db_bench: { chest: 1.0, triceps: 0.4 },
  machine_chest_press: { chest: 1.0, triceps: 0.4 },

  barbell_deadlift: { hamstrings: 0.8, glutes: 0.8, lower_back: 1.0, lats: 0.5, traps: 0.6, forearms: 0.5 },
  barbell_row: { lats: 0.8, rhomboids: 1.0, traps: 0.6, biceps: 0.4 },
  pullups: { lats: 1.0, biceps: 0.6, rear_delt: 0.4 },
  chinups: { lats: 0.8, biceps: 0.8 },
  lat_pulldown_wide: { lats: 1.0, biceps: 0.4 },
  hammer_high_row: { lats: 0.7, rhomboids: 0.8, traps: 0.6 },
  hammer_low_row: { lats: 1.0, rhomboids: 0.6 },
  seated_cable_row: { rhomboids: 0.9, lats: 0.7, traps: 0.5, biceps: 0.4 },
  chest_supported_tbar: { rhomboids: 1.0, traps: 0.8, rear_delt: 0.6 },
  lat_prayer: { lats: 1.0 },
  db_row_single: { lats: 1.0, rhomboids: 0.6 },
  db_shrugs: { traps: 1.0 },

  overhead_press: { front_delt: 1.0, side_delt: 0.6, triceps: 0.6, core: 0.3 },
  seated_db_press: { front_delt: 0.9, side_delt: 0.6, triceps: 0.5 },
  hammer_shoulder_press: { front_delt: 0.9, side_delt: 0.5, triceps: 0.5 },
  lateral_raises_db: { side_delt: 1.0 },
  cable_lateral_raise: { side_delt: 1.0 },
  cable_face_pull: { rear_delt: 1.0, traps: 0.5 },
  rear_delt_flye: { rear_delt: 1.0 },
  arnold_press: { front_delt: 0.8, side_delt: 0.6, triceps: 0.4 },

  barbell_squat: { quads: 1.0, glutes: 0.8, core: 0.4 },
  front_squat: { quads: 1.0, core: 0.6 },
  hack_squat: { quads: 1.0, glutes: 0.4 },
  romanian_deadlift: { hamstrings: 1.0, glutes: 0.8, lower_back: 0.5 },
  leg_press_45: { quads: 0.9, glutes: 0.5 },
  bulgarian_split_squat: { quads: 0.8, glutes: 0.8 },
  hip_thrust: { glutes: 1.0, hamstrings: 0.4 },
  leg_extensions: { quads: 1.0 },
  seated_leg_curl: { hamstrings: 1.0 },
  standing_calf_raise: { calves: 1.0 },
  copenhagen_plank: { core: 0.6, groin: 1.0 },

  barbell_curl: { biceps: 1.0, forearms: 0.3 },
  incline_db_curl: { biceps: 1.0 },
  hammer_curls: { biceps: 0.7, forearms: 0.8 },
  preacher_curl: { biceps: 1.0 },
  skull_crushers: { triceps: 1.0 },
  tricep_rope_pushdown: { triceps: 1.0 },
  overhead_cable_tricep: { triceps: 1.0 },

  hanging_leg_raise: { core: 1.0, forearms: 0.4 },
  cable_crunch: { core: 1.0 },
  ab_wheel: { core: 1.0 },
  hangboard_hangs: { forearms: 1.0 },
  farmers_walk: { forearms: 1.0, traps: 0.7, core: 0.6 }
};

// ==========================================
// BACKGROUND TIMESTAMP TIMER (NEVER FREEZES)
// ==========================================
let globalWorkoutTick = null;

function ensureWorkoutTickRunning() {
  if (globalWorkoutTick) return;
  globalWorkoutTick = setInterval(() => {
    const todayKey = getDayKey(new Date());
    const rec = appData[todayKey];
    if (rec && rec.workout && rec.workout.startTime && !rec.workout.completed) {
      rec.workout.durationSeconds = Math.floor((Date.now() - rec.workout.startTime) / 1000);
      updateTimerDisplays(rec);
    }
  }, 1000);
}
ensureWorkoutTickRunning();

function updateTimerDisplays(rec) {
  const durSecs = rec.workout.durationSeconds || 0;
  const hrs = Math.floor(durSecs / 3600);
  const mins = Math.floor((durSecs % 3600) / 60);
  const secs = durSecs % 60;
  const timeFormatted = `${hrs > 0 ? hrs + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const elLive = document.getElementById('liveWorkoutDurationText');
  if (elLive) elLive.innerText = timeFormatted;

  const elPill = document.getElementById('minimizedWorkoutPillTime');
  if (elPill) elPill.innerText = timeFormatted;

  // Rest Countdown Check
  if (rec.workout.restEndTime) {
    const remaining = Math.max(0, Math.ceil((rec.workout.restEndTime - Date.now()) / 1000));
    const rM = Math.floor(remaining / 60);
    const rS = remaining % 60;
    const restFormatted = `${String(rM).padStart(2, '0')}:${String(rS).padStart(2, '0')}`;

    const rEl = document.getElementById('liveRestTimerCountdown');
    if (rEl) rEl.innerText = restFormatted;

    const banner = document.getElementById('liveRestTimerBanner');
    if (banner) {
      if (remaining > 0) banner.classList.remove('hidden');
      else banner.classList.add('hidden');
    }

    if (remaining === 0 && rec.workout.restEndTime !== null) {
      rec.workout.restEndTime = null;
      playRestChime();
    }
  }
}

// ADAPTIVE REST TIME CALCULATOR
function getCalculatedRestSeconds(exerciseId) {
  if (!userGoals.adaptiveRestEnabled) {
    return userGoals.defaultRestSeconds || 90;
  }
  const ex = EXERCISE_DATABASE.find(e => e.id === exerciseId);
  if (!ex) return userGoals.defaultRestSeconds || 90;

  switch (ex.fatigueTier) {
    case 'heavy_compound': return 180; // 3.0 min for Squat, Deadlift, Bench, OHP, Hack
    case 'moderate_compound': return 120; // 2.0 min for DB presses, rows, pullups
    case 'isolation':
    default:
      return 75; // 75s for arms, lateral delts, calves, abs
  }
}

// AUDIO CHIME (WEB AUDIO SYNTHESIZER)
function playRestChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.25, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.3);

    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1174.66, ctx.currentTime);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.45);
    }, 180);

    if (navigator.vibrate) navigator.vibrate([100, 50, 200]);
  } catch (e) {
    console.warn("Audio chime prevented by browser autoplay policy:", e);
  }
}

// ==========================================
// MUSCLE HEATMAP GENERATOR (FRONT & BACK SVG)
// ==========================================
function calculateMuscleVolumes(rec) {
  const scores = {
    chest: 0, lats: 0, front_delt: 0, side_delt: 0, rear_delt: 0,
    rhomboids: 0, traps: 0, biceps: 0, triceps: 0, forearms: 0,
    core: 0, quads: 0, hamstrings: 0, glutes: 0, calves: 0, lower_back: 0
  };

  (rec.workout.exercises || []).forEach(ex => {
    const doneSets = ex.sets.filter(s => s.done).length;
    const map = MUSCLE_MAPPING[ex.id] || {};
    for (const [muscle, factor] of Object.entries(map)) {
      if (scores[muscle] !== undefined) {
        scores[muscle] += doneSets * factor;
      }
    }
  });

  return scores;
}

function getStimulusColor(sets) {
  if (sets === 0) return "#1e293b"; // Slate-800: Cold
  if (sets < 3) return "#0284c7";   // Blue-600: Primed
  if (sets <= 6) return "#10b981";  // Emerald-500: Optimal Hypertrophy
  if (sets <= 9) return "#f59e0b";  // Amber-500: High Volume
  return "#ef4444";                 // Rose-500: Maximum Overreaching
}

function renderMuscleHeatmapSvg(scores) {
  return `
    <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow-xl text-center space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-slate-900">
        <div class="text-left">
          <h4 class="text-xs font-bold text-white flex items-center gap-1.5">
            <i data-lucide="activity" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>Anatomical Hypertrophy Heatmap</span>
          </h4>
          <p class="text-[9px] text-slate-400">Live muscle strain and effective stimulus distribution</p>
        </div>
      </div>

      <!-- Schematics Container -->
      <div class="flex items-center justify-center gap-6 py-2">
        <!-- FRONT VIEW -->
        <div class="space-y-1">
          <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Anterior (Front)</span>
          <svg viewBox="0 0 100 160" class="w-28 h-44 mx-auto filter drop-shadow">
            <!-- Head -->
            <circle cx="50" cy="12" r="8" fill="#334155" />
            <rect x="47" y="20" width="6" height="5" fill="#334155" />

            <!-- Shoulders / Front Delts -->
            <path d="M 33 26 C 28 26, 26 36, 28 42 C 32 40, 36 34, 37 28 Z" fill="${getStimulusColor(scores.front_delt)}" />
            <path d="M 67 26 C 72 26, 74 36, 72 42 C 68 40, 64 34, 63 28 Z" fill="${getStimulusColor(scores.front_delt)}" />

            <!-- Chest -->
            <path d="M 38 27 C 44 26, 49 28, 49 42 C 43 43, 37 40, 34 32 Z" fill="${getStimulusColor(scores.chest)}" />
            <path d="M 62 27 C 56 26, 51 28, 51 42 C 57 43, 63 40, 66 32 Z" fill="${getStimulusColor(scores.chest)}" />

            <!-- Biceps -->
            <rect x="25" y="42" width="7" height="18" rx="3.5" fill="${getStimulusColor(scores.biceps)}" />
            <rect x="68" y="42" width="7" height="18" rx="3.5" fill="${getStimulusColor(scores.biceps)}" />

            <!-- Forearms -->
            <rect x="23" y="62" width="6" height="20" rx="3" fill="${getStimulusColor(scores.forearms)}" />
            <rect x="71" y="62" width="6" height="20" rx="3" fill="${getStimulusColor(scores.forearms)}" />

            <!-- Abs / Core -->
            <rect x="42" y="45" width="16" height="28" rx="3" fill="${getStimulusColor(scores.core)}" />

            <!-- Quads / Legs -->
            <path d="M 37 76 C 36 82, 34 110, 38 118 C 43 118, 46 95, 47 76 Z" fill="${getStimulusColor(scores.quads)}" />
            <path d="M 63 76 C 64 82, 66 110, 62 118 C 57 118, 54 95, 53 76 Z" fill="${getStimulusColor(scores.quads)}" />

            <!-- Calves (Anterior tibialis) -->
            <rect x="37" y="122" width="6" height="28" rx="2.5" fill="${getStimulusColor(scores.calves)}" />
            <rect x="57" y="122" width="6" height="28" rx="2.5" fill="${getStimulusColor(scores.calves)}" />
          </svg>
        </div>

        <!-- BACK VIEW -->
        <div class="space-y-1">
          <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Posterior (Back)</span>
          <svg viewBox="0 0 100 160" class="w-28 h-44 mx-auto filter drop-shadow">
            <!-- Head -->
            <circle cx="50" cy="12" r="8" fill="#334155" />
            <rect x="47" y="20" width="6" height="5" fill="#334155" />

            <!-- Traps -->
            <path d="M 42 22 L 58 22 L 54 36 L 46 36 Z" fill="${getStimulusColor(scores.traps)}" />

            <!-- Rear Delts -->
            <path d="M 33 26 C 28 27, 26 35, 29 40 C 33 38, 36 34, 36 28 Z" fill="${getStimulusColor(scores.rear_delt)}" />
            <path d="M 67 26 C 72 27, 74 35, 71 40 C 67 38, 64 34, 64 28 Z" fill="${getStimulusColor(scores.rear_delt)}" />

            <!-- Lats & Rhomboids -->
            <path d="M 38 32 C 45 35, 49 42, 48 58 C 42 54, 36 45, 34 36 Z" fill="${getStimulusColor(scores.lats)}" />
            <path d="M 62 32 C 55 35, 51 42, 52 58 C 58 54, 64 45, 66 36 Z" fill="${getStimulusColor(scores.lats)}" />

            <!-- Triceps -->
            <rect x="25" y="40" width="7" height="19" rx="3.5" fill="${getStimulusColor(scores.triceps)}" />
            <rect x="68" y="40" width="7" height="19" rx="3.5" fill="${getStimulusColor(scores.triceps)}" />

            <!-- Lower Back -->
            <rect x="43" y="58" width="14" height="16" rx="2" fill="${getStimulusColor(scores.lower_back)}" />

            <!-- Glutes -->
            <ellipse cx="43" cy="82" rx="7" ry="7" fill="${getStimulusColor(scores.glutes)}" />
            <ellipse cx="57" cy="82" rx="7" ry="7" fill="${getStimulusColor(scores.glutes)}" />

            <!-- Hamstrings -->
            <rect x="36" y="92" width="10" height="26" rx="3" fill="${getStimulusColor(scores.hamstrings)}" />
            <rect x="54" y="92" width="10" height="26" rx="3" fill="${getStimulusColor(scores.hamstrings)}" />

            <!-- Calves -->
            <rect x="36" y="122" width="8" height="26" rx="3" fill="${getStimulusColor(scores.calves)}" />
            <rect x="56" y="122" width="8" height="26" rx="3" fill="${getStimulusColor(scores.calves)}" />
          </svg>
        </div>
      </div>

      <!-- Color Legend -->
      <div class="grid grid-cols-5 gap-1 pt-1 text-[8px] font-bold uppercase tracking-wider text-slate-400">
        <div class="flex items-center justify-center gap-1"><span class="w-2 h-2 rounded bg-slate-800"></span>Cold</div>
        <div class="flex items-center justify-center gap-1"><span class="w-2 h-2 rounded bg-sky-500"></span>Primed (1-2)</div>
        <div class="flex items-center justify-center gap-1"><span class="w-2 h-2 rounded bg-emerald-500"></span>Optimal (3-6)</div>
        <div class="flex items-center justify-center gap-1"><span class="w-2 h-2 rounded bg-amber-500"></span>High (7-9)</div>
        <div class="flex items-center justify-center gap-1"><span class="w-2 h-2 rounded bg-rose-500"></span>Max (10+)</div>
      </div>
    </div>
  `;
}

// ==========================================
// FULL-SCREEN IMMERSIVE WORKOUT MODE
// ==========================================
function launchLiveWorkoutSession() {
  const overlay = document.getElementById('fullScreenWorkoutOverlay');
  if (!overlay) return;
  const rec = getDayRecord(getDayKey(currentDate));

  if (!rec.workout.startTime) {
    rec.workout.startTime = Date.now();
  }

  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  renderLiveWorkoutContent();
}

function closeLiveWorkoutSession() {
  const overlay = document.getElementById('fullScreenWorkoutOverlay');
  if (overlay) overlay.classList.add('hidden');
  document.body.style.overflow = '';
  render();
}

function startRestCountdown(seconds) {
  const rec = getDayRecord(getDayKey(currentDate));
  rec.workout.restEndTime = Date.now() + (seconds * 1000);

  const banner = document.getElementById('liveRestTimerBanner');
  if (banner) banner.classList.remove('hidden');
}

function modifyRestTime(delta) {
  const rec = getDayRecord(getDayKey(currentDate));
  if (rec.workout.restEndTime) {
    rec.workout.restEndTime += (delta * 1000);
  }
}

function cancelRestCountdown() {
  const rec = getDayRecord(getDayKey(currentDate));
  rec.workout.restEndTime = null;
  const banner = document.getElementById('liveRestTimerBanner');
  if (banner) banner.classList.add('hidden');
}

function renderLiveWorkoutContent() {
  const overlay = document.getElementById('fullScreenWorkoutOverlay');
  if (!overlay) return;
  const rec = getDayRecord(getDayKey(currentDate));
  const muscleScores = calculateMuscleVolumes(rec);

  let exercisesHtml = '';
  if (!rec.workout.exercises || rec.workout.exercises.length === 0) {
    exercisesHtml = `
      <div class="text-center py-16 border border-dashed border-slate-800 rounded-2xl p-6 text-slate-500">
        <i data-lucide="dumbbell" class="w-10 h-10 mx-auto text-slate-600 mb-2"></i>
        <p class="text-sm font-bold text-slate-400">No lifts added to this session.</p>
        <p class="text-xs text-slate-600 mt-1">Select a PPLPP preset or add exercises from the UCSB MAC database below.</p>
      </div>
    `;
  } else {
    exercisesHtml = rec.workout.exercises.map((ex, exIdx) => {
      const exMeta = EXERCISE_DATABASE.find(e => e.id === ex.id);
      const calculatedRest = getCalculatedRestSeconds(ex.id);

      const setsRows = ex.sets.map((set, sIdx) => `
        <tr class="text-xs border-b border-slate-900">
          <td class="py-2 text-center font-bold text-slate-500">S${sIdx + 1}</td>
          <td class="py-2 px-1">
            <input type="number" step="2.5" value="${set.weight || ''}" placeholder="lbs" onchange="updateLiveSetVal(${exIdx}, ${sIdx}, 'weight', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-center text-white font-extrabold focus:border-orange-500" />
          </td>
          <td class="py-2 px-1">
            <input type="number" value="${set.reps || ''}" placeholder="reps" onchange="updateLiveSetVal(${exIdx}, ${sIdx}, 'reps', this.value)" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-center text-white font-extrabold focus:border-orange-500" />
          </td>
          <td class="py-2 text-center">
            <button onclick="toggleLiveSetDone(${exIdx}, ${sIdx}, '${ex.id}')" class="w-8 h-8 rounded-lg font-bold border transition flex items-center justify-center mx-auto ${
              set.done ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30' : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-white'
            }">✓</button>
          </td>
          <td class="py-2 text-center">
            <button onclick="removeLiveSet(${exIdx}, ${sIdx})" class="text-slate-600 hover:text-rose-400 p-1">✕</button>
          </td>
        </tr>
      `).join('');

      return `
        <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-xl">
          <div class="flex items-center justify-between pb-2 border-b border-slate-900">
            <div>
              <div class="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                <span>${ex.name}</span>
                <button onclick="showExerciseInfoModal('${ex.id}')" class="text-slate-400 hover:text-cyan-400 p-0.5"><i data-lucide="info" class="w-3.5 h-3.5"></i></button>
              </div>
              <div class="text-[9px] text-slate-500 flex items-center gap-2 mt-0.5">
                <span>${exMeta?.equipment || 'UCSB MAC Machine'}</span>
                <span class="text-amber-400 font-mono font-bold">• ${calculatedRest}s Rest</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <button onclick="addLiveSet(${exIdx})" class="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">+ Set</button>
              <button onclick="removeLiveExercise(${exIdx})" class="text-slate-600 hover:text-rose-400 p-1"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </div>
          </div>

          <table class="w-full text-left">
            <thead>
              <tr class="text-[9px] text-slate-500 uppercase border-b border-slate-900">
                <th class="pb-1 text-center w-8">Set</th>
                <th class="pb-1 text-center">Weight (lbs)</th>
                <th class="pb-1 text-center">Reps</th>
                <th class="pb-1 text-center w-10">Done</th>
                <th class="pb-1 text-center w-6"></th>
              </tr>
            </thead>
            <tbody>${setsRows}</tbody>
          </table>
        </div>
      `;
    }).join('');
  }

  overlay.innerHTML = `
    <!-- IMMERSIVE WORKOUT TOP BAR -->
    <header class="bg-slate-950/95 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-xl shrink-0">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
        <div>
          <h2 class="text-xs font-black text-white uppercase tracking-wider">${rec.workout.title || 'Live Workout Session'}</h2>
          <div class="text-[10px] text-orange-400 font-mono font-bold flex items-center gap-1">
            <i data-lucide="clock" class="w-3 h-3"></i>
            <span id="liveWorkoutDurationText">00:00</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-1.5">
        <button onclick="closeLiveWorkoutSession()" class="px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-slate-900 text-slate-400 hover:text-white border border-slate-800">
          Minimize
        </button>
        <button onclick="finishLiveWorkoutSession()" class="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition">
          Finish Workout
        </button>
      </div>
    </header>

    <!-- LIVE REST TIMER FLOATING BANNER -->
    <div id="liveRestTimerBanner" class="${rec.workout.restEndTime ? '' : 'hidden'} bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border-b border-cyan-500/40 px-4 py-2 flex items-center justify-between text-xs shadow-lg shrink-0">
      <div class="flex items-center gap-2">
        <i data-lucide="timer" class="w-4 h-4 text-cyan-400 animate-spin"></i>
        <div>
          <span class="text-[10px] text-slate-400 font-bold uppercase">Resting: </span>
          <span id="liveRestTimerCountdown" class="text-sm font-mono font-black text-cyan-300">01:30</span>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <button onclick="modifyRestTime(-15)" class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">-15s</button>
        <button onclick="modifyRestTime(30)" class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">+30s</button>
        <button onclick="cancelRestCountdown()" class="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 text-[10px] font-bold">Skip</button>
      </div>
    </div>

    <!-- WORKOUT BODY SCROLLER -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll max-w-xl mx-auto w-full pb-32">
      <!-- Live Muscle Heatmap -->
      ${renderMuscleHeatmapSvg(muscleScores)}

      <!-- Split Presets Selector -->
      <div class="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-2xl">
        <div class="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
          <span>Switch Split Preset:</span>
          <span class="text-orange-400 font-mono">PPLPP Cycle</span>
        </div>
        <div class="grid grid-cols-5 gap-1 text-center">
          <button onclick="loadLivePreset('push1')" class="py-1 rounded-lg text-[9px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">Push A</button>
          <button onclick="loadLivePreset('pull1')" class="py-1 rounded-lg text-[9px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">Pull A</button>
          <button onclick="loadLivePreset('legs')" class="py-1 rounded-lg text-[9px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">Legs</button>
          <button onclick="loadLivePreset('push2')" class="py-1 rounded-lg text-[9px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">Push B</button>
          <button onclick="loadLivePreset('pull2')" class="py-1 rounded-lg text-[9px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800">Pull B</button>
        </div>
      </div>

      ${exercisesHtml}

      <button onclick="openExerciseModal()" class="w-full py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-dashed border-orange-500/40 text-orange-400 font-bold text-xs flex items-center justify-center gap-2 transition">
        <i data-lucide="plus-circle" class="w-4 h-4"></i> Add UCSB MAC Lift / Movement
      </button>
    </div>
  `;

  lucide.createIcons();
}

function addLiveSet(exIdx) {
  const rec = getDayRecord(getDayKey(currentDate));
  const ex = rec.workout.exercises[exIdx];
  if (ex) {
    const last = ex.sets[ex.sets.length - 1] || { weight: 0, reps: 0 };
    ex.sets.push({ weight: last.weight, reps: last.reps, done: false });
    renderLiveWorkoutContent();
  }
}

function removeLiveSet(exIdx, sIdx) {
  const rec = getDayRecord(getDayKey(currentDate));
  const ex = rec.workout.exercises[exIdx];
  if (ex && ex.sets.length > 1) {
    ex.sets.splice(sIdx, 1);
    renderLiveWorkoutContent();
  }
}

function updateLiveSetVal(exIdx, sIdx, field, val) {
  const rec = getDayRecord(getDayKey(currentDate));
  const ex = rec.workout.exercises[exIdx];
  if (ex && ex.sets[sIdx]) {
    ex.sets[sIdx][field] = parseFloat(val) || 0;
  }
}

function toggleLiveSetDone(exIdx, sIdx, exerciseId) {
  const rec = getDayRecord(getDayKey(currentDate));
  const ex = rec.workout.exercises[exIdx];
  if (ex && ex.sets[sIdx]) {
    ex.sets[sIdx].done = !ex.sets[sIdx].done;
    if (ex.sets[sIdx].done) {
      const restSecs = getCalculatedRestSeconds(exerciseId);
      startRestCountdown(restSecs);
    }
    renderLiveWorkoutContent();
  }
}

function removeLiveExercise(exIdx) {
  const rec = getDayRecord(getDayKey(currentDate));
  rec.workout.exercises.splice(exIdx, 1);
  renderLiveWorkoutContent();
}

function loadLivePreset(presetKey) {
  loadPplPreset(presetKey);
  renderLiveWorkoutContent();
}

// ==========================================
// WORKOUT FINISH & AI COACH CONSULTATION
// ==========================================
function finishLiveWorkoutSession() {
  const rec = getDayRecord(getDayKey(currentDate));
  rec.workout.completed = true;

  const todayKey = getDayKey(currentDate);
  rec.workout.exercises.forEach(ex => {
    const validSets = ex.sets.filter(s => s.done && s.weight > 0);
    if (validSets.length > 0) {
      if (!workoutHistory[ex.id]) workoutHistory[ex.id] = [];
      workoutHistory[ex.id].push({
        date: todayKey,
        sets: validSets.map(s => ({ weight: s.weight, reps: s.reps, done: true })),
        volume: validSets.reduce((sum, s) => sum + (s.weight * s.reps), 0)
      });
    }
  });

  persist();
  showWorkoutSummaryScreen(rec);
}

function showWorkoutSummaryScreen(rec) {
  const overlay = document.getElementById('fullScreenWorkoutOverlay');
  if (!overlay) return;

  const muscleScores = calculateMuscleVolumes(rec);
  let totalVolume = 0;
  let totalSets = 0;

  rec.workout.exercises.forEach(ex => {
    const valid = ex.sets.filter(s => s.done && s.weight > 0);
    totalVolume += valid.reduce((acc, s) => acc + (s.weight * s.reps), 0);
    totalSets += valid.length;
  });

  const hrs = Math.floor((rec.workout.durationSeconds || 0) / 3600);
  const mins = Math.floor(((rec.workout.durationSeconds || 0) % 3600) / 60);

  overlay.innerHTML = `
    <div class="max-w-md mx-auto p-5 flex flex-col justify-between h-full overflow-y-auto custom-scroll text-center">
      <div class="space-y-4 pt-4">
        <div class="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto text-2xl shadow-xl shadow-emerald-500/20">
          🔥
        </div>
        <div>
          <h1 class="text-lg font-black text-white tracking-tight uppercase">Workout Completed!</h1>
          <p class="text-xs text-slate-400 mt-0.5">Session recorded into Protocol OS.</p>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <div class="text-[9px] font-bold text-slate-500 uppercase">Volume</div>
            <div class="text-xs font-black text-white mt-0.5">${totalVolume.toLocaleString()} lbs</div>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <div class="text-[9px] font-bold text-slate-500 uppercase">Duration</div>
            <div class="text-xs font-black text-orange-400 mt-0.5">${hrs > 0 ? hrs + 'h ' : ''}${mins}m</div>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <div class="text-[9px] font-bold text-slate-500 uppercase">Sets Done</div>
            <div class="text-xs font-black text-cyan-400 mt-0.5">${totalSets}</div>
          </div>
        </div>

        <!-- Session Muscle Heatmap -->
        ${renderMuscleHeatmapSvg(muscleScores)}

        <!-- AI COACH POST-WORKOUT CONSULTATION -->
        <div class="bg-gradient-to-br from-purple-950/40 via-slate-950 to-indigo-950/40 border border-purple-500/30 rounded-2xl p-4 text-left space-y-3">
          <div class="flex items-center gap-2">
            <i data-lucide="bot" class="w-4 h-4 text-purple-400"></i>
            <div>
              <h3 class="text-xs font-black text-white">AI Coach Post-Workout Consultation</h3>
              <p class="text-[9px] text-slate-400">Review fatigue, pumps & automatically adapt next week's preset</p>
            </div>
          </div>

          <div>
            <label class="block text-[10px] text-slate-300 font-bold mb-1">How did today feel? (Joints, energy, pumps, sticking points):</label>
            <textarea id="aiCoachFeedbackInput" rows="2" placeholder="e.g. Incline DB felt incredible, but right shoulder felt impinged on flat bench. Triceps were completely cooked early..." class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 placeholder-slate-600 resize-none"></textarea>
          </div>

          <button onclick="requestAiCoachConsultation()" id="btnConsultCoach" class="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            <span>Generate Analysis & Preset Recommendation</span>
          </button>

          <!-- Response Mount -->
          <div id="aiCoachOutputContainer" class="hidden space-y-2 pt-2 border-t border-purple-500/20"></div>
        </div>
      </div>

      <div class="py-5">
        <button onclick="closeLiveWorkoutSession()" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition">
          Done & Return to Protocol OS
        </button>
      </div>
    </div>
  `;

  lucide.createIcons();
}

// AI COACH GEMINI 3.8-FLASH CONSULTATION
async function requestAiCoachConsultation() {
  const btn = document.getElementById('btnConsultCoach');
  const out = document.getElementById('aiCoachOutputContainer');
  const userFeedback = document.getElementById('aiCoachFeedbackInput')?.value || "Felt normal.";
  const rec = getDayRecord(getDayKey(currentDate));

  btn.innerHTML = `<span class="animate-pulse">Analyzing Biomechanics & Adaptation...</span>`;
  btn.disabled = true;

  const keys = userGoals.apiKeys || [];
  if (keys.length === 0) {
    alert("Please add your Gemini API Key in Settings.");
    btn.innerHTML = "Generate Analysis";
    btn.disabled = false;
    return;
  }

  const prompt = `You are an elite hypertrophy biomechanics coach and sports scientist analyzing an athlete's workout session.
User Feedback: "${userFeedback}"
Current Workout Routine Title: "${rec.workout.title}"
Lifts Completed Today:
${JSON.stringify(rec.workout.exercises.map(e => ({
  name: e.name,
  id: e.id,
  sets: e.sets.filter(s => s.done)
})))}

TASK:
1. Provide a direct, punchy 3-sentence critique on the volume, stimulus, and user's joint/fatigue feedback.
2. Recommend 1-2 intelligent routine adjustments (e.g. swapping an exercise to preserve joint health, altering rep ranges, or progressive overload).
3. Provide an updated recommended exercise list for this specific split preset using valid exercise IDs from this available set:
${JSON.stringify(EXERCISE_DATABASE.map(e => ({ id: e.id, name: e.name, category: e.category })))}

OUTPUT strictly valid JSON without markdown or code fences:
{
  "coach_critique": "string",
  "suggested_preset_changes": "string",
  "updated_preset_exercises": ["exercise_id_1", "exercise_id_2", "..."]
}`;

  const apiKey = keys[userGoals.activeKeyIndex % keys.length];

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const parsed = JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim());

    out.innerHTML = `
      <div class="bg-slate-900 border border-purple-500/30 p-3 rounded-xl space-y-2 text-xs">
        <div>
          <span class="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Coach Breakdown:</span>
          <p class="text-[11px] text-slate-200 mt-0.5 leading-relaxed">${parsed.coach_critique}</p>
        </div>
        <div class="pt-1 border-t border-slate-800">
          <span class="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Recommended Preset Adaptation:</span>
          <p class="text-[11px] text-amber-200 mt-0.5 leading-relaxed">${parsed.suggested_preset_changes}</p>
        </div>
        <button onclick="applyAiPresetChanges(${JSON.stringify(parsed.updated_preset_exercises).replace(/"/g, '&quot;')})" class="w-full mt-2 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded-lg shadow-md transition">
          ✓ Apply AI Adjustments to Preset
        </button>
      </div>
    `;
    out.classList.remove('hidden');
  } catch (err) {
    alert("AI Coach Error: " + err.message);
  } finally {
    btn.innerHTML = "Generate Analysis";
    btn.disabled = false;
  }
}

function applyAiPresetChanges(updatedIds) {
  if (!updatedIds || !Array.isArray(updatedIds)) return;
  const rec = getDayRecord(getDayKey(currentDate));

  if (!customPresets) {
    customPresets = JSON.parse(JSON.stringify(DEFAULT_PRESETS));
  }

  // Find matching preset key from title
  const presetKey = Object.keys(customPresets).find(k => customPresets[k].title === rec.workout.title) || 'push1';
  customPresets[presetKey].exercises = updatedIds;
  localStorage.setItem('protocol_os_presets', JSON.stringify(customPresets));

  alert(`Preset '${customPresets[presetKey].title}' updated with AI adaptations for your next rotation!`);
}

// ==========================================
// INFO MODAL & LIBRARY PICKER
// ==========================================
function showExerciseInfoModal(exerciseId) {
  const ex = EXERCISE_DATABASE.find(e => e.id === exerciseId);
  if (!ex) return;
  const modal = document.getElementById('exerciseInfoModal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-3.5 shadow-2xl">
      <div class="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 class="text-sm font-black text-white">${ex.name}</h3>
          <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-orange-400 font-bold uppercase">${ex.category} • ${ex.equipment}</span>
        </div>
        <button onclick="closeExerciseInfoModal()" class="text-slate-400 hover:text-white text-base">✕</button>
      </div>

      <div class="space-y-2.5 text-xs text-slate-300">
        <div>
          <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Muscles Hit:</h4>
          <p class="text-[11px] text-cyan-300 font-semibold mt-0.5">${ex.target}</p>
        </div>
        <div>
          <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Optimal Biomechanical Form:</h4>
          <p class="text-[11px] text-slate-300 leading-relaxed mt-0.5">${ex.form}</p>
        </div>
        <div>
          <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coach Pro Cues:</h4>
          <p class="text-[11px] text-amber-300 leading-relaxed mt-0.5">${ex.tips}</p>
        </div>
      </div>

      <button onclick="closeExerciseInfoModal()" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition">
        Got it
      </button>
    </div>
  `;
  modal.classList.remove('hidden');
}

function closeExerciseInfoModal() {
  const modal = document.getElementById('exerciseInfoModal');
  if (modal) modal.classList.add('hidden');
}

function openExerciseModal() {
  document.getElementById('exerciseModal').classList.remove('hidden');
  filterExerciseLibrary('');
}

function closeExerciseModal() {
  document.getElementById('exerciseModal').classList.add('hidden');
}

function setExerciseCategory(cat) {
  currentCategoryFilter = cat;
  filterExerciseLibrary(document.getElementById('exerciseSearchInput').value);
}

function filterExerciseLibrary(query) {
  const container = document.getElementById('exerciseLibraryList');
  if (!container) return;
  container.innerHTML = '';
  const q = query.toLowerCase().trim();

  EXERCISE_DATABASE.filter(ex => 
    (currentCategoryFilter === 'all' || ex.category === currentCategoryFilter) &&
    (ex.name.toLowerCase().includes(q) || ex.category.toLowerCase().includes(q) || ex.target.toLowerCase().includes(q))
  ).forEach(ex => {
    const btn = document.createElement('div');
    btn.className = "w-full text-left p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/50 flex items-center justify-between transition";
    btn.innerHTML = `
      <div class="pr-2 flex-1">
        <div class="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
          <span>${ex.name}</span>
          <button onclick="showExerciseInfoModal('${ex.id}')" class="text-slate-500 hover:text-cyan-400 p-0.5"><i data-lucide="info" class="w-3 h-3"></i></button>
        </div>
        <div class="text-[9px] text-slate-500">${ex.equipment}</div>
      </div>
      <button onclick="selectExerciseForWorkout('${ex.id}')" class="text-orange-400 hover:text-orange-300 text-xs font-black px-2 py-1 rounded bg-orange-950/40 border border-orange-500/30 shrink-0">
        + Add
      </button>
    `;
    container.appendChild(btn);
  });
  lucide.createIcons();
}

function selectExerciseForWorkout(exId) {
  const rec = getDayRecord(getDayKey(currentDate));
  const meta = EXERCISE_DATABASE.find(e => e.id === exId);

  rec.workout.exercises.push({
    id: exId,
    name: meta?.name || exId,
    category: meta?.category || "Other",
    sets: [
      { weight: 0, reps: 0, done: false },
      { weight: 0, reps: 0, done: false },
      { weight: 0, reps: 0, done: false }
    ]
  });

  persist();
  closeExerciseModal();
  const overlay = document.getElementById('fullScreenWorkoutOverlay');
  if (overlay && !overlay.classList.contains('hidden')) {
    renderLiveWorkoutContent();
  }
}

function loadPplPreset(presetKey) {
  if (isDateInFuture(currentDate) || isDateBeforeStart(currentDate)) return;
  const rec = getDayRecord(getDayKey(currentDate));
  const presets = getActivePresets();
  const preset = presets[presetKey];
  if (!preset) return;

  rec.workout.title = preset.title;
  rec.workout.exercises = preset.exercises.map(exId => {
    const meta = EXERCISE_DATABASE.find(e => e.id === exId) || { name: exId, category: "Other" };
    return {
      id: exId,
      name: meta.name,
      category: meta.category,
      sets: [
        { weight: 0, reps: 0, done: false },
        { weight: 0, reps: 0, done: false },
        { weight: 0, reps: 0, done: false }
      ]
    };
  });
  persist();
}

// ==========================================
// REGULAR ATHLETICS TAB VIEW
// ==========================================
function renderAthleticsTab(rec) {
  const container = document.getElementById('view_athletics');
  if (!container) return;

  const dOw = currentDate.getDay();
  const sN = { 1: "Mon: Push A", 2: "Tue: Pull A", 3: "Wed: Legs", 4: "Thu: Push B", 5: "Fri: Pull B" };
  const muscleScores = calculateMuscleVolumes(rec);

  container.innerHTML = `
    <!-- WEIGHT GRAPH -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400"><i data-lucide="trending-up" class="w-3.5 h-3.5"></i></div>
          <div><h2 class="text-sm font-bold text-white">Bodyweight Analytics</h2><div class="text-[10px] text-slate-400">Fasted trend curve</div></div>
        </div>
        <div id="weightSummaryBadge" class="text-xs font-extrabold text-violet-300">-- lbs</div>
      </div>
      <div class="w-full h-28 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2 relative flex items-center justify-center">
        <svg id="weightSvgChart" class="w-full h-full overflow-visible"></svg>
        <div id="noWeightMsg" class="absolute text-[10px] text-slate-600 font-semibold">Log weigh-ins to plot curve</div>
      </div>
    </div>

    <!-- ATHLETICS & CLIMBING -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400"><i data-lucide="activity" class="w-3.5 h-3.5"></i></div>
        <div><h2 class="text-sm font-bold text-white">Rehab & Athletics Compliance</h2><div class="text-[10px] text-slate-400">Weekly non-daily volume targets</div></div>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-2 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-slate-200">Groin PT</span>
            <span class="text-[8px] font-extrabold px-1 rounded bg-slate-800 text-slate-400">${getWeeklyStat('pt', currentDate)}/3</span>
          </div>
          <button onclick="togglePtToday()" class="w-full py-1 rounded text-[9px] font-bold border transition ${rec.pt ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-300 border-slate-700'}">${rec.pt ? 'Done ✓' : 'Log PT'}</button>
        </div>
        <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-2 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-slate-200">Prehab</span>
            <span class="text-[8px] font-extrabold px-1 rounded bg-slate-800 text-slate-400">${getWeeklyStat('prehab', currentDate)}/4</span>
          </div>
          <button onclick="togglePrehabToday()" class="w-full py-1 rounded text-[9px] font-bold border transition ${rec.prehab ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-300 border-slate-700'}">${rec.prehab ? 'Done ✓' : 'Log Prehab'}</button>
        </div>
        <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-2 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-slate-200">Climb</span>
            <span class="text-[8px] font-extrabold px-1 rounded bg-slate-800 text-slate-400">+350 kcal</span>
          </div>
          <button onclick="toggleClimbToday()" class="w-full py-1 rounded text-[9px] font-bold border transition ${rec.climbing ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-800 text-slate-300 border-slate-700'}">${rec.climbing ? 'Logged ✓' : 'Log Climb'}</button>
        </div>
      </div>
    </div>

    <!-- ANATOMICAL HEATMAP -->
    ${renderMuscleHeatmapSvg(muscleScores)}

    <!-- LIFTOFF WORKOUT OVERVIEW & LAUNCHER -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400"><i data-lucide="flame" class="w-3.5 h-3.5"></i></div>
          <div><h2 class="text-sm font-bold text-white">LIFTOFF UCSB Engine</h2><div class="text-[10px] text-slate-400">80+ MAC lifts, adaptive rest & AI adaptations</div></div>
        </div>
        <span class="text-[9px] font-bold px-2 py-0.5 rounded-full ${rec.workout.completed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}">
          ${rec.workout.completed ? 'Completed Today ✓' : 'Session Ready'}
        </span>
      </div>

      <!-- Launch Immersive Mode Button -->
      <button onclick="launchLiveWorkoutSession()" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition active:scale-95">
        <i data-lucide="play" class="w-4 h-4 fill-white"></i>
        <span>${rec.workout.startTime && !rec.workout.completed ? 'Resume Live Workout' : 'Start Full-Screen Session'}</span>
      </button>

      <div class="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl space-y-2">
        <div class="flex items-center justify-between text-[10px] font-bold text-slate-300">
          <span>Weekly Split Target:</span>
          <span class="text-orange-400 font-mono">${sN[dOw] ? 'Recommended: ' + sN[dOw] : 'Weekend Recovery'}</span>
        </div>
        <div class="grid grid-cols-5 gap-1 text-center">
          <button onclick="loadPplPreset('push1')" class="py-1.5 rounded-lg text-[9px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">Push A</button>
          <button onclick="loadPplPreset('pull1')" class="py-1.5 rounded-lg text-[9px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">Pull A</button>
          <button onclick="loadPplPreset('legs')" class="py-1.5 rounded-lg text-[9px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">Legs</button>
          <button onclick="loadPplPreset('push2')" class="py-1.5 rounded-lg text-[9px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">Push B</button>
          <button onclick="loadPplPreset('pull2')" class="py-1.5 rounded-lg text-[9px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">Pull B</button>
        </div>
      </div>
    </div>
  `;

  renderWeightChart();
}

function renderWeightChart() {
  const svg = document.getElementById('weightSvgChart');
  const msg = document.getElementById('noWeightMsg');
  if (!svg || !msg) return;
  svg.innerHTML = '';
  const d = Object.keys(appData).filter(k => appData[k].weight !== null && appData[k].weight !== undefined).sort();
  if (d.length === 0) {
    msg.classList.remove('hidden');
    document.getElementById('weightSummaryBadge').innerText = "-- lbs";
    return;
  }
  msg.classList.add('hidden');
  const p = d.map(k => ({ w: appData[k].weight }));
  document.getElementById('weightSummaryBadge').innerText = `${p[p.length - 1].w} lbs`;
  if (p.length === 1) {
    svg.innerHTML = `<circle cx="50%" cy="50%" r="4" fill="#a78bfa" />`;
    return;
  }
  const ws = p.map(x => x.w);
  const minW = Math.min(...ws) - 1;
  const maxW = Math.max(...ws) + 1;
  const range = (maxW - minW) || 1;
  let dPath = "";
  p.forEach((pt, i) => {
    const x = (i / (p.length - 1)) * 360 + 10;
    const y = 100 - ((pt.w - minW) / range) * 100 + 5;
    dPath += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", x);
    c.setAttribute("cy", y);
    c.setAttribute("r", "2.5");
    c.setAttribute("fill", "#a78bfa");
    svg.appendChild(c);
  });
  const pE = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pE.setAttribute("d", dPath);
  pE.setAttribute("fill", "none");
  pE.setAttribute("stroke", "#8b5cf6");
  pE.setAttribute("stroke-width", "2");
  svg.prepend(pE);
}

function togglePtToday() {
  if (isDateInFuture(currentDate) || isDateBeforeStart(currentDate)) return;
  const rec = getDayRecord(getDayKey(currentDate));
  rec.pt = !rec.pt;
  persist();
}

function togglePrehabToday() {
  if (isDateInFuture(currentDate) || isDateBeforeStart(currentDate)) return;
  const rec = getDayRecord(getDayKey(currentDate));
  rec.prehab = !rec.prehab;
  persist();
}

function toggleClimbToday() {
  if (isDateInFuture(currentDate) || isDateBeforeStart(currentDate)) return;
  const rec = getDayRecord(getDayKey(currentDate));
  rec.climbing = !rec.climbing;
  persist();
}
