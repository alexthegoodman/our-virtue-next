"use client";

import Lottie from "lottie-react";
import styles from "./OurChurchCTA.module.css";

import bibleAnimation from "./Bible.json";

// const crossAnimation = {
//   "v": "5.7.4",
//   "fr": 30,
//   "ip": 0,
//   "op": 120,
//   "w": 120,
//   "h": 120,
//   "nm": "Cross",
//   "ddd": 0,
//   "assets": [],
//   "layers": [
//     {
//       "ddd": 0,
//       "ind": 1,
//       "ty": 4,
//       "nm": "Cross",
//       "sr": 1,
//       "ks": {
//         "o": {"a": 1, "k": [
//           {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 0, "s": [0]},
//           {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 30, "s": [100]},
//           {"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 90, "s": [100]},
//           {"t": 120, "s": [70]}
//         ]},
//         "r": {"a": 0, "k": 0},
//         "p": {"a": 0, "k": [60, 60, 0]},
//         "a": {"a": 0, "k": [0, 0, 0]},
//         "s": {"a": 1, "k": [
//           {"i": {"x": [0.833, 0.833, 0.833], "y": [0.833, 0.833, 0.833]}, "o": {"x": [0.167, 0.167, 0.167], "y": [0.167, 0.167, 0.167]}, "t": 0, "s": [0, 0, 100]},
//           {"i": {"x": [0.833, 0.833, 0.833], "y": [0.833, 0.833, 0.833]}, "o": {"x": [0.167, 0.167, 0.167], "y": [0.167, 0.167, 0.167]}, "t": 30, "s": [100, 100, 100]},
//           {"i": {"x": [0.833, 0.833, 0.833], "y": [0.833, 0.833, 0.833]}, "o": {"x": [0.167, 0.167, 0.167], "y": [0.167, 0.167, 0.167]}, "t": 60, "s": [105, 105, 100]},
//           {"t": 90, "s": [100, 100, 100]}
//         ]}
//       },
//       "ao": 0,
//       "shapes": [
//         {
//           "ty": "gr",
//           "it": [
//             {
//               "ty": "rc",
//               "d": 1,
//               "s": {"a": 0, "k": [8, 50]},
//               "p": {"a": 0, "k": [0, 0]},
//               "r": {"a": 0, "k": 4}
//             },
//             {
//               "ty": "fl",
//               "c": {"a": 0, "k": [0.85, 0.65, 0.13, 1]},
//               "o": {"a": 0, "k": 100}
//             },
//             {
//               "ty": "st",
//               "c": {"a": 0, "k": [1, 1, 1, 1]},
//               "o": {"a": 0, "k": 80},
//               "w": {"a": 0, "k": 1},
//               "lc": 2,
//               "lj": 2
//             }
//           ]
//         },
//         {
//           "ty": "gr",
//           "it": [
//             {
//               "ty": "rc",
//               "d": 1,
//               "s": {"a": 0, "k": [35, 8]},
//               "p": {"a": 0, "k": [0, -8]},
//               "r": {"a": 0, "k": 4}
//             },
//             {
//               "ty": "fl",
//               "c": {"a": 0, "k": [0.85, 0.65, 0.13, 1]},
//               "o": {"a": 0, "k": 100}
//             },
//             {
//               "ty": "st",
//               "c": {"a": 0, "k": [1, 1, 1, 1]},
//               "o": {"a": 0, "k": 80},
//               "w": {"a": 0, "k": 1},
//               "lc": 2,
//               "lj": 2
//             }
//           ]
//         }
//       ],
//       "ip": 0,
//       "op": 120,
//       "st": 0,
//       "bm": 0
//     }
//   ]
// };

export default function OurChurchCTA() {
  return (
    <div className={styles.ctaContainer}>
      <div className={styles.animationWrapper}>
        <Lottie
          animationData={bibleAnimation}
          loop={true}
          className={styles.lottieAnimation}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>Try Our Church</h3>
        <p className={styles.description}>
          Connect with fellow believers in our digital community.
        </p>
        <button className={styles.ctaButton}>Enter Our Church</button>
      </div>
    </div>
  );
}
