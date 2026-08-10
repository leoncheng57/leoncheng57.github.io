import { EXERCISES } from './exercises'

export interface ExerciseVideo {
  /** Direct link to a reviewed YouTube Short, or a Shorts search when none qualified. */
  url: string
  title: string
  channel: string
  type: 'short' | 'search'
  /** Date the link was last confirmed reachable via YouTube oEmbed. */
  verifiedOn: string
}

function short(videoId: string, title: string, channel: string): ExerciseVideo {
  return {
    url: `https://www.youtube.com/shorts/${videoId}`,
    title,
    channel,
    type: 'short',
    verifiedOn: '2026-08-09',
  }
}

/**
 * Fallback used for exercises without a reviewed Short and as a safety net
 * for any future exercise added to the library.
 */
export function shortsSearchVideo(exerciseName: string): ExerciseVideo {
  const query = encodeURIComponent(`how to ${exerciseName} #shorts`)
  return {
    url: `https://www.youtube.com/results?search_query=${query}`,
    title: `Search Shorts: ${exerciseName}`,
    channel: 'YouTube search',
    type: 'search',
    verifiedOn: '2026-08-09',
  }
}

export const EXERCISE_VIDEOS: Record<string, ExerciseVideo> = {
  'arm-circles': short('lzR7tzI1JUI', 'Arm Circles', 'Derek Ward'),
  'band-chest-press': short('T0UJ0W-_yIE', 'Resistance Band Standing Chest Press', 'LGN Lyfestile'),
  'band-dead-bug': short('iW_CtYtzbeU', 'Dead-bug (Band-resisted)', 'Movement Physio'),
  'band-face-pull': short('FTA-s2df6M4', 'Face Pull with Band', 'Girls Gone Strong | Women\'s Health & Fitness'),
  'band-good-morning': short('4ZE0jZBd2N8', 'Banded Good Morning', 'Warlock CrossFit'),
  'band-kneeling-crunch': short('WRaddjtuhrA', 'Banded kneeling crunch - at home variation for cable crunch (core exercise)', 'Dr. Matt Wiest'),
  'band-lat-pulldown': short('nmY4MTSFln8', 'Lat Pulldown with Resistance Band', 'Digg Deep Fitness & Nutrition'),
  'band-lateral-walk': short('N28Hpdezg7Q', 'Banded Lateral Walks', 'Tom Pfeiffer Fitness'),
  'band-overhead-press': short('1-VfJqjYquQ', 'Resistance Band Overhead Press', 'LGN Lyfestile'),
  'band-pallof-press': short('JEjKGg7dVVA', 'Pallof Press - resistance band', 'Coach Miranda '),
  'band-pull-apart': short('SuvO4TBwSu4', 'Band Pull-apart', 'Movement Physio'),
  'band-pull-through': short('rgYXsVfmqAE', 'Band Pull-Through', 'Girls Gone Strong | Women\'s Health & Fitness'),
  'band-row': short('hqFwwv6dFGY', 'Band Row Explained #bandexercises #bandworkout #backexercises #backworkout', 'Claire DeFitt'),
  'band-squat': short('S5cTdwO1Trk', 'Resistance Band Squat', 'LGN Lyfestile'),
  'band-tricep-pressdown': short('PkGesjlH7RQ', 'Resistance Band Exercises - Triceps Pushdown', 'Shape Bands'),
  'bicycle-crunch': short('hP-ol0LxLZ8', 'How To Do A Bicycle Crunch #shorts', 'Heather Robertson'),
  'bird-dog': short('BAqsW014YAI', 'Bird Dog', 'Girls Gone Strong | Women\'s Health & Fitness'),
  'bodyweight-good-morning': short('Nyz0imyBu2Q', 'Bodyweight Good Morning', 'All Level CrossFit'),
  'bodyweight-squat': short('3fl7uYmiMVw', 'Bodyweight Squat', 'Girls Gone Strong | Women\'s Health & Fitness'),
  'box-breathing': short('g6l63eQRbOg', 'How to do box breathing.', 'Cleveland Clinic'),
  'bulgarian-split-squat': short('9p5e2BSvoLs', 'Bulgarian Split Squat Step by Step Guide', 'Bodybuilding.com'),
  'burpee': short('zlYA1SENYG4', 'How to do a Proper Burpee #shorts', 'WeShape'),
  'cat-cow': short('lgFQUsbpF6I', 'Cat-Cow Stretch To Start Your Day #shorts', 'Mind Pump TV'),
  'chair-dip': short('EujYj2rtmEI', 'Exercise Demo: Chair Dips (Triceps)', 'Health Warriors'),
  'chest-opener-stretch': short('Cka38QWoVeY', 'CHEST OPENER STRETCH', 'Intense Physio '),
  'childs-pose': short('2ORwigpB-lQ', 'Child\'s pose benefits.', 'Cleveland Clinic'),
  'cross-body-shoulder-stretch': short('FF_D0ysodVo', 'Cross Body Shoulder Stretch', 'JET Fitness'),
  'db-bent-over-row': short('vN8xskk-7G8', 'How To Do Bent Over Rows (With Dumbbells) #shorts', 'Heather Robertson'),
  'db-bicep-curl': short('iui51E31sX8', 'How To Properly Perform Dumbbell Bicep Curls With Good Form *Palms Up* (Exercise Demonstration)', 'Gerardi Performance'),
  'db-farmers-carry': short('Ozp9nI_w4xo', 'Dumbbell Farmers Carry', 'FarmFedYinzer'),
  'db-floor-press': short('UBmpZ7l5Nlk', 'Dumbbell Floor Press', 'Kraken Fitness'),
  'db-front-squat': short('RC5XZ3Bto0k', 'Dumbbell Front Squat Demo- CrossFit 190', 'CrossFit 190'),
  'db-rear-delt-fly': short('LsT-bR_zxLo', 'The PERFECT Dumbbell Rear Delt Fly (DO THIS!)', 'Andrew Kwong (DeltaBolic)'),
  'db-reverse-lunge': short('i3TNJmnInI0', 'Dumbbell Reverse Lunge', 'Girls Gone Strong | Women\'s Health & Fitness'),
  'db-romanian-deadlift': short('RYV6Zq_8Z0w', 'Dumbbell Romanian Deadlift', 'Girls Gone Strong | Women\'s Health & Fitness'),
  'db-russian-twist': short('MKfv0WiTeEQ', 'How to Properly Perform Dumbbell Russian Twists With Good Form (Exercise Demonstration)', 'Gerardi Performance'),
  'db-shoulder-press': short('k6tzKisR3NY', 'The PERFECT Dumbbell Shoulder Press (DO THIS!)', 'Andrew Kwong (DeltaBolic)'),
  'db-single-leg-rdl': short('TTAd-t6NnFc', 'Single Leg Dumbbell Deadlift', 'Kraken Fitness'),
  'db-step-up': short('OxWZ-G-RdCM', 'Dumbbell Step-up', 'Girls Gone Strong | Women\'s Health & Fitness'),
  'db-suitcase-carry': short('yAE3CUTjkSk', 'One Dumbbell Carry (Suitcase Carry)', 'University of Denver Sports Performance'),
  'db-wood-chop': short('OgQU_bbdB7c', '💥 How to Do the Dumbbell Wood Chop (FIX Your Form) | Joey Thurman #shorts', 'Joey Thurman'),
  'dead-bug': short('DqLL45uk2Tk', 'Deadbugs', 'Derek Ward'),
  'decline-push-up': short('dcV-ATSeryA', 'STOP doing DECLINE PUSH-UPS like this!', 'Max Euceda'),
  'doorway-row': short('Ow4KlswOrhU', 'DOORWAY ROW', 'Captain Fitness, LLC'),
  'figure-four-stretch': short('nqwN1oDcCOI', 'Lying Figure Four Stretch', 'Hailey Happens Fitness'),
  'glute-bridge': short('X_IGw8U_e38', 'How to do Glute Bridges with Perfect Form #shorts', 'WeShape'),
  'glute-bridge-warmup': short('vWL3Q4eRiqw', 'Glute Bridge | Glute Activation #glutes #gluteworkout #coachkay #shorts', 'Coach Kay '),
  'goblet-squat': short('eLX_dyvooKQ', 'Dumbbell Goblet Squat', 'The Strength Center'),
  'half-kneeling-db-press': short('vpFJr1vMNQ4', 'Dumbbell Half Kneeling Single Arm Overhead Press', 'H&R Health & Performance'),
  'hamstring-stretch': short('9RczBuAMBxQ', 'Standing Hamstring Stretch', 'The UltraNurse'),
  'high-knees-march': short('Y-Mxv_LlmXI', 'High Knee March', 'Wellness by Workplace Options '),
  'high-knees-run': short('IdIlyOKozx4', 'How To Do High Knees #runningdrills #shorts', 'Chari Hawkins'),
  'hip-circles': short('9K9ISprFrIQ', 'Beginner’s Guide to Hip Circles | Loosen Tight Hips & Improve Mobility 🌀', 'Hit My Macros'),
  'hip-flexor-stretch': short('V01aVqxOhbU', 'Half-kneeling Hip Flexor Stretch', 'Girls Gone Strong | Women\'s Health & Fitness'),
  'hollow-hold': short('Xk-JcNj6lfY', 'How To: Hollow Body Hold', 'Forty Steps'),
  'inchworm': short('60hj90kYOYw', 'Inchworm (with progression)', 'Tone It Down'),
  'incline-push-up': short('NEdo_I3OuVk', 'How to do an incline push-up (press-up)', 'Luke Selway | Strength Coaching Online'),
  'jump-squat': short('IfqrxS_-8oU', 'Jump Squats', 'Girls Gone Strong | Women\'s Health & Fitness'),
  'jumping-jacks': short('yg3KQQn3QWg', 'Jumping Jacks', 'Girls Gone Strong | Women\'s Health & Fitness'),
  'kb-deadlift': short('mtWrHZo54cg', 'Beginner Kettlebell Exercise | The Kettlebell Deadlift', 'Dr. Carl Baird'),
  'kb-farmers-carry': short('JXdavikZTiY', 'KILOS Lifting Tutorial: Kettlebell Farmer Carry', 'KILOS Performance and Fitness'),
  'kb-floor-press': short('urU7zjAVwj4', 'How To Engage Your Chest During Floor Presses', 'Kettlebell Kings'),
  'kb-front-rack-squat': short('rp-PBpxJpmU', 'Kettlebell Front Rack Squat', 'Carl Hughes'),
  'kb-goblet-squat': short('dBnNCOtuGNQ', 'Kettlebell Goblet Squat | Kettlebell Exercise', 'Chandler Marchman'),
  'kb-gorilla-row': short('KStqnqHgrTQ', 'Discover The Power of Kettlebell Gorilla Rows 🦍 @Kd-fit', 'Onnit'),
  'kb-halo': short('Lr9IMLzgBYo', 'How to: Kettlebell Halo', 'Sami Leigh Fitness'),
  'kb-high-pull': short('V_CT1zFGjNs', 'Kettlebell High Pull: How To Do And Muscles Worked', 'Perfect Workout Pumps'),
  'kb-overhead-press': short('Wo1xE5Wp8DQ', 'The Correct Form for Kettlebell Overhead Press', 'Mark Wildman'),
  'kb-rack-carry': short('1dLIbeNcsOM', 'Kettlebell Front Rack Carry', 'Dr. Andrew Schneider DC, ATC'),
  'kb-reverse-lunge': short('wRHPCZU_-lo', 'Reverse Kettlebell Lunge Form | Kettlebell Exercises', 'Kettlebell Kings'),
  'kb-russian-twist': short('3GxeoPmtNww', 'Kettlebell Russian Twists', 'PERFORM Athlete'),
  'kb-single-arm-row': short('B0XNMCohjoo', 'Single Arm Kettlebell Row - Exercise Demo How-to', 'FitSW Fitness Software'),
  'kb-step-up': short('I-qdNU05nEk', 'Kettlebell step up', 'Flood City Performance'),
  'kb-swing': short('2gXtvqLa_T8', 'Correctly Perform Kettlebell Swings!', 'Squat University'),
  'kb-windmill': short('EZWHnzAjctU', 'Kettlebell Windmill Tutorial', 'Kettlebell Kings'),
  'lateral-lunge': short('MiT4XDp168I', 'How To Do Lateral Lunges / Side Lunges #shorts', 'Heather Robertson'),
  'leg-raise': short('PkLYH3uRtSs', 'How to Actually Train Abs on Lying Leg Raises', 'TylerPath'),
  'leg-swings': short('DTXpjDJDoeI', 'How to do leg swings #shorts', 'Chari Hawkins'),
  'mountain-climber': short('wrn1Cm_yfEU', 'How To Do Mountain Climbers #shorts', 'Heather Robertson'),
  'one-arm-db-row': short('qN54-QNO1eQ', 'How to Single Arm Dumbbell Row', 'TylerPath'),
  'pike-push-up': short('jz_Vr4JbUjc', 'Easiest way to learn Pike Push-ups #shorts', 'STRIQfit'),
  'plank': short('v25dawSzRTM', 'NEVER Do Planks Like This (3 Fixes You Must Make)', 'Jeremy Ethier'),
  'prone-y-raise': short('z0nTvguqbo0', 'Prone Y-Raise - shoulder end range strengthening exercise', 'Rehab Hero'),
  'push-up': short('HHRDXEG1YCU', 'PUSH UPS FOR BEGINNERS #shorts', 'MadFit'),
  'quad-stretch': short('aNXGOpP37CY', 'The CORRECT Way to do a Standing Quad Stretch // Great for Balance!', 'VIGEO'),
  'reverse-lunge': short('WwcM49jUqy0', 'How To Perform The Reverse Lunge #shorts', 'Mind Pump TV'),
  'reverse-snow-angel': short('R7jH-CNUb_c', 'Reverse Snow Angels', 'MOVE FAST LIFT HEAVY'),
  'shadow-boxing': short('bdb9EcwaKpU', '8 Pro Tips For YOUR Shadow Boxing 🥊', 'FTC Boxing'),
  'side-plank': short('fzLeV8X0Gb8', 'Side Plank', 'Onnit Academy'),
  'single-leg-glute-bridge': short('V1NKta2znwU', 'Single-leg Bodyweight Glute Bridge', 'Girls Gone Strong | Women\'s Health & Fitness'),
  'skater-hop': short('_C5YduL30Ho', 'Skater hops', 'SweatwithSarah '),
  'squat-pulse': short('f8PPWkHSqOk', 'Pulse Squat', 'Hlwatkinsfit'),
  'squat-thrust': short('zxMaM9_LxJ8', 'Squat thrust', 'Celebration CrossFit'),
  'standing-hip-hinge': short('JNds7lhBp6E', 'Bodyweight Standing Hip Hinge', 'Girls Gone Strong | Women\'s Health & Fitness'),
  'step-up': short('QP_Uh7vwcs4', 'Bodyweight Step-up', 'Girls Gone Strong | Women\'s Health & Fitness'),
  'superman-pull': short('sMwgXKuiJ-E', 'How to Perform a Superman Pull-Down | Tiger Fitness', 'Tiger Fitness'),
  'v-up': short('zDkDAET3GUA', 'V-Ups: How to do them and how not to do them', 'Brent Lee Hill'),
  'wall-push-up': short('YWw-3rGaoT0', 'Wall Push-Ups for Absolute Beginners | Easy Upper Body Workout at Home', 'Pilates On Demand with Lindsay'),
  'wall-sit': short('mDdLC-yKudY', 'How to do a wall sit', 'YOGABODY'),
  'weighted-sit-up': short('w3giolCm4fI', 'How To Do Weighted Sit Ups With Dumbbells (MUSCLES WORKED) | LiveLeanTV', 'Live Lean TV'),
  'worlds-greatest-stretch': short('0gUTxg_fNfc', 'The Worlds GREATEST Stretch', 'Squat University'),
}

export function getExerciseVideo(exerciseId: string): ExerciseVideo {
  const direct = EXERCISE_VIDEOS[exerciseId]
  if (direct) return direct
  const exercise = EXERCISES.find(({ id }) => id === exerciseId)
  return shortsSearchVideo(exercise?.name ?? 'exercise')
}
