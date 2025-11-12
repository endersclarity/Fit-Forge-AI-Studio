"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetailedMuscle = exports.Muscle = void 0;
var Muscle;
(function (Muscle) {
    Muscle["Pectoralis"] = "Pectoralis";
    Muscle["Triceps"] = "Triceps";
    Muscle["Deltoids"] = "Deltoids";
    Muscle["Lats"] = "Lats";
    Muscle["Biceps"] = "Biceps";
    Muscle["Rhomboids"] = "Rhomboids";
    Muscle["Trapezius"] = "Trapezius";
    Muscle["Forearms"] = "Forearms";
    Muscle["Quadriceps"] = "Quadriceps";
    Muscle["Glutes"] = "Glutes";
    Muscle["Hamstrings"] = "Hamstrings";
    Muscle["Calves"] = "Calves";
    Muscle["Core"] = "Core";
})(Muscle || (exports.Muscle = Muscle = {}));
/**
 * Detailed muscle tracking enum - 42 specific muscles for granular recuperation tracking
 * Maps to 13 visualization muscles (Muscle enum) via DETAILED_TO_VIZ_MAP
 * Enables precise fatigue tracking of stabilizers, rotator cuff, and muscle subdivisions
 */
var DetailedMuscle;
(function (DetailedMuscle) {
    // CHEST (2 divisions)
    DetailedMuscle["PectoralisMajorClavicular"] = "Pectoralis Major (Clavicular)";
    DetailedMuscle["PectoralisMajorSternal"] = "Pectoralis Major (Sternal)";
    // SHOULDERS (3 divisions)
    DetailedMuscle["AnteriorDeltoid"] = "Anterior Deltoid";
    DetailedMuscle["MedialDeltoid"] = "Medial Deltoid";
    DetailedMuscle["PosteriorDeltoid"] = "Posterior Deltoid";
    // ROTATOR CUFF (4 muscles)
    DetailedMuscle["Infraspinatus"] = "Infraspinatus";
    DetailedMuscle["Supraspinatus"] = "Supraspinatus";
    DetailedMuscle["TeresMinor"] = "Teres Minor";
    DetailedMuscle["Subscapularis"] = "Subscapularis";
    // SCAPULAR STABILIZERS (3 muscles)
    DetailedMuscle["SerratusAnterior"] = "Serratus Anterior";
    DetailedMuscle["RhomboidsDetailed"] = "Rhomboids";
    DetailedMuscle["LevatorScapulae"] = "Levator Scapulae";
    // BACK (5 divisions)
    DetailedMuscle["LatissimusDorsi"] = "Latissimus Dorsi";
    DetailedMuscle["UpperTrapezius"] = "Upper Trapezius";
    DetailedMuscle["MiddleTrapezius"] = "Middle Trapezius";
    DetailedMuscle["LowerTrapezius"] = "Lower Trapezius";
    DetailedMuscle["ErectorSpinae"] = "Erector Spinae";
    // ARMS (8 muscles - biceps, triceps heads, forearms)
    DetailedMuscle["BicepsBrachii"] = "Biceps Brachii";
    DetailedMuscle["Brachialis"] = "Brachialis";
    DetailedMuscle["Brachioradialis"] = "Brachioradialis";
    DetailedMuscle["TricepsLongHead"] = "Triceps (Long Head)";
    DetailedMuscle["TricepsLateralHead"] = "Triceps (Lateral Head)";
    DetailedMuscle["TricepsMedialHead"] = "Triceps (Medial Head)";
    DetailedMuscle["WristFlexors"] = "Wrist Flexors";
    DetailedMuscle["WristExtensors"] = "Wrist Extensors";
    // CORE (5 divisions)
    DetailedMuscle["RectusAbdominis"] = "Rectus Abdominis";
    DetailedMuscle["ExternalObliques"] = "External Obliques";
    DetailedMuscle["InternalObliques"] = "Internal Obliques";
    DetailedMuscle["TransverseAbdominis"] = "Transverse Abdominis";
    DetailedMuscle["Iliopsoas"] = "Iliopsoas";
    // LEGS - QUADRICEPS (4 heads)
    DetailedMuscle["VastusLateralis"] = "Vastus Lateralis";
    DetailedMuscle["VastusMedialis"] = "Vastus Medialis";
    DetailedMuscle["VastusIntermedius"] = "Vastus Intermedius";
    DetailedMuscle["RectusFemoris"] = "Rectus Femoris";
    // LEGS - GLUTES (3 divisions)
    DetailedMuscle["GluteusMaximus"] = "Gluteus Maximus";
    DetailedMuscle["GluteusMedius"] = "Gluteus Medius";
    DetailedMuscle["GluteusMinimus"] = "Gluteus Minimus";
    // LEGS - HAMSTRINGS (3 muscles)
    DetailedMuscle["BicepsFemoris"] = "Biceps Femoris";
    DetailedMuscle["Semitendinosus"] = "Semitendinosus";
    DetailedMuscle["Semimembranosus"] = "Semimembranosus";
    // LEGS - CALVES (3 divisions)
    DetailedMuscle["GastrocnemiusMedial"] = "Gastrocnemius (Medial)";
    DetailedMuscle["GastrocnemiusLateral"] = "Gastrocnemius (Lateral)";
    DetailedMuscle["Soleus"] = "Soleus";
})(DetailedMuscle || (exports.DetailedMuscle = DetailedMuscle = {}));
