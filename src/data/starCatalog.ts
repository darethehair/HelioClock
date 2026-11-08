/**
 * Expanded Celestial Star Catalog (down to magnitude 7.0)
 * Includes primary navigation anchors, major asterisms, clusters (Pleiades, Hyades,
 * Trapezium, Beehive, Coma, Double Cluster), and comprehensive background stars.
 */

export interface StarCatalogDef {
  id: string;
  name: string;
  ra: number;
  dec: number;
  mag: number;
  color: string;
  constellation?: string;
  isAnchor?: boolean;
}

export const EXPANDED_STAR_CATALOG: StarCatalogDef[] = [
  {
    "id": "sirius",
    "name": "Sirius",
    "ra": 101.287,
    "dec": -16.716,
    "mag": -1.46,
    "color": "#93c5fd",
    "constellation": "Canis Major",
    "isAnchor": true
  },
  {
    "id": "canopus",
    "name": "Canopus",
    "ra": 95.988,
    "dec": -52.696,
    "mag": -0.74,
    "color": "#ffffff",
    "constellation": "Carina",
    "isAnchor": true
  },
  {
    "id": "rigil-kent",
    "name": "Alpha Centauri",
    "ra": 219.902,
    "dec": -60.834,
    "mag": -0.27,
    "color": "#fef08a",
    "constellation": "Centaurus",
    "isAnchor": true
  },
  {
    "id": "arcturus",
    "name": "Arcturus",
    "ra": 213.915,
    "dec": 19.182,
    "mag": -0.05,
    "color": "#fed7aa",
    "constellation": "Boötes",
    "isAnchor": true
  },
  {
    "id": "vega",
    "name": "Vega",
    "ra": 279.234,
    "dec": 38.784,
    "mag": 0.03,
    "color": "#e0f2fe",
    "constellation": "Lyra",
    "isAnchor": true
  },
  {
    "id": "capella",
    "name": "Capella",
    "ra": 79.172,
    "dec": 45.998,
    "mag": 0.08,
    "color": "#fef08a",
    "constellation": "Auriga",
    "isAnchor": true
  },
  {
    "id": "rigel",
    "name": "Rigel",
    "ra": 78.634,
    "dec": -8.202,
    "mag": 0.13,
    "color": "#67e8f9",
    "constellation": "Orion",
    "isAnchor": true
  },
  {
    "id": "procyon",
    "name": "Procyon",
    "ra": 114.825,
    "dec": 5.225,
    "mag": 0.34,
    "color": "#f8fafc",
    "constellation": "Canis Minor",
    "isAnchor": true
  },
  {
    "id": "achernar",
    "name": "Achernar",
    "ra": 24.429,
    "dec": -57.237,
    "mag": 0.46,
    "color": "#93c5fd",
    "constellation": "Eridanus",
    "isAnchor": true
  },
  {
    "id": "betelgeuse",
    "name": "Betelgeuse",
    "ra": 88.793,
    "dec": 7.407,
    "mag": 0.5,
    "color": "#fb923c",
    "constellation": "Orion",
    "isAnchor": true
  },
  {
    "id": "hadar",
    "name": "Hadar",
    "ra": 210.956,
    "dec": -60.373,
    "mag": 0.61,
    "color": "#7dd3fc",
    "constellation": "Centaurus",
    "isAnchor": true
  },
  {
    "id": "altair",
    "name": "Altair",
    "ra": 297.696,
    "dec": 8.868,
    "mag": 0.77,
    "color": "#f1f5f9",
    "constellation": "Aquila",
    "isAnchor": true
  },
  {
    "id": "acrux",
    "name": "Acrux",
    "ra": 186.65,
    "dec": -63.099,
    "mag": 0.77,
    "color": "#93c5fd",
    "constellation": "Crux",
    "isAnchor": true
  },
  {
    "id": "aldebaran",
    "name": "Aldebaran",
    "ra": 68.98,
    "dec": 16.509,
    "mag": 0.85,
    "color": "#fb923c",
    "constellation": "Taurus",
    "isAnchor": true
  },
  {
    "id": "spica",
    "name": "Spica",
    "ra": 201.298,
    "dec": -11.161,
    "mag": 0.98,
    "color": "#7dd3fc",
    "constellation": "Virgo",
    "isAnchor": true
  },
  {
    "id": "antares",
    "name": "Antares",
    "ra": 247.352,
    "dec": -26.432,
    "mag": 1.06,
    "color": "#f87171",
    "constellation": "Scorpius",
    "isAnchor": true
  },
  {
    "id": "pollux",
    "name": "Pollux",
    "ra": 116.329,
    "dec": 28.026,
    "mag": 1.14,
    "color": "#fed7aa",
    "constellation": "Gemini",
    "isAnchor": true
  },
  {
    "id": "fomalhaut",
    "name": "Fomalhaut",
    "ra": 344.413,
    "dec": -29.622,
    "mag": 1.16,
    "color": "#f8fafc",
    "constellation": "Piscis Austrinus",
    "isAnchor": true
  },
  {
    "id": "deneb",
    "name": "Deneb",
    "ra": 310.358,
    "dec": 45.28,
    "mag": 1.25,
    "color": "#e0f2fe",
    "constellation": "Cygnus",
    "isAnchor": true
  },
  {
    "id": "mimosa",
    "name": "Mimosa",
    "ra": 191.93,
    "dec": -59.689,
    "mag": 1.25,
    "color": "#7dd3fc",
    "constellation": "Crux",
    "isAnchor": true
  },
  {
    "id": "regulus",
    "name": "Regulus",
    "ra": 152.093,
    "dec": 11.967,
    "mag": 1.36,
    "color": "#93c5fd",
    "constellation": "Leo",
    "isAnchor": true
  },
  {
    "id": "adhara",
    "name": "Adhara",
    "ra": 104.656,
    "dec": -28.972,
    "mag": 1.5,
    "color": "#93c5fd",
    "constellation": "Canis Major",
    "isAnchor": true
  },
  {
    "id": "castor",
    "name": "Castor",
    "ra": 113.65,
    "dec": 31.888,
    "mag": 1.58,
    "color": "#e2e8f0",
    "constellation": "Gemini",
    "isAnchor": true
  },
  {
    "id": "gacrux",
    "name": "Gacrux",
    "ra": 187.791,
    "dec": -57.113,
    "mag": 1.64,
    "color": "#fb923c",
    "constellation": "Crux",
    "isAnchor": true
  },
  {
    "id": "bellatrix",
    "name": "Bellatrix",
    "ra": 81.283,
    "dec": 6.35,
    "mag": 1.64,
    "color": "#93c5fd",
    "constellation": "Orion",
    "isAnchor": true
  },
  {
    "id": "shaula",
    "name": "Shaula",
    "ra": 263.402,
    "dec": -37.104,
    "mag": 1.62,
    "color": "#7dd3fc",
    "constellation": "Scorpius",
    "isAnchor": true
  },
  {
    "id": "elnath",
    "name": "Elnath",
    "ra": 81.573,
    "dec": 28.607,
    "mag": 1.65,
    "color": "#93c5fd",
    "constellation": "Taurus",
    "isAnchor": true
  },
  {
    "id": "miaplacidus",
    "name": "Miaplacidus",
    "ra": 138.3,
    "dec": -69.717,
    "mag": 1.67,
    "color": "#ffffff",
    "constellation": "Carina",
    "isAnchor": true
  },
  {
    "id": "alnilam",
    "name": "Alnilam",
    "ra": 84.053,
    "dec": -1.202,
    "mag": 1.69,
    "color": "#93c5fd",
    "constellation": "Orion",
    "isAnchor": true
  },
  {
    "id": "alnair",
    "name": "Al Na'ir",
    "ra": 332.058,
    "dec": -46.961,
    "mag": 1.74,
    "color": "#93c5fd",
    "constellation": "Grus",
    "isAnchor": true
  },
  {
    "id": "alioth",
    "name": "Alioth",
    "ra": 193.507,
    "dec": 55.96,
    "mag": 1.77,
    "color": "#f8fafc",
    "constellation": "Ursa Major",
    "isAnchor": true
  },
  {
    "id": "alnitak",
    "name": "Alnitak",
    "ra": 85.19,
    "dec": -1.943,
    "mag": 1.77,
    "color": "#93c5fd",
    "constellation": "Orion",
    "isAnchor": true
  },
  {
    "id": "dubhe",
    "name": "Dubhe",
    "ra": 165.932,
    "dec": 61.751,
    "mag": 1.79,
    "color": "#fde047",
    "constellation": "Ursa Major",
    "isAnchor": true
  },
  {
    "id": "mirfak",
    "name": "Mirfak",
    "ra": 51.081,
    "dec": 49.861,
    "mag": 1.79,
    "color": "#fef9c3",
    "constellation": "Perseus",
    "isAnchor": true
  },
  {
    "id": "wezen",
    "name": "Wezen",
    "ra": 107.098,
    "dec": -26.393,
    "mag": 1.83,
    "color": "#fef08a",
    "constellation": "Canis Major",
    "isAnchor": true
  },
  {
    "id": "sargas",
    "name": "Sargas",
    "ra": 264.33,
    "dec": -42.998,
    "mag": 1.86,
    "color": "#fed7aa",
    "constellation": "Scorpius",
    "isAnchor": true
  },
  {
    "id": "kaus-australis",
    "name": "Kaus Australis",
    "ra": 276.043,
    "dec": -34.384,
    "mag": 1.79,
    "color": "#93c5fd",
    "constellation": "Sagittarius",
    "isAnchor": true
  },
  {
    "id": "avior",
    "name": "Avior",
    "ra": 125.628,
    "dec": -59.509,
    "mag": 1.86,
    "color": "#fb923c",
    "constellation": "Carina",
    "isAnchor": true
  },
  {
    "id": "alkaid",
    "name": "Alkaid",
    "ra": 206.885,
    "dec": 49.313,
    "mag": 1.86,
    "color": "#93c5fd",
    "constellation": "Ursa Major",
    "isAnchor": true
  },
  {
    "id": "menkalinan",
    "name": "Menkalinan",
    "ra": 89.882,
    "dec": 44.947,
    "mag": 1.9,
    "color": "#f8fafc",
    "constellation": "Auriga",
    "isAnchor": true
  },
  {
    "id": "atria",
    "name": "Atria",
    "ra": 252.166,
    "dec": -69.028,
    "mag": 1.91,
    "color": "#fb923c",
    "constellation": "Triangulum Australe",
    "isAnchor": true
  },
  {
    "id": "alhena",
    "name": "Alhena",
    "ra": 99.428,
    "dec": 16.399,
    "mag": 1.93,
    "color": "#ffffff",
    "constellation": "Gemini",
    "isAnchor": true
  },
  {
    "id": "peacock",
    "name": "Peacock",
    "ra": 306.412,
    "dec": -56.735,
    "mag": 1.94,
    "color": "#7dd3fc",
    "constellation": "Pavo",
    "isAnchor": true
  },
  {
    "id": "polaris",
    "name": "Polaris",
    "ra": 37.955,
    "dec": 89.264,
    "mag": 1.98,
    "color": "#fef9c3",
    "constellation": "Ursa Minor",
    "isAnchor": true
  },
  {
    "id": "mirzam",
    "name": "Mirzam",
    "ra": 95.675,
    "dec": -17.956,
    "mag": 1.98,
    "color": "#93c5fd",
    "constellation": "Canis Major",
    "isAnchor": true
  },
  {
    "id": "alphard",
    "name": "Alphard",
    "ra": 141.897,
    "dec": -8.659,
    "mag": 1.99,
    "color": "#fb923c",
    "constellation": "Hydra",
    "isAnchor": true
  },
  {
    "id": "hamal",
    "name": "Hamal",
    "ra": 31.793,
    "dec": 23.462,
    "mag": 2.01,
    "color": "#fed7aa",
    "constellation": "Aries",
    "isAnchor": true
  },
  {
    "id": "diphda",
    "name": "Diphda",
    "ra": 10.897,
    "dec": -17.987,
    "mag": 2.04,
    "color": "#fed7aa",
    "constellation": "Cetus",
    "isAnchor": true
  },
  {
    "id": "nunki",
    "name": "Nunki",
    "ra": 283.816,
    "dec": -26.297,
    "mag": 2.05,
    "color": "#7dd3fc",
    "constellation": "Sagittarius",
    "isAnchor": true
  },
  {
    "id": "menkent",
    "name": "Menkent",
    "ra": 211.666,
    "dec": -36.37,
    "mag": 2.06,
    "color": "#fed7aa",
    "constellation": "Centaurus",
    "isAnchor": true
  },
  {
    "id": "mirach",
    "name": "Mirach",
    "ra": 17.433,
    "dec": 35.621,
    "mag": 2.07,
    "color": "#fb923c",
    "constellation": "Andromeda",
    "isAnchor": true
  },
  {
    "id": "saiph",
    "name": "Saiph",
    "ra": 86.939,
    "dec": -9.67,
    "mag": 2.07,
    "color": "#93c5fd",
    "constellation": "Orion",
    "isAnchor": true
  },
  {
    "id": "alpheratz",
    "name": "Alpheratz",
    "ra": 2.097,
    "dec": 29.09,
    "mag": 2.07,
    "color": "#93c5fd",
    "constellation": "Andromeda",
    "isAnchor": true
  },
  {
    "id": "kochab",
    "name": "Kochab",
    "ra": 222.676,
    "dec": 74.156,
    "mag": 2.07,
    "color": "#fed7aa",
    "constellation": "Ursa Minor",
    "isAnchor": true
  },
  {
    "id": "rasalhague",
    "name": "Rasalhague",
    "ra": 263.734,
    "dec": 12.56,
    "mag": 2.08,
    "color": "#ffffff",
    "constellation": "Ophiuchus",
    "isAnchor": true
  },
  {
    "id": "algol",
    "name": "Algol",
    "ra": 47.042,
    "dec": 40.956,
    "mag": 2.09,
    "color": "#93c5fd",
    "constellation": "Perseus",
    "isAnchor": true
  },
  {
    "id": "tiaki",
    "name": "Tiaki",
    "ra": 340.667,
    "dec": -46.885,
    "mag": 2.12,
    "color": "#f87171",
    "constellation": "Grus"
  },
  {
    "id": "muhlifain",
    "name": "Muhlifain",
    "ra": 190.38,
    "dec": -48.961,
    "mag": 2.2,
    "color": "#93c5fd",
    "constellation": "Centaurus"
  },
  {
    "id": "aspidiske",
    "name": "Aspidiske",
    "ra": 139.273,
    "dec": -59.275,
    "mag": 2.21,
    "color": "#ffffff",
    "constellation": "Carina"
  },
  {
    "id": "suhail",
    "name": "Suhail",
    "ra": 136.999,
    "dec": -43.433,
    "mag": 2.21,
    "color": "#fed7aa",
    "constellation": "Vela"
  },
  {
    "id": "alphecca",
    "name": "Alphecca",
    "ra": 233.672,
    "dec": 26.715,
    "mag": 2.22,
    "color": "#ffffff",
    "constellation": "Corona Borealis",
    "isAnchor": true
  },
  {
    "id": "mintaka",
    "name": "Mintaka",
    "ra": 83.002,
    "dec": -0.299,
    "mag": 2.23,
    "color": "#93c5fd",
    "constellation": "Orion",
    "isAnchor": true
  },
  {
    "id": "sadr",
    "name": "Sadr",
    "ra": 305.557,
    "dec": 40.257,
    "mag": 2.23,
    "color": "#fef08a",
    "constellation": "Cygnus",
    "isAnchor": true
  },
  {
    "id": "mizar",
    "name": "Mizar",
    "ra": 200.981,
    "dec": 54.925,
    "mag": 2.23,
    "color": "#f8fafc",
    "constellation": "Ursa Major",
    "isAnchor": true
  },
  {
    "id": "eltanin",
    "name": "Eltanin",
    "ra": 269.152,
    "dec": 51.489,
    "mag": 2.24,
    "color": "#fed7aa",
    "constellation": "Draco",
    "isAnchor": true
  },
  {
    "id": "shedar",
    "name": "Shedar",
    "ra": 10.127,
    "dec": 56.537,
    "mag": 2.24,
    "color": "#fed7aa",
    "constellation": "Cassiopeia",
    "isAnchor": true
  },
  {
    "id": "caph",
    "name": "Caph",
    "ra": 2.295,
    "dec": 59.15,
    "mag": 2.28,
    "color": "#f8fafc",
    "constellation": "Cassiopeia",
    "isAnchor": true
  },
  {
    "id": "dschubba",
    "name": "Dschubba",
    "ra": 240.083,
    "dec": -22.622,
    "mag": 2.29,
    "color": "#93c5fd",
    "constellation": "Scorpius"
  },
  {
    "id": "merak",
    "name": "Merak",
    "ra": 165.46,
    "dec": 56.382,
    "mag": 2.37,
    "color": "#f8fafc",
    "constellation": "Ursa Major",
    "isAnchor": true
  },
  {
    "id": "ankaa",
    "name": "Ankaa",
    "ra": 6.571,
    "dec": -42.306,
    "mag": 2.4,
    "color": "#fed7aa",
    "constellation": "Phoenix",
    "isAnchor": true
  },
  {
    "id": "phecda",
    "name": "Phecda",
    "ra": 178.458,
    "dec": 53.695,
    "mag": 2.44,
    "color": "#f8fafc",
    "constellation": "Ursa Major",
    "isAnchor": true
  },
  {
    "id": "sabik",
    "name": "Sabik",
    "ra": 257.595,
    "dec": -15.725,
    "mag": 2.43,
    "color": "#ffffff",
    "constellation": "Ophiuchus"
  },
  {
    "id": "scheat",
    "name": "Scheat",
    "ra": 345.944,
    "dec": 28.083,
    "mag": 2.44,
    "color": "#f87171",
    "constellation": "Pegasus",
    "isAnchor": true
  },
  {
    "id": "algenib",
    "name": "Algenib",
    "ra": 3.309,
    "dec": 15.184,
    "mag": 2.45,
    "color": "#93c5fd",
    "constellation": "Pegasus",
    "isAnchor": true
  },
  {
    "id": "markab",
    "name": "Markab",
    "ra": 346.19,
    "dec": 15.205,
    "mag": 2.49,
    "color": "#93c5fd",
    "constellation": "Pegasus",
    "isAnchor": true
  },
  {
    "id": "gienah",
    "name": "Gienah",
    "ra": 311.552,
    "dec": 33.97,
    "mag": 2.48,
    "color": "#fed7aa",
    "constellation": "Cygnus"
  },
  {
    "id": "navi",
    "name": "Navi",
    "ra": 14.177,
    "dec": 60.717,
    "mag": 2.47,
    "color": "#7dd3fc",
    "constellation": "Cassiopeia",
    "isAnchor": true
  },
  {
    "id": "ascella",
    "name": "Ascella",
    "ra": 285.653,
    "dec": -29.88,
    "mag": 2.59,
    "color": "#ffffff",
    "constellation": "Sagittarius"
  },
  {
    "id": "ruchbah",
    "name": "Ruchbah",
    "ra": 20.201,
    "dec": 60.235,
    "mag": 2.68,
    "color": "#f8fafc",
    "constellation": "Cassiopeia",
    "isAnchor": true
  },
  {
    "id": "kaus-media",
    "name": "Kaus Media",
    "ra": 277.447,
    "dec": -29.828,
    "mag": 2.72,
    "color": "#fed7aa",
    "constellation": "Sagittarius"
  },
  {
    "id": "kaus-borealis",
    "name": "Kaus Borealis",
    "ra": 276.993,
    "dec": -25.421,
    "mag": 2.82,
    "color": "#fed7aa",
    "constellation": "Sagittarius"
  },
  {
    "id": "delta-cyg",
    "name": "Fawaris",
    "ra": 296.244,
    "dec": 45.131,
    "mag": 2.86,
    "color": "#93c5fd",
    "constellation": "Cygnus"
  },
  {
    "id": "alcyone",
    "name": "Alcyone",
    "ra": 56.871,
    "dec": 24.105,
    "mag": 2.87,
    "color": "#7dd3fc",
    "constellation": "Taurus",
    "isAnchor": true
  },
  {
    "id": "alnasl",
    "name": "Alnasl",
    "ra": 271.455,
    "dec": -30.424,
    "mag": 2.98,
    "color": "#fed7aa",
    "constellation": "Sagittarius"
  },
  {
    "id": "megrez",
    "name": "Megrez",
    "ra": 183.857,
    "dec": 57.032,
    "mag": 3.32,
    "color": "#94a3b8",
    "constellation": "Ursa Major",
    "isAnchor": true
  },
  {
    "id": "segin",
    "name": "Segin",
    "ra": 26.654,
    "dec": 63.67,
    "mag": 3.37,
    "color": "#93c5fd",
    "constellation": "Cassiopeia",
    "isAnchor": true
  },
  {
    "id": "alcor",
    "name": "Alcor",
    "ra": 201.298,
    "dec": 54.988,
    "mag": 3.99,
    "color": "#ffffff",
    "constellation": "Ursa Major"
  },
  {
    "id": "muscida",
    "name": "Muscida",
    "ra": 135.664,
    "dec": 60.718,
    "mag": 3.35,
    "color": "#fb923c",
    "constellation": "Ursa Major"
  },
  {
    "id": "talitha",
    "name": "Talitha",
    "ra": 133.541,
    "dec": 48.042,
    "mag": 3.12,
    "color": "#ffffff",
    "constellation": "Ursa Major"
  },
  {
    "id": "tania-borealis",
    "name": "Tania Borealis",
    "ra": 154.275,
    "dec": 42.915,
    "mag": 3.45,
    "color": "#ffffff",
    "constellation": "Ursa Major"
  },
  {
    "id": "tania-australis",
    "name": "Tania Australis",
    "ra": 155.549,
    "dec": 41.499,
    "mag": 3.06,
    "color": "#f87171",
    "constellation": "Ursa Major"
  },
  {
    "id": "pherkad",
    "name": "Pherkad",
    "ra": 230.191,
    "dec": 71.834,
    "mag": 3.05,
    "color": "#ffffff",
    "constellation": "Ursa Minor"
  },
  {
    "id": "yildun",
    "name": "Yildun",
    "ra": 262.247,
    "dec": 86.586,
    "mag": 4.35,
    "color": "#ffffff",
    "constellation": "Ursa Minor"
  },
  {
    "id": "atlas",
    "name": "Atlas",
    "ra": 57.291,
    "dec": 24.053,
    "mag": 3.62,
    "color": "#7dd3fc",
    "constellation": "Taurus"
  },
  {
    "id": "electra",
    "name": "Electra",
    "ra": 56.219,
    "dec": 24.114,
    "mag": 3.7,
    "color": "#7dd3fc",
    "constellation": "Taurus"
  },
  {
    "id": "maia",
    "name": "Maia",
    "ra": 56.444,
    "dec": 24.368,
    "mag": 3.86,
    "color": "#7dd3fc",
    "constellation": "Taurus"
  },
  {
    "id": "merope",
    "name": "Merope",
    "ra": 56.602,
    "dec": 23.948,
    "mag": 4.17,
    "color": "#7dd3fc",
    "constellation": "Taurus"
  },
  {
    "id": "taygeta",
    "name": "Taygeta",
    "ra": 56.302,
    "dec": 24.468,
    "mag": 4.29,
    "color": "#7dd3fc",
    "constellation": "Taurus"
  },
  {
    "id": "pleione",
    "name": "Pleione",
    "ra": 57.295,
    "dec": 24.135,
    "mag": 5.09,
    "color": "#7dd3fc",
    "constellation": "Taurus"
  },
  {
    "id": "celaeno",
    "name": "Celaeno",
    "ra": 56.199,
    "dec": 24.298,
    "mag": 5.44,
    "color": "#7dd3fc",
    "constellation": "Taurus"
  },
  {
    "id": "asterope",
    "name": "Asterope",
    "ra": 56.484,
    "dec": 24.554,
    "mag": 5.64,
    "color": "#7dd3fc",
    "constellation": "Taurus"
  },
  {
    "id": "18-tau",
    "name": "18 Tau",
    "ra": 56.289,
    "dec": 24.845,
    "mag": 5.66,
    "color": "#93c5fd",
    "constellation": "Taurus"
  },
  {
    "id": "28-tau",
    "name": "28 Tau",
    "ra": 57.301,
    "dec": 24.089,
    "mag": 5.7,
    "color": "#93c5fd",
    "constellation": "Taurus"
  },
  {
    "id": "hd-23753",
    "name": "HD 23753",
    "ra": 56.883,
    "dec": 23.411,
    "mag": 5.44,
    "color": "#93c5fd",
    "constellation": "Taurus"
  },
  {
    "id": "hd-23642",
    "name": "HD 23642",
    "ra": 56.551,
    "dec": 24.288,
    "mag": 5.99,
    "color": "#93c5fd",
    "constellation": "Taurus"
  },
  {
    "id": "hd-23923",
    "name": "HD 23923",
    "ra": 57.279,
    "dec": 23.633,
    "mag": 6.17,
    "color": "#ffffff",
    "constellation": "Taurus"
  },
  {
    "id": "hd-23432",
    "name": "HD 23432",
    "ra": 56.095,
    "dec": 24.566,
    "mag": 6.42,
    "color": "#ffffff",
    "constellation": "Taurus"
  },
  {
    "id": "hd-23480",
    "name": "HD 23480",
    "ra": 56.208,
    "dec": 24.89,
    "mag": 6.68,
    "color": "#ffffff",
    "constellation": "Taurus"
  },
  {
    "id": "hd-23568",
    "name": "HD 23568",
    "ra": 56.398,
    "dec": 23.905,
    "mag": 6.81,
    "color": "#ffffff",
    "constellation": "Taurus"
  },
  {
    "id": "hd-23873",
    "name": "HD 23873",
    "ra": 57.17,
    "dec": 24.321,
    "mag": 6.95,
    "color": "#ffffff",
    "constellation": "Taurus"
  },
  {
    "id": "theta2-tau",
    "name": "Theta² Tau",
    "ra": 67.168,
    "dec": 15.868,
    "mag": 3.4,
    "color": "#ffffff",
    "constellation": "Taurus"
  },
  {
    "id": "gamma-tau",
    "name": "Gamma Tau (Hyadum I)",
    "ra": 64.954,
    "dec": 15.626,
    "mag": 3.65,
    "color": "#fed7aa",
    "constellation": "Taurus"
  },
  {
    "id": "delta1-tau",
    "name": "Delta¹ Tau (Hyadum II)",
    "ra": 65.733,
    "dec": 17.543,
    "mag": 3.76,
    "color": "#fed7aa",
    "constellation": "Taurus"
  },
  {
    "id": "epsilon-tau",
    "name": "Ain (ε Tau)",
    "ra": 67.154,
    "dec": 19.18,
    "mag": 3.53,
    "color": "#fed7aa",
    "constellation": "Taurus"
  },
  {
    "id": "theta1-tau",
    "name": "Theta¹ Tau",
    "ra": 67.098,
    "dec": 15.961,
    "mag": 3.85,
    "color": "#fed7aa",
    "constellation": "Taurus"
  },
  {
    "id": "71-tau",
    "name": "71 Tau",
    "ra": 66.529,
    "dec": 15.622,
    "mag": 4.48,
    "color": "#ffffff",
    "constellation": "Taurus"
  },
  {
    "id": "75-tau",
    "name": "75 Tau",
    "ra": 67.618,
    "dec": 16.368,
    "mag": 4.96,
    "color": "#fed7aa",
    "constellation": "Taurus"
  },
  {
    "id": "76-tau",
    "name": "76 Tau",
    "ra": 67.751,
    "dec": 14.789,
    "mag": 5.9,
    "color": "#fef08a",
    "constellation": "Taurus"
  },
  {
    "id": "hd-28546",
    "name": "HD 28546",
    "ra": 67.432,
    "dec": 17.21,
    "mag": 6.35,
    "color": "#ffffff",
    "constellation": "Taurus"
  },
  {
    "id": "hd-28319",
    "name": "HD 28319",
    "ra": 66.905,
    "dec": 16.892,
    "mag": 6.62,
    "color": "#fef08a",
    "constellation": "Taurus"
  },
  {
    "id": "hd-27934",
    "name": "HD 27934",
    "ra": 66.112,
    "dec": 15.99,
    "mag": 6.92,
    "color": "#ffffff",
    "constellation": "Taurus"
  },
  {
    "id": "meissa",
    "name": "Meissa (λ Ori)",
    "ra": 83.784,
    "dec": 9.934,
    "mag": 3.39,
    "color": "#93c5fd",
    "constellation": "Orion"
  },
  {
    "id": "iota-ori",
    "name": "Hatsya (ι Ori)",
    "ra": 83.858,
    "dec": -5.91,
    "mag": 2.77,
    "color": "#7dd3fc",
    "constellation": "Orion"
  },
  {
    "id": "theta1-ori",
    "name": "Trapezium (θ¹ Ori)",
    "ra": 83.819,
    "dec": -5.387,
    "mag": 4.98,
    "color": "#67e8f9",
    "constellation": "Orion"
  },
  {
    "id": "theta2-ori",
    "name": "θ² Ori",
    "ra": 83.861,
    "dec": -5.415,
    "mag": 5.02,
    "color": "#93c5fd",
    "constellation": "Orion"
  },
  {
    "id": "42-ori",
    "name": "42 Ori",
    "ra": 83.824,
    "dec": -4.837,
    "mag": 4.59,
    "color": "#93c5fd",
    "constellation": "Orion"
  },
  {
    "id": "29-ori",
    "name": "29 Ori",
    "ra": 85.955,
    "dec": -7.811,
    "mag": 4.13,
    "color": "#ffffff",
    "constellation": "Orion"
  },
  {
    "id": "25-ori",
    "name": "25 Ori",
    "ra": 81.218,
    "dec": 1.842,
    "mag": 4.89,
    "color": "#93c5fd",
    "constellation": "Orion"
  },
  {
    "id": "hd-37017",
    "name": "HD 37017",
    "ra": 83.89,
    "dec": -4.85,
    "mag": 6.56,
    "color": "#93c5fd",
    "constellation": "Orion"
  },
  {
    "id": "hd-36959",
    "name": "HD 36959",
    "ra": 83.742,
    "dec": -6.012,
    "mag": 5.67,
    "color": "#ffffff",
    "constellation": "Orion"
  },
  {
    "id": "hd-37742",
    "name": "HD 37742",
    "ra": 85.195,
    "dec": -1.95,
    "mag": 6.85,
    "color": "#93c5fd",
    "constellation": "Orion"
  },
  {
    "id": "albireo",
    "name": "Albireo (β Cyg)",
    "ra": 292.68,
    "dec": 27.96,
    "mag": 3.05,
    "color": "#fed7aa",
    "constellation": "Cygnus",
    "isAnchor": true
  },
  {
    "id": "zeta-cyg",
    "name": "Zeta Cyg",
    "ra": 318.326,
    "dec": 30.227,
    "mag": 3.21,
    "color": "#fef08a",
    "constellation": "Cygnus"
  },
  {
    "id": "tau-cyg",
    "name": "Tau Cyg",
    "ra": 322.846,
    "dec": 38.035,
    "mag": 3.74,
    "color": "#ffffff",
    "constellation": "Cygnus"
  },
  {
    "id": "61-cyg-a",
    "name": "61 Cygni A",
    "ra": 316.73,
    "dec": 38.749,
    "mag": 5.21,
    "color": "#fed7aa",
    "constellation": "Cygnus"
  },
  {
    "id": "61-cyg-b",
    "name": "61 Cygni B",
    "ra": 316.732,
    "dec": 38.752,
    "mag": 6.03,
    "color": "#fb923c",
    "constellation": "Cygnus"
  },
  {
    "id": "52-cyg",
    "name": "52 Cygni (Veil)",
    "ra": 311.455,
    "dec": 30.718,
    "mag": 4.22,
    "color": "#fed7aa",
    "constellation": "Cygnus"
  },
  {
    "id": "hd-192640",
    "name": "HD 192640",
    "ra": 303.882,
    "dec": 36.804,
    "mag": 6.12,
    "color": "#ffffff",
    "constellation": "Cygnus"
  },
  {
    "id": "hd-193237",
    "name": "HD 193237",
    "ra": 304.421,
    "dec": 38.031,
    "mag": 6.55,
    "color": "#93c5fd",
    "constellation": "Cygnus"
  },
  {
    "id": "hd-194093",
    "name": "HD 194093",
    "ra": 305.881,
    "dec": 41.205,
    "mag": 6.84,
    "color": "#ffffff",
    "constellation": "Cygnus"
  },
  {
    "id": "hd-201091",
    "name": "HD 201091",
    "ra": 316.755,
    "dec": 38.802,
    "mag": 6.98,
    "color": "#fef08a",
    "constellation": "Cygnus"
  },
  {
    "id": "zeta-per",
    "name": "Zeta Per",
    "ra": 58.528,
    "dec": 31.884,
    "mag": 2.84,
    "color": "#93c5fd",
    "constellation": "Perseus"
  },
  {
    "id": "chi-per",
    "name": "Chi Per (NGC 884)",
    "ra": 35.625,
    "dec": 57.161,
    "mag": 6.11,
    "color": "#93c5fd",
    "constellation": "Perseus"
  },
  {
    "id": "7-per",
    "name": "7 Per",
    "ra": 32.884,
    "dec": 55.48,
    "mag": 6.52,
    "color": "#ffffff",
    "constellation": "Perseus"
  },
  {
    "id": "9-per",
    "name": "9 Per",
    "ra": 34.12,
    "dec": 55.91,
    "mag": 6.78,
    "color": "#ffffff",
    "constellation": "Perseus"
  },
  {
    "id": "11-per",
    "name": "11 Per",
    "ra": 35.105,
    "dec": 56.84,
    "mag": 6.85,
    "color": "#93c5fd",
    "constellation": "Perseus"
  },
  {
    "id": "hd-14143",
    "name": "HD 14143",
    "ra": 34.61,
    "dec": 57.085,
    "mag": 6.67,
    "color": "#93c5fd",
    "constellation": "Perseus"
  },
  {
    "id": "hd-14818",
    "name": "HD 14818",
    "ra": 36.105,
    "dec": 56.988,
    "mag": 6.25,
    "color": "#93c5fd",
    "constellation": "Perseus"
  },
  {
    "id": "acubens",
    "name": "Acubens (α Cnc)",
    "ra": 134.607,
    "dec": 11.858,
    "mag": 4.26,
    "color": "#ffffff",
    "constellation": "Cancer"
  },
  {
    "id": "asellus-aust",
    "name": "Asellus Australis",
    "ra": 130.932,
    "dec": 18.155,
    "mag": 3.94,
    "color": "#fed7aa",
    "constellation": "Cancer"
  },
  {
    "id": "asellus-bor",
    "name": "Asellus Borealis",
    "ra": 130.828,
    "dec": 18.007,
    "mag": 4.66,
    "color": "#ffffff",
    "constellation": "Cancer"
  },
  {
    "id": "epsilon-cnc",
    "name": "Epsilon Cnc (M44)",
    "ra": 130.1,
    "dec": 19.51,
    "mag": 6.29,
    "color": "#ffffff",
    "constellation": "Cancer"
  },
  {
    "id": "38-cnc",
    "name": "38 Cnc",
    "ra": 130.54,
    "dec": 19.78,
    "mag": 6.65,
    "color": "#ffffff",
    "constellation": "Cancer"
  },
  {
    "id": "39-cnc",
    "name": "39 Cnc",
    "ra": 130.71,
    "dec": 20.01,
    "mag": 6.4,
    "color": "#fef08a",
    "constellation": "Cancer"
  },
  {
    "id": "40-cnc",
    "name": "40 Cnc",
    "ra": 130.85,
    "dec": 19.34,
    "mag": 6.61,
    "color": "#ffffff",
    "constellation": "Cancer"
  },
  {
    "id": "42-cnc",
    "name": "42 Cnc",
    "ra": 131.02,
    "dec": 19.68,
    "mag": 6.83,
    "color": "#ffffff",
    "constellation": "Cancer"
  },
  {
    "id": "diadem",
    "name": "Diadem (α Com)",
    "ra": 197.986,
    "dec": 17.528,
    "mag": 4.32,
    "color": "#fef08a",
    "constellation": "Coma Berenices"
  },
  {
    "id": "12-com",
    "name": "12 Com",
    "ra": 185.641,
    "dec": 25.848,
    "mag": 4.81,
    "color": "#fed7aa",
    "constellation": "Coma Berenices"
  },
  {
    "id": "13-com",
    "name": "13 Com",
    "ra": 186.012,
    "dec": 26.115,
    "mag": 5.18,
    "color": "#ffffff",
    "constellation": "Coma Berenices"
  },
  {
    "id": "14-com",
    "name": "14 Com",
    "ra": 186.64,
    "dec": 27.27,
    "mag": 4.95,
    "color": "#fef08a",
    "constellation": "Coma Berenices"
  },
  {
    "id": "16-com",
    "name": "16 Com",
    "ra": 186.755,
    "dec": 26.82,
    "mag": 5,
    "color": "#ffffff",
    "constellation": "Coma Berenices"
  },
  {
    "id": "21-com",
    "name": "21 Com",
    "ra": 187.77,
    "dec": 24.57,
    "mag": 5.46,
    "color": "#ffffff",
    "constellation": "Coma Berenices"
  },
  {
    "id": "hd-108381",
    "name": "HD 108381",
    "ra": 186.99,
    "dec": 25.41,
    "mag": 6.64,
    "color": "#ffffff",
    "constellation": "Coma Berenices"
  },
  {
    "id": "hd-108382",
    "name": "HD 108382",
    "ra": 187.12,
    "dec": 26.33,
    "mag": 6.88,
    "color": "#fef08a",
    "constellation": "Coma Berenices"
  },
  {
    "id": "wei",
    "name": "Wei (ε Sco)",
    "ra": 252.544,
    "dec": -34.293,
    "mag": 2.29,
    "color": "#fed7aa",
    "constellation": "Scorpius"
  },
  {
    "id": "grafias",
    "name": "Acrab / Grafias",
    "ra": 241.359,
    "dec": -19.805,
    "mag": 2.56,
    "color": "#93c5fd",
    "constellation": "Scorpius"
  },
  {
    "id": "fang",
    "name": "Fang (π Sco)",
    "ra": 239.719,
    "dec": -26.114,
    "mag": 2.91,
    "color": "#93c5fd",
    "constellation": "Scorpius"
  },
  {
    "id": "lesath",
    "name": "Lesath",
    "ra": 263.149,
    "dec": -37.296,
    "mag": 2.69,
    "color": "#7dd3fc",
    "constellation": "Scorpius"
  },
  {
    "id": "alniyat",
    "name": "Al Niyat (σ Sco)",
    "ra": 245.298,
    "dec": -25.59,
    "mag": 2.89,
    "color": "#93c5fd",
    "constellation": "Scorpius"
  },
  {
    "id": "polis",
    "name": "Polis (μ Sgr)",
    "ra": 273.447,
    "dec": -21.059,
    "mag": 3.84,
    "color": "#7dd3fc",
    "constellation": "Sagittarius"
  },
  {
    "id": "52-sgr",
    "name": "52 Sgr",
    "ra": 295.42,
    "dec": -24.89,
    "mag": 4.59,
    "color": "#ffffff",
    "constellation": "Sagittarius"
  },
  {
    "id": "hd-164284",
    "name": "HD 164284",
    "ra": 270.21,
    "dec": -28.55,
    "mag": 6.15,
    "color": "#fed7aa",
    "constellation": "Sagittarius"
  },
  {
    "id": "hd-168454",
    "name": "HD 168454",
    "ra": 275.4,
    "dec": -29.11,
    "mag": 6.48,
    "color": "#ffffff",
    "constellation": "Sagittarius"
  },
  {
    "id": "hd-172910",
    "name": "HD 172910",
    "ra": 280.95,
    "dec": -31.25,
    "mag": 6.77,
    "color": "#fed7aa",
    "constellation": "Sagittarius"
  },
  {
    "id": "hd-165784",
    "name": "HD 165784",
    "ra": 272.1,
    "dec": -26.9,
    "mag": 6.91,
    "color": "#ffffff",
    "constellation": "Sagittarius"
  },
  {
    "id": "star-field-1",
    "name": "HD 200846",
    "ra": 226.608,
    "dec": -2.786,
    "mag": 6.08,
    "color": "#fef9c3",
    "constellation": "Hercules",
    "isAnchor": false
  },
  {
    "id": "star-field-2",
    "name": "HD 202594",
    "ra": 52.398,
    "dec": 35.216,
    "mag": 6.99,
    "color": "#93c5fd",
    "constellation": "Auriga",
    "isAnchor": false
  },
  {
    "id": "star-field-3",
    "name": "HD 64405",
    "ra": 216.168,
    "dec": 35.771,
    "mag": 6.17,
    "color": "#f87171",
    "constellation": "Centaurus",
    "isAnchor": false
  },
  {
    "id": "star-field-4",
    "name": "Pup 61",
    "ra": 134.863,
    "dec": 47.51,
    "mag": 3.85,
    "color": "#ffffff",
    "constellation": "Puppis",
    "isAnchor": false
  },
  {
    "id": "star-field-5",
    "name": "Lyn 46",
    "ra": 129.044,
    "dec": -17.432,
    "mag": 3.62,
    "color": "#fed7aa",
    "constellation": "Lynx",
    "isAnchor": false
  },
  {
    "id": "star-field-6",
    "name": "HD 197834",
    "ra": 281.185,
    "dec": 54.943,
    "mag": 6.05,
    "color": "#ffffff",
    "constellation": "Pegasus",
    "isAnchor": false
  },
  {
    "id": "star-field-7",
    "name": "HD 142747",
    "ra": 301.576,
    "dec": -39.74,
    "mag": 5.39,
    "color": "#ffffff",
    "constellation": "Cetus",
    "isAnchor": false
  },
  {
    "id": "star-field-8",
    "name": "For 70",
    "ra": 42.354,
    "dec": -75.963,
    "mag": 4.03,
    "color": "#93c5fd",
    "constellation": "Fornax",
    "isAnchor": false
  },
  {
    "id": "star-field-9",
    "name": "Pho 55",
    "ra": 49.015,
    "dec": -27.33,
    "mag": 4.27,
    "color": "#fef08a",
    "constellation": "Phoenix",
    "isAnchor": false
  },
  {
    "id": "star-field-10",
    "name": "HD 59964",
    "ra": 286.529,
    "dec": -6.33,
    "mag": 6.42,
    "color": "#fed7aa",
    "constellation": "Ophiuchus",
    "isAnchor": false
  },
  {
    "id": "star-field-11",
    "name": "HD 119371",
    "ra": 212.049,
    "dec": -3.562,
    "mag": 5.92,
    "color": "#fef08a",
    "constellation": "Cassiopeia",
    "isAnchor": false
  },
  {
    "id": "star-field-12",
    "name": "HD 116947",
    "ra": 89.731,
    "dec": 46.005,
    "mag": 5.75,
    "color": "#ffffff",
    "constellation": "Capricornus",
    "isAnchor": false
  },
  {
    "id": "star-field-13",
    "name": "HD 170268",
    "ra": 177.633,
    "dec": 25.042,
    "mag": 6.84,
    "color": "#f8fafc",
    "constellation": "Monoceros",
    "isAnchor": false
  },
  {
    "id": "star-field-14",
    "name": "HD 202260",
    "ra": 326.365,
    "dec": -46.229,
    "mag": 5.58,
    "color": "#f87171",
    "constellation": "Triangulum",
    "isAnchor": false
  },
  {
    "id": "star-field-15",
    "name": "HD 120056",
    "ra": 136.009,
    "dec": -3.241,
    "mag": 5.75,
    "color": "#f87171",
    "constellation": "Carina",
    "isAnchor": false
  },
  {
    "id": "star-field-16",
    "name": "HD 100872",
    "ra": 237.792,
    "dec": -24.725,
    "mag": 5.86,
    "color": "#fed7aa",
    "constellation": "Grus",
    "isAnchor": false
  },
  {
    "id": "star-field-17",
    "name": "HD 36509",
    "ra": 86.664,
    "dec": 54.977,
    "mag": 6.48,
    "color": "#fef9c3",
    "constellation": "Volans",
    "isAnchor": false
  },
  {
    "id": "star-field-18",
    "name": "HD 225979",
    "ra": 238.06,
    "dec": -6.787,
    "mag": 6.93,
    "color": "#93c5fd",
    "constellation": "Capricornus",
    "isAnchor": false
  },
  {
    "id": "star-field-19",
    "name": "HD 175650",
    "ra": 76.898,
    "dec": 82.981,
    "mag": 6.52,
    "color": "#ffffff",
    "constellation": "Vulpecula",
    "isAnchor": false
  },
  {
    "id": "star-field-20",
    "name": "HD 184643",
    "ra": 160.664,
    "dec": 50.111,
    "mag": 6.49,
    "color": "#fef9c3",
    "constellation": "Phoenix",
    "isAnchor": false
  },
  {
    "id": "star-field-21",
    "name": "HD 10517",
    "ra": 74.53,
    "dec": 7.796,
    "mag": 6.37,
    "color": "#ffffff",
    "constellation": "Libra",
    "isAnchor": false
  },
  {
    "id": "star-field-22",
    "name": "HD 58875",
    "ra": 82.695,
    "dec": 20.938,
    "mag": 6.01,
    "color": "#fef08a",
    "constellation": "Pyxis",
    "isAnchor": false
  },
  {
    "id": "star-field-23",
    "name": "HD 154686",
    "ra": 250.08,
    "dec": -30.202,
    "mag": 6.25,
    "color": "#f87171",
    "constellation": "Pyxis",
    "isAnchor": false
  },
  {
    "id": "star-field-24",
    "name": "HD 56752",
    "ra": 313.799,
    "dec": -12.639,
    "mag": 6.63,
    "color": "#f87171",
    "constellation": "Vela",
    "isAnchor": false
  },
  {
    "id": "star-field-25",
    "name": "HD 44298",
    "ra": 217.117,
    "dec": 23.707,
    "mag": 6.63,
    "color": "#f8fafc",
    "constellation": "Lacerta",
    "isAnchor": false
  },
  {
    "id": "star-field-26",
    "name": "HD 195951",
    "ra": 254.705,
    "dec": -54.918,
    "mag": 5.88,
    "color": "#f87171",
    "constellation": "Canis Major",
    "isAnchor": false
  },
  {
    "id": "star-field-27",
    "name": "Tri 50",
    "ra": 355.616,
    "dec": 60.718,
    "mag": 4.57,
    "color": "#fef08a",
    "constellation": "Triangulum",
    "isAnchor": false
  },
  {
    "id": "star-field-28",
    "name": "HD 12110",
    "ra": 60.064,
    "dec": 10.531,
    "mag": 6.41,
    "color": "#f8fafc",
    "constellation": "Hydra",
    "isAnchor": false
  },
  {
    "id": "star-field-29",
    "name": "HD 106151",
    "ra": 283.494,
    "dec": 77.38,
    "mag": 5.17,
    "color": "#fed7aa",
    "constellation": "Pisces",
    "isAnchor": false
  },
  {
    "id": "star-field-30",
    "name": "HD 194297",
    "ra": 76.18,
    "dec": -28.19,
    "mag": 5.42,
    "color": "#f8fafc",
    "constellation": "Dorado",
    "isAnchor": false
  },
  {
    "id": "star-field-31",
    "name": "Pyx 24",
    "ra": 193.641,
    "dec": 5.745,
    "mag": 4.41,
    "color": "#93c5fd",
    "constellation": "Pyxis",
    "isAnchor": false
  },
  {
    "id": "star-field-32",
    "name": "HD 102290",
    "ra": 275.449,
    "dec": -7.905,
    "mag": 5.91,
    "color": "#fed7aa",
    "constellation": "Lynx",
    "isAnchor": false
  },
  {
    "id": "star-field-33",
    "name": "HD 228918",
    "ra": 343.557,
    "dec": 53.359,
    "mag": 6.86,
    "color": "#fed7aa",
    "constellation": "Ursa Major",
    "isAnchor": false
  },
  {
    "id": "star-field-34",
    "name": "HD 20107",
    "ra": 186.282,
    "dec": -23.516,
    "mag": 5.5,
    "color": "#f87171",
    "constellation": "Capricornus",
    "isAnchor": false
  },
  {
    "id": "star-field-35",
    "name": "Eri 72",
    "ra": 103.256,
    "dec": -7.897,
    "mag": 4.67,
    "color": "#fef08a",
    "constellation": "Eridanus",
    "isAnchor": false
  },
  {
    "id": "star-field-36",
    "name": "HD 86172",
    "ra": 111.591,
    "dec": -15.046,
    "mag": 4.94,
    "color": "#fef9c3",
    "constellation": "Cetus",
    "isAnchor": false
  },
  {
    "id": "star-field-37",
    "name": "HD 17959",
    "ra": 185.709,
    "dec": -11.219,
    "mag": 5.09,
    "color": "#ffffff",
    "constellation": "Corvus",
    "isAnchor": false
  },
  {
    "id": "star-field-38",
    "name": "HD 176482",
    "ra": 322.657,
    "dec": -40.765,
    "mag": 6.55,
    "color": "#ffffff",
    "constellation": "Pavo",
    "isAnchor": false
  },
  {
    "id": "star-field-39",
    "name": "HD 26864",
    "ra": 126.914,
    "dec": 25.127,
    "mag": 5.19,
    "color": "#f87171",
    "constellation": "Carina",
    "isAnchor": false
  },
  {
    "id": "star-field-40",
    "name": "And 59",
    "ra": 272.426,
    "dec": -29.297,
    "mag": 4.12,
    "color": "#fef08a",
    "constellation": "Andromeda",
    "isAnchor": false
  },
  {
    "id": "star-field-41",
    "name": "HD 37454",
    "ra": 208.408,
    "dec": -31.008,
    "mag": 6.44,
    "color": "#fef08a",
    "constellation": "Vulpecula",
    "isAnchor": false
  },
  {
    "id": "star-field-42",
    "name": "Cyg 80",
    "ra": 65.088,
    "dec": 39.811,
    "mag": 3.52,
    "color": "#fef9c3",
    "constellation": "Cygnus",
    "isAnchor": false
  },
  {
    "id": "star-field-43",
    "name": "HD 216454",
    "ra": 278.475,
    "dec": -51.675,
    "mag": 5.78,
    "color": "#93c5fd",
    "constellation": "Pictor",
    "isAnchor": false
  },
  {
    "id": "star-field-44",
    "name": "HD 92140",
    "ra": 323.87,
    "dec": 21.27,
    "mag": 6.79,
    "color": "#fef9c3",
    "constellation": "Boötes",
    "isAnchor": false
  },
  {
    "id": "star-field-45",
    "name": "HD 146405",
    "ra": 230.806,
    "dec": 8.692,
    "mag": 6.06,
    "color": "#fef08a",
    "constellation": "Hercules",
    "isAnchor": false
  },
  {
    "id": "star-field-46",
    "name": "HD 200554",
    "ra": 195.358,
    "dec": 60.911,
    "mag": 6.72,
    "color": "#f8fafc",
    "constellation": "Sagitta",
    "isAnchor": false
  },
  {
    "id": "star-field-47",
    "name": "HD 70789",
    "ra": 82,
    "dec": 14.722,
    "mag": 6.32,
    "color": "#f87171",
    "constellation": "Auriga",
    "isAnchor": false
  },
  {
    "id": "star-field-48",
    "name": "HD 15099",
    "ra": 253.413,
    "dec": -53.26,
    "mag": 6.04,
    "color": "#fed7aa",
    "constellation": "Corvus",
    "isAnchor": false
  },
  {
    "id": "star-field-49",
    "name": "Sag 45",
    "ra": 112.556,
    "dec": -36.556,
    "mag": 4.26,
    "color": "#f8fafc",
    "constellation": "Sagitta",
    "isAnchor": false
  },
  {
    "id": "star-field-50",
    "name": "HD 90529",
    "ra": 81.987,
    "dec": -13.173,
    "mag": 6.47,
    "color": "#fef9c3",
    "constellation": "Corona Borealis",
    "isAnchor": false
  },
  {
    "id": "star-field-51",
    "name": "HD 80990",
    "ra": 324.827,
    "dec": -42.936,
    "mag": 5.87,
    "color": "#fef08a",
    "constellation": "Pavo",
    "isAnchor": false
  },
  {
    "id": "star-field-52",
    "name": "Pav 38",
    "ra": 149.164,
    "dec": -30.243,
    "mag": 3.64,
    "color": "#ffffff",
    "constellation": "Pavo",
    "isAnchor": false
  },
  {
    "id": "star-field-53",
    "name": "HD 88049",
    "ra": 43.369,
    "dec": 54.807,
    "mag": 5.05,
    "color": "#f8fafc",
    "constellation": "Lacerta",
    "isAnchor": false
  },
  {
    "id": "star-field-54",
    "name": "HD 209479",
    "ra": 120.194,
    "dec": 34.27,
    "mag": 6.14,
    "color": "#ffffff",
    "constellation": "Crux",
    "isAnchor": false
  },
  {
    "id": "star-field-55",
    "name": "HD 192852",
    "ra": 274.639,
    "dec": -43.355,
    "mag": 5.59,
    "color": "#f87171",
    "constellation": "Vela",
    "isAnchor": false
  },
  {
    "id": "star-field-56",
    "name": "HD 110743",
    "ra": 317.353,
    "dec": 50.276,
    "mag": 6.02,
    "color": "#fef9c3",
    "constellation": "Orion",
    "isAnchor": false
  },
  {
    "id": "star-field-57",
    "name": "Oph 80",
    "ra": 133.705,
    "dec": 83.514,
    "mag": 4.64,
    "color": "#fef08a",
    "constellation": "Ophiuchus",
    "isAnchor": false
  },
  {
    "id": "star-field-58",
    "name": "HD 77702",
    "ra": 122.328,
    "dec": 12.55,
    "mag": 5.54,
    "color": "#fef08a",
    "constellation": "Sagittarius",
    "isAnchor": false
  },
  {
    "id": "star-field-59",
    "name": "HD 18643",
    "ra": 166.02,
    "dec": -53.374,
    "mag": 6.59,
    "color": "#f8fafc",
    "constellation": "Equuleus",
    "isAnchor": false
  },
  {
    "id": "star-field-60",
    "name": "HD 205259",
    "ra": 277.637,
    "dec": -31.676,
    "mag": 6.54,
    "color": "#ffffff",
    "constellation": "Crux",
    "isAnchor": false
  },
  {
    "id": "star-field-61",
    "name": "HD 61936",
    "ra": 163.414,
    "dec": 42.547,
    "mag": 5.75,
    "color": "#fef08a",
    "constellation": "Pegasus",
    "isAnchor": false
  },
  {
    "id": "star-field-62",
    "name": "HD 182342",
    "ra": 154.496,
    "dec": -44.918,
    "mag": 6.59,
    "color": "#fef08a",
    "constellation": "Pictor",
    "isAnchor": false
  },
  {
    "id": "star-field-63",
    "name": "HD 60282",
    "ra": 28.521,
    "dec": 22.506,
    "mag": 5.4,
    "color": "#f8fafc",
    "constellation": "Crater",
    "isAnchor": false
  },
  {
    "id": "star-field-64",
    "name": "HD 62129",
    "ra": 327.126,
    "dec": -18.018,
    "mag": 5.75,
    "color": "#fef08a",
    "constellation": "Carina",
    "isAnchor": false
  },
  {
    "id": "star-field-65",
    "name": "HD 84516",
    "ra": 34.065,
    "dec": -48.394,
    "mag": 5.66,
    "color": "#f87171",
    "constellation": "Cancer",
    "isAnchor": false
  },
  {
    "id": "star-field-66",
    "name": "HD 50003",
    "ra": 171.776,
    "dec": 18.853,
    "mag": 6.9,
    "color": "#fed7aa",
    "constellation": "Dorado",
    "isAnchor": false
  },
  {
    "id": "star-field-67",
    "name": "HD 193052",
    "ra": 313.195,
    "dec": 55.536,
    "mag": 5.88,
    "color": "#f8fafc",
    "constellation": "Lupus",
    "isAnchor": false
  },
  {
    "id": "star-field-68",
    "name": "HD 91019",
    "ra": 271.783,
    "dec": 24.79,
    "mag": 6.33,
    "color": "#ffffff",
    "constellation": "Serpens",
    "isAnchor": false
  },
  {
    "id": "star-field-69",
    "name": "Cas 41",
    "ra": 218.886,
    "dec": -39.031,
    "mag": 3.58,
    "color": "#f87171",
    "constellation": "Cassiopeia",
    "isAnchor": false
  },
  {
    "id": "star-field-70",
    "name": "HD 91581",
    "ra": 229.736,
    "dec": -11.872,
    "mag": 5.81,
    "color": "#93c5fd",
    "constellation": "Vela",
    "isAnchor": false
  },
  {
    "id": "star-field-71",
    "name": "Cap 50",
    "ra": 57.166,
    "dec": -11.303,
    "mag": 4.16,
    "color": "#f8fafc",
    "constellation": "Capricornus",
    "isAnchor": false
  },
  {
    "id": "star-field-72",
    "name": "HD 119738",
    "ra": 256.056,
    "dec": -38.84,
    "mag": 5.74,
    "color": "#f8fafc",
    "constellation": "Lupus",
    "isAnchor": false
  },
  {
    "id": "star-field-73",
    "name": "HD 48485",
    "ra": 233.675,
    "dec": 32.981,
    "mag": 5.74,
    "color": "#fef08a",
    "constellation": "Sculptor",
    "isAnchor": false
  },
  {
    "id": "star-field-74",
    "name": "Ori 39",
    "ra": 248.883,
    "dec": -30.529,
    "mag": 4.67,
    "color": "#fef9c3",
    "constellation": "Orion",
    "isAnchor": false
  },
  {
    "id": "star-field-75",
    "name": "Equ 26",
    "ra": 81.571,
    "dec": -37.545,
    "mag": 4.15,
    "color": "#93c5fd",
    "constellation": "Equuleus",
    "isAnchor": false
  },
  {
    "id": "star-field-76",
    "name": "HD 118883",
    "ra": 259.457,
    "dec": -43.116,
    "mag": 4.91,
    "color": "#f8fafc",
    "constellation": "Sagittarius",
    "isAnchor": false
  },
  {
    "id": "star-field-77",
    "name": "HD 212488",
    "ra": 323.005,
    "dec": 4.331,
    "mag": 4.93,
    "color": "#f8fafc",
    "constellation": "Crux",
    "isAnchor": false
  },
  {
    "id": "star-field-78",
    "name": "HD 108272",
    "ra": 6.551,
    "dec": -56.928,
    "mag": 6.4,
    "color": "#f87171",
    "constellation": "Pegasus",
    "isAnchor": false
  },
  {
    "id": "star-field-79",
    "name": "HD 148567",
    "ra": 139.082,
    "dec": -2.347,
    "mag": 6.87,
    "color": "#ffffff",
    "constellation": "Sculptor",
    "isAnchor": false
  },
  {
    "id": "star-field-80",
    "name": "HD 106688",
    "ra": 58.61,
    "dec": 20.605,
    "mag": 5.34,
    "color": "#fef9c3",
    "constellation": "Crater",
    "isAnchor": false
  },
  {
    "id": "star-field-81",
    "name": "HD 190443",
    "ra": 98.994,
    "dec": 57.716,
    "mag": 6.79,
    "color": "#ffffff",
    "constellation": "Capricornus",
    "isAnchor": false
  },
  {
    "id": "star-field-82",
    "name": "HD 68373",
    "ra": 135.438,
    "dec": -18.384,
    "mag": 6.75,
    "color": "#93c5fd",
    "constellation": "Vela",
    "isAnchor": false
  },
  {
    "id": "star-field-83",
    "name": "HD 117892",
    "ra": 327.676,
    "dec": -26.28,
    "mag": 6.77,
    "color": "#f87171",
    "constellation": "Capricornus",
    "isAnchor": false
  },
  {
    "id": "star-field-84",
    "name": "HD 71938",
    "ra": 174.975,
    "dec": -8.477,
    "mag": 6.63,
    "color": "#fef9c3",
    "constellation": "Pisces",
    "isAnchor": false
  },
  {
    "id": "star-field-85",
    "name": "Can 14",
    "ra": 291.142,
    "dec": -44.668,
    "mag": 4.69,
    "color": "#93c5fd",
    "constellation": "Canis Minor",
    "isAnchor": false
  },
  {
    "id": "star-field-86",
    "name": "HD 213591",
    "ra": 106.328,
    "dec": -58.559,
    "mag": 6.94,
    "color": "#ffffff",
    "constellation": "Corona Borealis",
    "isAnchor": false
  },
  {
    "id": "star-field-87",
    "name": "HD 43755",
    "ra": 162.294,
    "dec": 19.067,
    "mag": 6.79,
    "color": "#fef9c3",
    "constellation": "Cassiopeia",
    "isAnchor": false
  },
  {
    "id": "star-field-88",
    "name": "HD 194552",
    "ra": 27.905,
    "dec": -72.323,
    "mag": 6.24,
    "color": "#93c5fd",
    "constellation": "Perseus",
    "isAnchor": false
  },
  {
    "id": "star-field-89",
    "name": "HD 102986",
    "ra": 114.855,
    "dec": 23.985,
    "mag": 4.98,
    "color": "#fed7aa",
    "constellation": "Hydra",
    "isAnchor": false
  },
  {
    "id": "star-field-90",
    "name": "HD 92122",
    "ra": 244.16,
    "dec": -80.363,
    "mag": 6.72,
    "color": "#fed7aa",
    "constellation": "Cygnus",
    "isAnchor": false
  },
  {
    "id": "star-field-91",
    "name": "Cor 60",
    "ra": 222.069,
    "dec": 20.631,
    "mag": 3.87,
    "color": "#93c5fd",
    "constellation": "Corvus",
    "isAnchor": false
  },
  {
    "id": "star-field-92",
    "name": "HD 189800",
    "ra": 317.925,
    "dec": -61.669,
    "mag": 5.74,
    "color": "#f8fafc",
    "constellation": "Orion",
    "isAnchor": false
  },
  {
    "id": "star-field-93",
    "name": "Cra 44",
    "ra": 172.54,
    "dec": 39.103,
    "mag": 4.74,
    "color": "#f8fafc",
    "constellation": "Crater",
    "isAnchor": false
  },
  {
    "id": "star-field-94",
    "name": "HD 112967",
    "ra": 115.025,
    "dec": 81.094,
    "mag": 6.71,
    "color": "#f87171",
    "constellation": "Carina",
    "isAnchor": false
  },
  {
    "id": "star-field-95",
    "name": "Aqu 33",
    "ra": 175.684,
    "dec": -1.758,
    "mag": 4.71,
    "color": "#fed7aa",
    "constellation": "Aquila",
    "isAnchor": false
  },
  {
    "id": "star-field-96",
    "name": "HD 20301",
    "ra": 124.909,
    "dec": 34.215,
    "mag": 6.99,
    "color": "#ffffff",
    "constellation": "Pegasus",
    "isAnchor": false
  },
  {
    "id": "star-field-97",
    "name": "HD 189757",
    "ra": 90.656,
    "dec": 28.526,
    "mag": 5,
    "color": "#93c5fd",
    "constellation": "Monoceros",
    "isAnchor": false
  },
  {
    "id": "star-field-98",
    "name": "HD 205711",
    "ra": 12.8,
    "dec": -74.13,
    "mag": 6.92,
    "color": "#ffffff",
    "constellation": "Hercules",
    "isAnchor": false
  },
  {
    "id": "star-field-99",
    "name": "HD 95065",
    "ra": 77.213,
    "dec": -2.226,
    "mag": 6.95,
    "color": "#fed7aa",
    "constellation": "Perseus",
    "isAnchor": false
  },
  {
    "id": "star-field-100",
    "name": "HD 205758",
    "ra": 204.842,
    "dec": -62.812,
    "mag": 5.35,
    "color": "#fed7aa",
    "constellation": "Pisces",
    "isAnchor": false
  },
  {
    "id": "star-field-101",
    "name": "Urs 78",
    "ra": 284.731,
    "dec": 4.475,
    "mag": 4.05,
    "color": "#f8fafc",
    "constellation": "Ursa Minor",
    "isAnchor": false
  },
  {
    "id": "star-field-102",
    "name": "HD 45283",
    "ra": 157.13,
    "dec": -4.838,
    "mag": 5.66,
    "color": "#ffffff",
    "constellation": "Sculptor",
    "isAnchor": false
  },
  {
    "id": "star-field-103",
    "name": "Pyx 28",
    "ra": 352.924,
    "dec": -45,
    "mag": 4.22,
    "color": "#f8fafc",
    "constellation": "Pyxis",
    "isAnchor": false
  },
  {
    "id": "star-field-104",
    "name": "Lyr 57",
    "ra": 342.368,
    "dec": 59.28,
    "mag": 4.57,
    "color": "#f8fafc",
    "constellation": "Lyra",
    "isAnchor": false
  },
  {
    "id": "star-field-105",
    "name": "Lib 14",
    "ra": 151.877,
    "dec": 85.497,
    "mag": 4.69,
    "color": "#93c5fd",
    "constellation": "Libra",
    "isAnchor": false
  },
  {
    "id": "star-field-106",
    "name": "Sag 24",
    "ra": 324.409,
    "dec": -58.316,
    "mag": 3.71,
    "color": "#fed7aa",
    "constellation": "Sagittarius",
    "isAnchor": false
  },
  {
    "id": "star-field-107",
    "name": "HD 139375",
    "ra": 337.053,
    "dec": -29.904,
    "mag": 6.73,
    "color": "#ffffff",
    "constellation": "Delphinus",
    "isAnchor": false
  },
  {
    "id": "star-field-108",
    "name": "HD 14087",
    "ra": 255.982,
    "dec": 47.778,
    "mag": 6.99,
    "color": "#fed7aa",
    "constellation": "Lupus",
    "isAnchor": false
  },
  {
    "id": "star-field-109",
    "name": "HD 106637",
    "ra": 251.645,
    "dec": -78.907,
    "mag": 5.54,
    "color": "#f8fafc",
    "constellation": "Libra",
    "isAnchor": false
  },
  {
    "id": "star-field-110",
    "name": "HD 156793",
    "ra": 246.394,
    "dec": -86.202,
    "mag": 6.16,
    "color": "#ffffff",
    "constellation": "Aries",
    "isAnchor": false
  },
  {
    "id": "star-field-111",
    "name": "Her 66",
    "ra": 64.75,
    "dec": -47.377,
    "mag": 3.95,
    "color": "#ffffff",
    "constellation": "Hercules",
    "isAnchor": false
  },
  {
    "id": "star-field-112",
    "name": "HD 113568",
    "ra": 195.814,
    "dec": -17.009,
    "mag": 5.67,
    "color": "#fef9c3",
    "constellation": "Cancer",
    "isAnchor": false
  },
  {
    "id": "star-field-113",
    "name": "HD 160088",
    "ra": 278.915,
    "dec": -30.715,
    "mag": 6.82,
    "color": "#93c5fd",
    "constellation": "Delphinus",
    "isAnchor": false
  },
  {
    "id": "star-field-114",
    "name": "HD 120497",
    "ra": 262.021,
    "dec": -0.15,
    "mag": 5.2,
    "color": "#f8fafc",
    "constellation": "Equuleus",
    "isAnchor": false
  },
  {
    "id": "star-field-115",
    "name": "Gru 38",
    "ra": 288.922,
    "dec": -56.556,
    "mag": 4.55,
    "color": "#fef9c3",
    "constellation": "Grus",
    "isAnchor": false
  },
  {
    "id": "star-field-116",
    "name": "HD 112529",
    "ra": 206.745,
    "dec": -64.589,
    "mag": 6.56,
    "color": "#fef9c3",
    "constellation": "Hercules",
    "isAnchor": false
  },
  {
    "id": "star-field-117",
    "name": "Pic 9",
    "ra": 318.26,
    "dec": 26.917,
    "mag": 4.63,
    "color": "#f8fafc",
    "constellation": "Pictor",
    "isAnchor": false
  },
  {
    "id": "star-field-118",
    "name": "HD 14687",
    "ra": 206.396,
    "dec": -3.563,
    "mag": 6.52,
    "color": "#93c5fd",
    "constellation": "Cancer",
    "isAnchor": false
  },
  {
    "id": "star-field-119",
    "name": "HD 52939",
    "ra": 259.748,
    "dec": -26.144,
    "mag": 5.92,
    "color": "#fed7aa",
    "constellation": "Auriga",
    "isAnchor": false
  },
  {
    "id": "star-field-120",
    "name": "HD 77309",
    "ra": 67.409,
    "dec": 64.74,
    "mag": 6.56,
    "color": "#fef08a",
    "constellation": "Cepheus",
    "isAnchor": false
  },
  {
    "id": "star-field-121",
    "name": "HD 101114",
    "ra": 268.004,
    "dec": 39.073,
    "mag": 5.42,
    "color": "#fef9c3",
    "constellation": "Pictor",
    "isAnchor": false
  },
  {
    "id": "star-field-122",
    "name": "HD 40980",
    "ra": 341.741,
    "dec": 15.89,
    "mag": 5.56,
    "color": "#f8fafc",
    "constellation": "Cygnus",
    "isAnchor": false
  },
  {
    "id": "star-field-123",
    "name": "HD 21817",
    "ra": 159.561,
    "dec": 31.92,
    "mag": 6.79,
    "color": "#fed7aa",
    "constellation": "Vulpecula",
    "isAnchor": false
  },
  {
    "id": "star-field-124",
    "name": "HD 227345",
    "ra": 357.005,
    "dec": 4.969,
    "mag": 6.36,
    "color": "#f87171",
    "constellation": "Aquila",
    "isAnchor": false
  },
  {
    "id": "star-field-125",
    "name": "HD 78586",
    "ra": 80.964,
    "dec": 16.043,
    "mag": 6.58,
    "color": "#f87171",
    "constellation": "Leo",
    "isAnchor": false
  },
  {
    "id": "star-field-126",
    "name": "Leo 30",
    "ra": 295.76,
    "dec": -16.128,
    "mag": 3.89,
    "color": "#93c5fd",
    "constellation": "Leo",
    "isAnchor": false
  },
  {
    "id": "star-field-127",
    "name": "Hyd 29",
    "ra": 96.632,
    "dec": 3.044,
    "mag": 4.44,
    "color": "#93c5fd",
    "constellation": "Hydra",
    "isAnchor": false
  },
  {
    "id": "star-field-128",
    "name": "HD 130142",
    "ra": 23.708,
    "dec": -23.174,
    "mag": 4.93,
    "color": "#93c5fd",
    "constellation": "Aquarius",
    "isAnchor": false
  },
  {
    "id": "star-field-129",
    "name": "HD 76592",
    "ra": 42.324,
    "dec": -77.234,
    "mag": 6.63,
    "color": "#f87171",
    "constellation": "Triangulum",
    "isAnchor": false
  },
  {
    "id": "star-field-130",
    "name": "HD 110207",
    "ra": 93.266,
    "dec": -23.754,
    "mag": 6.74,
    "color": "#f8fafc",
    "constellation": "Grus",
    "isAnchor": false
  },
  {
    "id": "star-field-131",
    "name": "HD 204957",
    "ra": 357.43,
    "dec": -35,
    "mag": 5.04,
    "color": "#fed7aa",
    "constellation": "Draco",
    "isAnchor": false
  },
  {
    "id": "star-field-132",
    "name": "HD 63968",
    "ra": 257.883,
    "dec": 19.748,
    "mag": 5.44,
    "color": "#ffffff",
    "constellation": "Libra",
    "isAnchor": false
  },
  {
    "id": "star-field-133",
    "name": "Cra 46",
    "ra": 116.434,
    "dec": -42.286,
    "mag": 4.34,
    "color": "#93c5fd",
    "constellation": "Crater",
    "isAnchor": false
  },
  {
    "id": "star-field-134",
    "name": "HD 69451",
    "ra": 258.308,
    "dec": 21.243,
    "mag": 6.93,
    "color": "#93c5fd",
    "constellation": "Lacerta",
    "isAnchor": false
  },
  {
    "id": "star-field-135",
    "name": "HD 34780",
    "ra": 318.739,
    "dec": 22.601,
    "mag": 4.93,
    "color": "#fed7aa",
    "constellation": "Grus",
    "isAnchor": false
  },
  {
    "id": "star-field-136",
    "name": "HD 89396",
    "ra": 201.294,
    "dec": 14.552,
    "mag": 5.6,
    "color": "#fed7aa",
    "constellation": "Cygnus",
    "isAnchor": false
  },
  {
    "id": "star-field-137",
    "name": "Ari 66",
    "ra": 246.473,
    "dec": -10.362,
    "mag": 4.51,
    "color": "#93c5fd",
    "constellation": "Aries",
    "isAnchor": false
  },
  {
    "id": "star-field-138",
    "name": "Car 37",
    "ra": 267.833,
    "dec": -66.369,
    "mag": 3.65,
    "color": "#fef9c3",
    "constellation": "Carina",
    "isAnchor": false
  },
  {
    "id": "star-field-139",
    "name": "HD 169679",
    "ra": 162.066,
    "dec": 26.49,
    "mag": 6.86,
    "color": "#fed7aa",
    "constellation": "Lepus",
    "isAnchor": false
  },
  {
    "id": "star-field-140",
    "name": "Boö 74",
    "ra": 264.209,
    "dec": -61.71,
    "mag": 4.65,
    "color": "#f87171",
    "constellation": "Boötes",
    "isAnchor": false
  },
  {
    "id": "star-field-141",
    "name": "HD 77155",
    "ra": 315.136,
    "dec": -36.85,
    "mag": 6.66,
    "color": "#fed7aa",
    "constellation": "Corona Borealis",
    "isAnchor": false
  },
  {
    "id": "star-field-142",
    "name": "HD 13461",
    "ra": 25.385,
    "dec": -17.373,
    "mag": 5.11,
    "color": "#fef08a",
    "constellation": "Draco",
    "isAnchor": false
  },
  {
    "id": "star-field-143",
    "name": "HD 30293",
    "ra": 3.415,
    "dec": -26.685,
    "mag": 6.97,
    "color": "#f8fafc",
    "constellation": "Virgo",
    "isAnchor": false
  },
  {
    "id": "star-field-144",
    "name": "Cor 35",
    "ra": 347.378,
    "dec": 2.331,
    "mag": 3.58,
    "color": "#93c5fd",
    "constellation": "Corona Borealis",
    "isAnchor": false
  },
  {
    "id": "star-field-145",
    "name": "HD 221407",
    "ra": 342.903,
    "dec": 68.007,
    "mag": 6.37,
    "color": "#f8fafc",
    "constellation": "Pavo",
    "isAnchor": false
  },
  {
    "id": "star-field-146",
    "name": "Her 22",
    "ra": 72.165,
    "dec": -12.886,
    "mag": 4.58,
    "color": "#fef9c3",
    "constellation": "Hercules",
    "isAnchor": false
  },
  {
    "id": "star-field-147",
    "name": "HD 60918",
    "ra": 68.197,
    "dec": 50.022,
    "mag": 6.59,
    "color": "#ffffff",
    "constellation": "Fornax",
    "isAnchor": false
  },
  {
    "id": "star-field-148",
    "name": "HD 116813",
    "ra": 221.484,
    "dec": -19.396,
    "mag": 6.78,
    "color": "#93c5fd",
    "constellation": "Puppis",
    "isAnchor": false
  },
  {
    "id": "star-field-149",
    "name": "Tau 44",
    "ra": 12.915,
    "dec": -65.012,
    "mag": 4.47,
    "color": "#93c5fd",
    "constellation": "Taurus",
    "isAnchor": false
  },
  {
    "id": "star-field-150",
    "name": "HD 152850",
    "ra": 321.215,
    "dec": 7.738,
    "mag": 5.68,
    "color": "#fed7aa",
    "constellation": "Lepus",
    "isAnchor": false
  },
  {
    "id": "star-field-151",
    "name": "HD 12867",
    "ra": 290.349,
    "dec": 17.978,
    "mag": 6.43,
    "color": "#f8fafc",
    "constellation": "Draco",
    "isAnchor": false
  },
  {
    "id": "star-field-152",
    "name": "Car 6",
    "ra": 62.623,
    "dec": -1.428,
    "mag": 3.93,
    "color": "#fef9c3",
    "constellation": "Carina",
    "isAnchor": false
  },
  {
    "id": "star-field-153",
    "name": "HD 96981",
    "ra": 264.981,
    "dec": -17.019,
    "mag": 6.18,
    "color": "#fef9c3",
    "constellation": "Grus",
    "isAnchor": false
  },
  {
    "id": "star-field-154",
    "name": "HD 38360",
    "ra": 149.246,
    "dec": -47.522,
    "mag": 6.66,
    "color": "#fef08a",
    "constellation": "Pavo",
    "isAnchor": false
  },
  {
    "id": "star-field-155",
    "name": "HD 134219",
    "ra": 199.392,
    "dec": -43.226,
    "mag": 6.12,
    "color": "#f8fafc",
    "constellation": "Sagitta",
    "isAnchor": false
  },
  {
    "id": "star-field-156",
    "name": "HD 56596",
    "ra": 220.908,
    "dec": -20.142,
    "mag": 6.15,
    "color": "#fef9c3",
    "constellation": "Ursa Major",
    "isAnchor": false
  },
  {
    "id": "star-field-157",
    "name": "HD 25604",
    "ra": 58.686,
    "dec": -37.896,
    "mag": 6.08,
    "color": "#fef08a",
    "constellation": "Cassiopeia",
    "isAnchor": false
  },
  {
    "id": "star-field-158",
    "name": "HD 146004",
    "ra": 110.864,
    "dec": -31.05,
    "mag": 4.95,
    "color": "#93c5fd",
    "constellation": "Hydra",
    "isAnchor": false
  },
  {
    "id": "star-field-159",
    "name": "HD 127527",
    "ra": 12.641,
    "dec": -68.681,
    "mag": 6.1,
    "color": "#f8fafc",
    "constellation": "Taurus",
    "isAnchor": false
  },
  {
    "id": "star-field-160",
    "name": "Gem 57",
    "ra": 108.1,
    "dec": 4.621,
    "mag": 4.51,
    "color": "#ffffff",
    "constellation": "Gemini",
    "isAnchor": false
  },
  {
    "id": "star-field-161",
    "name": "HD 125775",
    "ra": 318.007,
    "dec": 11.194,
    "mag": 6.79,
    "color": "#ffffff",
    "constellation": "Perseus",
    "isAnchor": false
  },
  {
    "id": "star-field-162",
    "name": "HD 227239",
    "ra": 66.045,
    "dec": -15.407,
    "mag": 6.82,
    "color": "#fef9c3",
    "constellation": "Volans",
    "isAnchor": false
  },
  {
    "id": "star-field-163",
    "name": "HD 112398",
    "ra": 317.945,
    "dec": -46.698,
    "mag": 6.82,
    "color": "#fed7aa",
    "constellation": "Gemini",
    "isAnchor": false
  },
  {
    "id": "star-field-164",
    "name": "HD 121873",
    "ra": 61.213,
    "dec": 4.877,
    "mag": 6.77,
    "color": "#fef08a",
    "constellation": "Serpens",
    "isAnchor": false
  },
  {
    "id": "star-field-165",
    "name": "Cra 80",
    "ra": 66.999,
    "dec": 40.501,
    "mag": 3.74,
    "color": "#93c5fd",
    "constellation": "Crater",
    "isAnchor": false
  },
  {
    "id": "star-field-166",
    "name": "Sag 8",
    "ra": 224.237,
    "dec": -18.308,
    "mag": 4.1,
    "color": "#93c5fd",
    "constellation": "Sagittarius",
    "isAnchor": false
  },
  {
    "id": "star-field-167",
    "name": "HD 180328",
    "ra": 63.37,
    "dec": -2.446,
    "mag": 6.85,
    "color": "#ffffff",
    "constellation": "Corona Borealis",
    "isAnchor": false
  },
  {
    "id": "star-field-168",
    "name": "HD 156000",
    "ra": 237.34,
    "dec": 56.646,
    "mag": 5.16,
    "color": "#93c5fd",
    "constellation": "Vulpecula",
    "isAnchor": false
  },
  {
    "id": "star-field-169",
    "name": "HD 186832",
    "ra": 196.734,
    "dec": -36.896,
    "mag": 4.82,
    "color": "#fef08a",
    "constellation": "Cassiopeia",
    "isAnchor": false
  },
  {
    "id": "star-field-170",
    "name": "HD 119947",
    "ra": 156.325,
    "dec": -54.026,
    "mag": 6.94,
    "color": "#f8fafc",
    "constellation": "Crater",
    "isAnchor": false
  },
  {
    "id": "star-field-171",
    "name": "HD 49679",
    "ra": 220.19,
    "dec": 46.986,
    "mag": 6.46,
    "color": "#f87171",
    "constellation": "Perseus",
    "isAnchor": false
  },
  {
    "id": "star-field-172",
    "name": "HD 133201",
    "ra": 296.485,
    "dec": -5.615,
    "mag": 5.52,
    "color": "#f8fafc",
    "constellation": "Draco",
    "isAnchor": false
  },
  {
    "id": "star-field-173",
    "name": "HD 79903",
    "ra": 343.619,
    "dec": 23.087,
    "mag": 5.61,
    "color": "#93c5fd",
    "constellation": "Fornax",
    "isAnchor": false
  },
  {
    "id": "star-field-174",
    "name": "HD 198996",
    "ra": 179.116,
    "dec": 28.131,
    "mag": 5.64,
    "color": "#fef9c3",
    "constellation": "Grus",
    "isAnchor": false
  },
  {
    "id": "star-field-175",
    "name": "HD 26291",
    "ra": 138.954,
    "dec": -0.62,
    "mag": 6.67,
    "color": "#fed7aa",
    "constellation": "Hydra",
    "isAnchor": false
  },
  {
    "id": "star-field-176",
    "name": "HD 226336",
    "ra": 125.702,
    "dec": 20.916,
    "mag": 6.56,
    "color": "#fef08a",
    "constellation": "Volans",
    "isAnchor": false
  },
  {
    "id": "star-field-177",
    "name": "HD 192727",
    "ra": 299.797,
    "dec": 12.029,
    "mag": 5.96,
    "color": "#fef9c3",
    "constellation": "Equuleus",
    "isAnchor": false
  },
  {
    "id": "star-field-178",
    "name": "HD 43928",
    "ra": 267.121,
    "dec": 38.123,
    "mag": 4.98,
    "color": "#fef9c3",
    "constellation": "Lynx",
    "isAnchor": false
  },
  {
    "id": "star-field-179",
    "name": "Lib 2",
    "ra": 140.232,
    "dec": 18.183,
    "mag": 4.76,
    "color": "#fef08a",
    "constellation": "Libra",
    "isAnchor": false
  },
  {
    "id": "star-field-180",
    "name": "HD 159898",
    "ra": 9.825,
    "dec": -28.631,
    "mag": 6.46,
    "color": "#fef9c3",
    "constellation": "Triangulum",
    "isAnchor": false
  },
  {
    "id": "star-field-181",
    "name": "Peg 13",
    "ra": 349.604,
    "dec": -43.265,
    "mag": 4.33,
    "color": "#fed7aa",
    "constellation": "Pegasus",
    "isAnchor": false
  },
  {
    "id": "star-field-182",
    "name": "Scu 2",
    "ra": 101.873,
    "dec": -23.745,
    "mag": 4.76,
    "color": "#fef9c3",
    "constellation": "Sculptor",
    "isAnchor": false
  },
  {
    "id": "star-field-183",
    "name": "HD 210529",
    "ra": 75.804,
    "dec": -29.748,
    "mag": 6.67,
    "color": "#fed7aa",
    "constellation": "Capricornus",
    "isAnchor": false
  },
  {
    "id": "star-field-184",
    "name": "HD 208303",
    "ra": 114.354,
    "dec": 5.023,
    "mag": 6.66,
    "color": "#fef9c3",
    "constellation": "Taurus",
    "isAnchor": false
  },
  {
    "id": "star-field-185",
    "name": "HD 141911",
    "ra": 111.743,
    "dec": 24.058,
    "mag": 4.95,
    "color": "#f8fafc",
    "constellation": "Phoenix",
    "isAnchor": false
  },
  {
    "id": "star-field-186",
    "name": "HD 229681",
    "ra": 276.16,
    "dec": 25.805,
    "mag": 6.09,
    "color": "#fef08a",
    "constellation": "Ursa Minor",
    "isAnchor": false
  },
  {
    "id": "star-field-187",
    "name": "Cru 3",
    "ra": 211.096,
    "dec": 26.986,
    "mag": 4.69,
    "color": "#f87171",
    "constellation": "Crux",
    "isAnchor": false
  },
  {
    "id": "star-field-188",
    "name": "HD 152257",
    "ra": 245.012,
    "dec": -4.45,
    "mag": 6.86,
    "color": "#f8fafc",
    "constellation": "Triangulum",
    "isAnchor": false
  },
  {
    "id": "star-field-189",
    "name": "HD 191260",
    "ra": 213.319,
    "dec": 4.867,
    "mag": 6.42,
    "color": "#93c5fd",
    "constellation": "Cepheus",
    "isAnchor": false
  },
  {
    "id": "star-field-190",
    "name": "HD 65923",
    "ra": 11.555,
    "dec": 33.304,
    "mag": 6.74,
    "color": "#f8fafc",
    "constellation": "Scorpius",
    "isAnchor": false
  },
  {
    "id": "star-field-191",
    "name": "HD 33423",
    "ra": 298.663,
    "dec": -80.95,
    "mag": 6.99,
    "color": "#f87171",
    "constellation": "Lacerta",
    "isAnchor": false
  },
  {
    "id": "star-field-192",
    "name": "Mon 21",
    "ra": 94.5,
    "dec": -49.405,
    "mag": 4.53,
    "color": "#f87171",
    "constellation": "Monoceros",
    "isAnchor": false
  },
  {
    "id": "star-field-193",
    "name": "HD 140454",
    "ra": 147.531,
    "dec": 1.348,
    "mag": 6.97,
    "color": "#ffffff",
    "constellation": "Pisces",
    "isAnchor": false
  },
  {
    "id": "star-field-194",
    "name": "HD 178794",
    "ra": 253.816,
    "dec": -27.345,
    "mag": 6.73,
    "color": "#f8fafc",
    "constellation": "Lepus",
    "isAnchor": false
  },
  {
    "id": "star-field-195",
    "name": "HD 140262",
    "ra": 137.053,
    "dec": 42.965,
    "mag": 6.16,
    "color": "#ffffff",
    "constellation": "Crater",
    "isAnchor": false
  },
  {
    "id": "star-field-196",
    "name": "HD 86323",
    "ra": 80.758,
    "dec": -4.338,
    "mag": 6.56,
    "color": "#f8fafc",
    "constellation": "Volans",
    "isAnchor": false
  },
  {
    "id": "star-field-197",
    "name": "HD 134021",
    "ra": 259.703,
    "dec": 39.334,
    "mag": 6.57,
    "color": "#93c5fd",
    "constellation": "Crux",
    "isAnchor": false
  },
  {
    "id": "star-field-198",
    "name": "HD 177049",
    "ra": 231.427,
    "dec": -38.267,
    "mag": 5.2,
    "color": "#fed7aa",
    "constellation": "Crater",
    "isAnchor": false
  },
  {
    "id": "star-field-199",
    "name": "HD 204201",
    "ra": 50.144,
    "dec": 67.743,
    "mag": 6.26,
    "color": "#93c5fd",
    "constellation": "Monoceros",
    "isAnchor": false
  },
  {
    "id": "star-field-200",
    "name": "HD 17264",
    "ra": 354.585,
    "dec": 18.01,
    "mag": 5.33,
    "color": "#f8fafc",
    "constellation": "Volans",
    "isAnchor": false
  },
  {
    "id": "star-field-201",
    "name": "HD 117085",
    "ra": 280.485,
    "dec": 52.549,
    "mag": 6.6,
    "color": "#fef08a",
    "constellation": "Corvus",
    "isAnchor": false
  },
  {
    "id": "star-field-202",
    "name": "Dra 1",
    "ra": 197.762,
    "dec": -34.36,
    "mag": 3.75,
    "color": "#f8fafc",
    "constellation": "Draco",
    "isAnchor": false
  },
  {
    "id": "star-field-203",
    "name": "HD 124267",
    "ra": 20.1,
    "dec": -15.443,
    "mag": 5.93,
    "color": "#fef9c3",
    "constellation": "Hydra",
    "isAnchor": false
  },
  {
    "id": "star-field-204",
    "name": "HD 69561",
    "ra": 204.373,
    "dec": -1.873,
    "mag": 6.99,
    "color": "#fed7aa",
    "constellation": "Eridanus",
    "isAnchor": false
  },
  {
    "id": "star-field-205",
    "name": "HD 64019",
    "ra": 233.368,
    "dec": -4.236,
    "mag": 5.02,
    "color": "#fef9c3",
    "constellation": "Cepheus",
    "isAnchor": false
  },
  {
    "id": "star-field-206",
    "name": "HD 188174",
    "ra": 141.557,
    "dec": -83.934,
    "mag": 6.89,
    "color": "#ffffff",
    "constellation": "Phoenix",
    "isAnchor": false
  },
  {
    "id": "star-field-207",
    "name": "Sag 13",
    "ra": 160.773,
    "dec": 4.769,
    "mag": 4.75,
    "color": "#93c5fd",
    "constellation": "Sagittarius",
    "isAnchor": false
  },
  {
    "id": "star-field-208",
    "name": "HD 157140",
    "ra": 157.789,
    "dec": -16.15,
    "mag": 5.61,
    "color": "#fef9c3",
    "constellation": "Cepheus",
    "isAnchor": false
  },
  {
    "id": "star-field-209",
    "name": "HD 108385",
    "ra": 333.268,
    "dec": 49.036,
    "mag": 5.17,
    "color": "#f87171",
    "constellation": "Grus",
    "isAnchor": false
  },
  {
    "id": "star-field-210",
    "name": "HD 144911",
    "ra": 205.345,
    "dec": -3.271,
    "mag": 6.93,
    "color": "#fed7aa",
    "constellation": "Lupus",
    "isAnchor": false
  },
  {
    "id": "star-field-211",
    "name": "HD 81998",
    "ra": 19.813,
    "dec": -4.141,
    "mag": 6.01,
    "color": "#f8fafc",
    "constellation": "Fornax",
    "isAnchor": false
  },
  {
    "id": "star-field-212",
    "name": "HD 127022",
    "ra": 284.77,
    "dec": -23.795,
    "mag": 6.9,
    "color": "#fef08a",
    "constellation": "Cetus",
    "isAnchor": false
  },
  {
    "id": "star-field-213",
    "name": "Equ 24",
    "ra": 17.725,
    "dec": -78.753,
    "mag": 3.63,
    "color": "#fef08a",
    "constellation": "Equuleus",
    "isAnchor": false
  },
  {
    "id": "star-field-214",
    "name": "HD 50622",
    "ra": 130.735,
    "dec": 31.277,
    "mag": 6.01,
    "color": "#fed7aa",
    "constellation": "Eridanus",
    "isAnchor": false
  },
  {
    "id": "star-field-215",
    "name": "Tri 17",
    "ra": 63.361,
    "dec": -17.844,
    "mag": 3.98,
    "color": "#93c5fd",
    "constellation": "Triangulum",
    "isAnchor": false
  },
  {
    "id": "star-field-216",
    "name": "HD 105226",
    "ra": 222.172,
    "dec": -72.52,
    "mag": 6.64,
    "color": "#ffffff",
    "constellation": "Carina",
    "isAnchor": false
  },
  {
    "id": "star-field-217",
    "name": "Leo 21",
    "ra": 313.161,
    "dec": 42.104,
    "mag": 4.1,
    "color": "#93c5fd",
    "constellation": "Leo",
    "isAnchor": false
  },
  {
    "id": "star-field-218",
    "name": "Pis 36",
    "ra": 253.741,
    "dec": -70.702,
    "mag": 4.74,
    "color": "#ffffff",
    "constellation": "Pisces",
    "isAnchor": false
  },
  {
    "id": "star-field-219",
    "name": "HD 176380",
    "ra": 268.212,
    "dec": -56.294,
    "mag": 5.06,
    "color": "#93c5fd",
    "constellation": "Canis Minor",
    "isAnchor": false
  },
  {
    "id": "star-field-220",
    "name": "HD 201869",
    "ra": 280.46,
    "dec": 83.957,
    "mag": 6.11,
    "color": "#fef08a",
    "constellation": "Lyra",
    "isAnchor": false
  },
  {
    "id": "star-field-221",
    "name": "HD 181012",
    "ra": 86.098,
    "dec": -51.065,
    "mag": 5.52,
    "color": "#f87171",
    "constellation": "Lupus",
    "isAnchor": false
  },
  {
    "id": "star-field-222",
    "name": "HD 31636",
    "ra": 331.543,
    "dec": -44.612,
    "mag": 5.66,
    "color": "#f8fafc",
    "constellation": "Cassiopeia",
    "isAnchor": false
  },
  {
    "id": "star-field-223",
    "name": "HD 63446",
    "ra": 94.197,
    "dec": 0.095,
    "mag": 5.46,
    "color": "#fef08a",
    "constellation": "Pictor",
    "isAnchor": false
  },
  {
    "id": "star-field-224",
    "name": "Tri 38",
    "ra": 126.391,
    "dec": 6.966,
    "mag": 4.7,
    "color": "#fef08a",
    "constellation": "Triangulum",
    "isAnchor": false
  },
  {
    "id": "star-field-225",
    "name": "HD 53353",
    "ra": 285.399,
    "dec": -4.624,
    "mag": 4.87,
    "color": "#93c5fd",
    "constellation": "Sagittarius",
    "isAnchor": false
  },
  {
    "id": "star-field-226",
    "name": "HD 20822",
    "ra": 7.213,
    "dec": -8.39,
    "mag": 6.6,
    "color": "#fed7aa",
    "constellation": "Cassiopeia",
    "isAnchor": false
  },
  {
    "id": "star-field-227",
    "name": "HD 157903",
    "ra": 249.441,
    "dec": 33.183,
    "mag": 6.74,
    "color": "#ffffff",
    "constellation": "Lupus",
    "isAnchor": false
  },
  {
    "id": "star-field-228",
    "name": "Mon 8",
    "ra": 5.196,
    "dec": -33.529,
    "mag": 3.64,
    "color": "#f87171",
    "constellation": "Monoceros",
    "isAnchor": false
  },
  {
    "id": "star-field-229",
    "name": "HD 49673",
    "ra": 115.317,
    "dec": 12.39,
    "mag": 6.1,
    "color": "#f87171",
    "constellation": "Eridanus",
    "isAnchor": false
  },
  {
    "id": "star-field-230",
    "name": "HD 137951",
    "ra": 49.824,
    "dec": -72.689,
    "mag": 5.22,
    "color": "#f8fafc",
    "constellation": "Carina",
    "isAnchor": false
  },
  {
    "id": "star-field-231",
    "name": "HD 99235",
    "ra": 293.364,
    "dec": 68.918,
    "mag": 6.72,
    "color": "#fef9c3",
    "constellation": "Fornax",
    "isAnchor": false
  },
  {
    "id": "star-field-232",
    "name": "HD 55873",
    "ra": 300.224,
    "dec": 24.426,
    "mag": 6.95,
    "color": "#ffffff",
    "constellation": "Aquarius",
    "isAnchor": false
  },
  {
    "id": "star-field-233",
    "name": "HD 68168",
    "ra": 159.637,
    "dec": -12.299,
    "mag": 6.77,
    "color": "#f8fafc",
    "constellation": "Phoenix",
    "isAnchor": false
  },
  {
    "id": "star-field-234",
    "name": "HD 73426",
    "ra": 24.011,
    "dec": 33.529,
    "mag": 6.7,
    "color": "#fef08a",
    "constellation": "Corona Borealis",
    "isAnchor": false
  },
  {
    "id": "star-field-235",
    "name": "HD 122979",
    "ra": 280.317,
    "dec": 15.623,
    "mag": 6.62,
    "color": "#f87171",
    "constellation": "Corvus",
    "isAnchor": false
  },
  {
    "id": "star-field-236",
    "name": "HD 63710",
    "ra": 232.914,
    "dec": 16.234,
    "mag": 6.53,
    "color": "#ffffff",
    "constellation": "Hydra",
    "isAnchor": false
  },
  {
    "id": "star-field-237",
    "name": "HD 157947",
    "ra": 356.371,
    "dec": -12.814,
    "mag": 6.58,
    "color": "#93c5fd",
    "constellation": "Lupus",
    "isAnchor": false
  },
  {
    "id": "star-field-238",
    "name": "Urs 22",
    "ra": 260.752,
    "dec": -28.781,
    "mag": 4.21,
    "color": "#f8fafc",
    "constellation": "Ursa Minor",
    "isAnchor": false
  },
  {
    "id": "star-field-239",
    "name": "HD 98473",
    "ra": 351.899,
    "dec": 11.454,
    "mag": 5.95,
    "color": "#f8fafc",
    "constellation": "Cepheus",
    "isAnchor": false
  },
  {
    "id": "star-field-240",
    "name": "HD 189696",
    "ra": 86.363,
    "dec": 60.533,
    "mag": 5.21,
    "color": "#93c5fd",
    "constellation": "Gemini",
    "isAnchor": false
  },
  {
    "id": "star-field-241",
    "name": "HD 43374",
    "ra": 300.579,
    "dec": -19.896,
    "mag": 4.94,
    "color": "#ffffff",
    "constellation": "Crux",
    "isAnchor": false
  },
  {
    "id": "star-field-242",
    "name": "HD 36011",
    "ra": 223.063,
    "dec": -25.753,
    "mag": 4.88,
    "color": "#f87171",
    "constellation": "Pyxis",
    "isAnchor": false
  },
  {
    "id": "star-field-243",
    "name": "HD 111239",
    "ra": 240.967,
    "dec": -8.037,
    "mag": 5.14,
    "color": "#fed7aa",
    "constellation": "Lacerta",
    "isAnchor": false
  },
  {
    "id": "star-field-244",
    "name": "HD 98967",
    "ra": 212.406,
    "dec": -14.75,
    "mag": 6.91,
    "color": "#fed7aa",
    "constellation": "Dorado",
    "isAnchor": false
  },
  {
    "id": "star-field-245",
    "name": "HD 223101",
    "ra": 179.519,
    "dec": 58.339,
    "mag": 5.19,
    "color": "#f87171",
    "constellation": "Taurus",
    "isAnchor": false
  },
  {
    "id": "star-field-246",
    "name": "HD 182645",
    "ra": 14.913,
    "dec": -5.855,
    "mag": 5.55,
    "color": "#93c5fd",
    "constellation": "Aquila",
    "isAnchor": false
  },
  {
    "id": "star-field-247",
    "name": "HD 155689",
    "ra": 32.474,
    "dec": 0.441,
    "mag": 5.13,
    "color": "#f8fafc",
    "constellation": "Serpens",
    "isAnchor": false
  },
  {
    "id": "star-field-248",
    "name": "HD 178917",
    "ra": 263.199,
    "dec": 40.483,
    "mag": 5.09,
    "color": "#fef08a",
    "constellation": "Perseus",
    "isAnchor": false
  },
  {
    "id": "star-field-249",
    "name": "HD 162733",
    "ra": 225.555,
    "dec": 26.769,
    "mag": 5.72,
    "color": "#fed7aa",
    "constellation": "Pyxis",
    "isAnchor": false
  },
  {
    "id": "star-field-250",
    "name": "HD 166793",
    "ra": 319.07,
    "dec": -33.596,
    "mag": 5.02,
    "color": "#fef08a",
    "constellation": "Hercules",
    "isAnchor": false
  },
  {
    "id": "star-field-251",
    "name": "HD 151077",
    "ra": 155.247,
    "dec": -31.702,
    "mag": 6.98,
    "color": "#ffffff",
    "constellation": "Lynx",
    "isAnchor": false
  },
  {
    "id": "star-field-252",
    "name": "Oph 35",
    "ra": 63.201,
    "dec": -8.045,
    "mag": 4.36,
    "color": "#fef08a",
    "constellation": "Ophiuchus",
    "isAnchor": false
  },
  {
    "id": "star-field-253",
    "name": "Peg 47",
    "ra": 228.206,
    "dec": -36.836,
    "mag": 3.69,
    "color": "#fef08a",
    "constellation": "Pegasus",
    "isAnchor": false
  },
  {
    "id": "star-field-254",
    "name": "HD 113436",
    "ra": 120.241,
    "dec": 29.459,
    "mag": 5.97,
    "color": "#fef08a",
    "constellation": "Eridanus",
    "isAnchor": false
  },
  {
    "id": "star-field-255",
    "name": "HD 42959",
    "ra": 242.675,
    "dec": -16.105,
    "mag": 5.46,
    "color": "#ffffff",
    "constellation": "Corona Borealis",
    "isAnchor": false
  },
  {
    "id": "star-field-256",
    "name": "HD 31878",
    "ra": 284.686,
    "dec": -42.156,
    "mag": 6.85,
    "color": "#93c5fd",
    "constellation": "Cepheus",
    "isAnchor": false
  },
  {
    "id": "star-field-257",
    "name": "HD 172857",
    "ra": 35.801,
    "dec": 68.156,
    "mag": 5.27,
    "color": "#93c5fd",
    "constellation": "Virgo",
    "isAnchor": false
  },
  {
    "id": "star-field-258",
    "name": "Aur 41",
    "ra": 173.062,
    "dec": 64.005,
    "mag": 4.46,
    "color": "#f8fafc",
    "constellation": "Auriga",
    "isAnchor": false
  },
  {
    "id": "star-field-259",
    "name": "Tau 3",
    "ra": 44.237,
    "dec": 36.676,
    "mag": 4.61,
    "color": "#ffffff",
    "constellation": "Taurus",
    "isAnchor": false
  },
  {
    "id": "star-field-260",
    "name": "HD 160094",
    "ra": 330.84,
    "dec": -20.882,
    "mag": 5.19,
    "color": "#f87171",
    "constellation": "Corvus",
    "isAnchor": false
  },
  {
    "id": "star-field-261",
    "name": "HD 78399",
    "ra": 176.982,
    "dec": -42.609,
    "mag": 5.05,
    "color": "#f87171",
    "constellation": "Eridanus",
    "isAnchor": false
  },
  {
    "id": "star-field-262",
    "name": "HD 152760",
    "ra": 334.679,
    "dec": -4.235,
    "mag": 5.5,
    "color": "#f8fafc",
    "constellation": "Orion",
    "isAnchor": false
  },
  {
    "id": "star-field-263",
    "name": "HD 118746",
    "ra": 14.895,
    "dec": -79.394,
    "mag": 6.55,
    "color": "#f87171",
    "constellation": "Boötes",
    "isAnchor": false
  },
  {
    "id": "star-field-264",
    "name": "HD 121320",
    "ra": 294.724,
    "dec": 55.682,
    "mag": 6.12,
    "color": "#f8fafc",
    "constellation": "Puppis",
    "isAnchor": false
  },
  {
    "id": "star-field-265",
    "name": "HD 78026",
    "ra": 128.624,
    "dec": 80.683,
    "mag": 6.04,
    "color": "#fef08a",
    "constellation": "Pictor",
    "isAnchor": false
  },
  {
    "id": "star-field-266",
    "name": "HD 13051",
    "ra": 65.691,
    "dec": 51.19,
    "mag": 6.82,
    "color": "#fef9c3",
    "constellation": "Serpens",
    "isAnchor": false
  },
  {
    "id": "star-field-267",
    "name": "HD 97634",
    "ra": 109.885,
    "dec": -37.551,
    "mag": 6.59,
    "color": "#fed7aa",
    "constellation": "Auriga",
    "isAnchor": false
  },
  {
    "id": "star-field-268",
    "name": "HD 91744",
    "ra": 27.372,
    "dec": 25.367,
    "mag": 6.51,
    "color": "#fef9c3",
    "constellation": "Delphinus",
    "isAnchor": false
  },
  {
    "id": "star-field-269",
    "name": "HD 210542",
    "ra": 85.394,
    "dec": -51.878,
    "mag": 6.04,
    "color": "#f87171",
    "constellation": "Centaurus",
    "isAnchor": false
  },
  {
    "id": "star-field-270",
    "name": "HD 98037",
    "ra": 346.737,
    "dec": 36.645,
    "mag": 4.83,
    "color": "#93c5fd",
    "constellation": "Pyxis",
    "isAnchor": false
  },
  {
    "id": "star-field-271",
    "name": "Urs 53",
    "ra": 339.625,
    "dec": -4.952,
    "mag": 4.64,
    "color": "#fef9c3",
    "constellation": "Ursa Major",
    "isAnchor": false
  },
  {
    "id": "star-field-272",
    "name": "Boö 46",
    "ra": 252.438,
    "dec": -4.859,
    "mag": 4.33,
    "color": "#f87171",
    "constellation": "Boötes",
    "isAnchor": false
  },
  {
    "id": "star-field-273",
    "name": "Boö 2",
    "ra": 91.318,
    "dec": 6.071,
    "mag": 4.1,
    "color": "#ffffff",
    "constellation": "Boötes",
    "isAnchor": false
  },
  {
    "id": "star-field-274",
    "name": "Her 35",
    "ra": 350.216,
    "dec": -3.209,
    "mag": 4.69,
    "color": "#93c5fd",
    "constellation": "Hercules",
    "isAnchor": false
  },
  {
    "id": "star-field-275",
    "name": "HD 98784",
    "ra": 22.623,
    "dec": 38.744,
    "mag": 5.69,
    "color": "#fed7aa",
    "constellation": "Pisces",
    "isAnchor": false
  },
  {
    "id": "star-field-276",
    "name": "HD 211365",
    "ra": 175.905,
    "dec": -1.569,
    "mag": 5.43,
    "color": "#fef08a",
    "constellation": "Puppis",
    "isAnchor": false
  },
  {
    "id": "star-field-277",
    "name": "Urs 59",
    "ra": 201.102,
    "dec": 61.999,
    "mag": 3.74,
    "color": "#f8fafc",
    "constellation": "Ursa Minor",
    "isAnchor": false
  },
  {
    "id": "star-field-278",
    "name": "Tri 47",
    "ra": 356.504,
    "dec": 46.911,
    "mag": 4.45,
    "color": "#f8fafc",
    "constellation": "Triangulum",
    "isAnchor": false
  },
  {
    "id": "star-field-279",
    "name": "Tri 29",
    "ra": 35.178,
    "dec": -8.368,
    "mag": 4.7,
    "color": "#fef9c3",
    "constellation": "Triangulum",
    "isAnchor": false
  },
  {
    "id": "star-field-280",
    "name": "HD 134893",
    "ra": 241.743,
    "dec": 48.125,
    "mag": 6.05,
    "color": "#f8fafc",
    "constellation": "Sagittarius",
    "isAnchor": false
  },
  {
    "id": "star-field-281",
    "name": "HD 173020",
    "ra": 19.887,
    "dec": -20.525,
    "mag": 6.72,
    "color": "#f87171",
    "constellation": "Perseus",
    "isAnchor": false
  },
  {
    "id": "star-field-282",
    "name": "HD 147200",
    "ra": 204.089,
    "dec": 68.106,
    "mag": 5.67,
    "color": "#fed7aa",
    "constellation": "Leo",
    "isAnchor": false
  },
  {
    "id": "star-field-283",
    "name": "Cap 7",
    "ra": 206.804,
    "dec": 19.066,
    "mag": 3.51,
    "color": "#fef9c3",
    "constellation": "Capricornus",
    "isAnchor": false
  },
  {
    "id": "star-field-284",
    "name": "HD 84928",
    "ra": 132.391,
    "dec": -16.311,
    "mag": 6.42,
    "color": "#fed7aa",
    "constellation": "Cepheus",
    "isAnchor": false
  },
  {
    "id": "star-field-285",
    "name": "HD 169494",
    "ra": 273.357,
    "dec": -32.339,
    "mag": 6.69,
    "color": "#f8fafc",
    "constellation": "Triangulum",
    "isAnchor": false
  },
  {
    "id": "star-field-286",
    "name": "Oph 31",
    "ra": 237.673,
    "dec": -19.657,
    "mag": 3.98,
    "color": "#fef9c3",
    "constellation": "Ophiuchus",
    "isAnchor": false
  },
  {
    "id": "star-field-287",
    "name": "HD 191967",
    "ra": 58.09,
    "dec": 69.02,
    "mag": 4.92,
    "color": "#fed7aa",
    "constellation": "Cassiopeia",
    "isAnchor": false
  },
  {
    "id": "star-field-288",
    "name": "Equ 56",
    "ra": 238.399,
    "dec": 31.64,
    "mag": 4.67,
    "color": "#f8fafc",
    "constellation": "Equuleus",
    "isAnchor": false
  },
  {
    "id": "star-field-289",
    "name": "Vir 42",
    "ra": 287.561,
    "dec": 31.571,
    "mag": 4.54,
    "color": "#f8fafc",
    "constellation": "Virgo",
    "isAnchor": false
  },
  {
    "id": "star-field-290",
    "name": "HD 170363",
    "ra": 318.81,
    "dec": 37.197,
    "mag": 6.56,
    "color": "#ffffff",
    "constellation": "Sculptor",
    "isAnchor": false
  },
  {
    "id": "star-field-291",
    "name": "HD 152568",
    "ra": 0.093,
    "dec": 38.752,
    "mag": 6.24,
    "color": "#fef08a",
    "constellation": "Crater",
    "isAnchor": false
  },
  {
    "id": "star-field-292",
    "name": "HD 97140",
    "ra": 118.355,
    "dec": -62.299,
    "mag": 6.84,
    "color": "#f87171",
    "constellation": "Vela",
    "isAnchor": false
  },
  {
    "id": "star-field-293",
    "name": "Aqu 4",
    "ra": 111.903,
    "dec": 39.984,
    "mag": 3.87,
    "color": "#fed7aa",
    "constellation": "Aquila",
    "isAnchor": false
  },
  {
    "id": "star-field-294",
    "name": "HD 161472",
    "ra": 312.619,
    "dec": -75.16,
    "mag": 6.9,
    "color": "#f87171",
    "constellation": "Cepheus",
    "isAnchor": false
  },
  {
    "id": "star-field-295",
    "name": "HD 201943",
    "ra": 156.155,
    "dec": 13.477,
    "mag": 4.85,
    "color": "#fef9c3",
    "constellation": "Pictor",
    "isAnchor": false
  },
  {
    "id": "star-field-296",
    "name": "HD 60974",
    "ra": 251.755,
    "dec": 44.929,
    "mag": 5.86,
    "color": "#f8fafc",
    "constellation": "Pictor",
    "isAnchor": false
  },
  {
    "id": "star-field-297",
    "name": "Lup 56",
    "ra": 319.926,
    "dec": 10.697,
    "mag": 3.52,
    "color": "#fef9c3",
    "constellation": "Lupus",
    "isAnchor": false
  },
  {
    "id": "star-field-298",
    "name": "Sag 38",
    "ra": 260.25,
    "dec": -59.592,
    "mag": 4.63,
    "color": "#ffffff",
    "constellation": "Sagitta",
    "isAnchor": false
  },
  {
    "id": "star-field-299",
    "name": "HD 141553",
    "ra": 342.777,
    "dec": 20.738,
    "mag": 5.08,
    "color": "#fed7aa",
    "constellation": "Pictor",
    "isAnchor": false
  },
  {
    "id": "star-field-300",
    "name": "HD 206668",
    "ra": 203.101,
    "dec": -47.458,
    "mag": 4.85,
    "color": "#fed7aa",
    "constellation": "Lynx",
    "isAnchor": false
  },
  {
    "id": "star-field-301",
    "name": "HD 45750",
    "ra": 169.681,
    "dec": 25.483,
    "mag": 6.8,
    "color": "#f8fafc",
    "constellation": "Eridanus",
    "isAnchor": false
  },
  {
    "id": "star-field-302",
    "name": "HD 54777",
    "ra": 314.052,
    "dec": 59.192,
    "mag": 6.15,
    "color": "#fed7aa",
    "constellation": "Equuleus",
    "isAnchor": false
  },
  {
    "id": "star-field-303",
    "name": "HD 84115",
    "ra": 243.906,
    "dec": 15.796,
    "mag": 6.78,
    "color": "#93c5fd",
    "constellation": "Scorpius",
    "isAnchor": false
  },
  {
    "id": "star-field-304",
    "name": "HD 155920",
    "ra": 188.6,
    "dec": 23.047,
    "mag": 6.93,
    "color": "#fef9c3",
    "constellation": "Ursa Minor",
    "isAnchor": false
  },
  {
    "id": "star-field-305",
    "name": "HD 118873",
    "ra": 170.116,
    "dec": -8.99,
    "mag": 5.85,
    "color": "#ffffff",
    "constellation": "Cepheus",
    "isAnchor": false
  },
  {
    "id": "star-field-306",
    "name": "Lep 44",
    "ra": 352.188,
    "dec": -37.36,
    "mag": 3.63,
    "color": "#fef9c3",
    "constellation": "Lepus",
    "isAnchor": false
  },
  {
    "id": "star-field-307",
    "name": "HD 79889",
    "ra": 103.052,
    "dec": 42.435,
    "mag": 5.17,
    "color": "#fed7aa",
    "constellation": "Aquila",
    "isAnchor": false
  },
  {
    "id": "star-field-308",
    "name": "HD 11211",
    "ra": 260.537,
    "dec": 8.52,
    "mag": 5.53,
    "color": "#ffffff",
    "constellation": "Cassiopeia",
    "isAnchor": false
  },
  {
    "id": "star-field-309",
    "name": "HD 101481",
    "ra": 43.945,
    "dec": -32.91,
    "mag": 4.83,
    "color": "#ffffff",
    "constellation": "Auriga",
    "isAnchor": false
  },
  {
    "id": "star-field-310",
    "name": "HD 14538",
    "ra": 141.145,
    "dec": 35.319,
    "mag": 6.37,
    "color": "#fef9c3",
    "constellation": "Eridanus",
    "isAnchor": false
  },
  {
    "id": "star-field-311",
    "name": "HD 222793",
    "ra": 49.171,
    "dec": -16.103,
    "mag": 5.64,
    "color": "#ffffff",
    "constellation": "Ursa Minor",
    "isAnchor": false
  },
  {
    "id": "star-field-312",
    "name": "HD 144992",
    "ra": 345.251,
    "dec": -41.045,
    "mag": 6.43,
    "color": "#f8fafc",
    "constellation": "Taurus",
    "isAnchor": false
  },
  {
    "id": "star-field-313",
    "name": "HD 59404",
    "ra": 203.776,
    "dec": -42.827,
    "mag": 6.65,
    "color": "#fed7aa",
    "constellation": "Cassiopeia",
    "isAnchor": false
  },
  {
    "id": "star-field-314",
    "name": "HD 20979",
    "ra": 247.537,
    "dec": 40.449,
    "mag": 6.89,
    "color": "#f8fafc",
    "constellation": "Serpens",
    "isAnchor": false
  },
  {
    "id": "star-field-315",
    "name": "HD 202949",
    "ra": 301,
    "dec": -32.466,
    "mag": 5.68,
    "color": "#93c5fd",
    "constellation": "Lynx",
    "isAnchor": false
  },
  {
    "id": "star-field-316",
    "name": "HD 140899",
    "ra": 14.212,
    "dec": -10.775,
    "mag": 6.09,
    "color": "#fef9c3",
    "constellation": "Cygnus",
    "isAnchor": false
  },
  {
    "id": "star-field-317",
    "name": "HD 71614",
    "ra": 343.606,
    "dec": 33.625,
    "mag": 6.78,
    "color": "#fed7aa",
    "constellation": "Corvus",
    "isAnchor": false
  },
  {
    "id": "star-field-318",
    "name": "HD 192866",
    "ra": 271.657,
    "dec": -14.602,
    "mag": 5.62,
    "color": "#fef08a",
    "constellation": "Leo",
    "isAnchor": false
  },
  {
    "id": "star-field-319",
    "name": "HD 185191",
    "ra": 92.435,
    "dec": 56.311,
    "mag": 6.08,
    "color": "#fef9c3",
    "constellation": "Ursa Minor",
    "isAnchor": false
  },
  {
    "id": "star-field-320",
    "name": "Pyx 12",
    "ra": 98.662,
    "dec": -8.484,
    "mag": 4.63,
    "color": "#93c5fd",
    "constellation": "Pyxis",
    "isAnchor": false
  },
  {
    "id": "star-field-321",
    "name": "Eri 39",
    "ra": 249.259,
    "dec": -49.001,
    "mag": 3.61,
    "color": "#fef9c3",
    "constellation": "Eridanus",
    "isAnchor": false
  },
  {
    "id": "star-field-322",
    "name": "HD 26773",
    "ra": 218.379,
    "dec": -24.145,
    "mag": 6.45,
    "color": "#f87171",
    "constellation": "Volans",
    "isAnchor": false
  },
  {
    "id": "star-field-323",
    "name": "HD 31984",
    "ra": 36.98,
    "dec": -61.484,
    "mag": 6.21,
    "color": "#f8fafc",
    "constellation": "Sculptor",
    "isAnchor": false
  },
  {
    "id": "star-field-324",
    "name": "HD 23565",
    "ra": 150.064,
    "dec": -2.514,
    "mag": 5.54,
    "color": "#f8fafc",
    "constellation": "Ursa Minor",
    "isAnchor": false
  },
  {
    "id": "star-field-325",
    "name": "HD 106108",
    "ra": 178.918,
    "dec": -26.193,
    "mag": 6.4,
    "color": "#fef9c3",
    "constellation": "Pisces",
    "isAnchor": false
  },
  {
    "id": "star-field-326",
    "name": "HD 215351",
    "ra": 358.49,
    "dec": 5.728,
    "mag": 5.32,
    "color": "#f8fafc",
    "constellation": "Lyra",
    "isAnchor": false
  },
  {
    "id": "star-field-327",
    "name": "HD 169020",
    "ra": 294.22,
    "dec": 55.656,
    "mag": 6.71,
    "color": "#fef9c3",
    "constellation": "Pegasus",
    "isAnchor": false
  },
  {
    "id": "star-field-328",
    "name": "HD 203012",
    "ra": 305.475,
    "dec": -61.205,
    "mag": 6.64,
    "color": "#fed7aa",
    "constellation": "Orion",
    "isAnchor": false
  },
  {
    "id": "star-field-329",
    "name": "HD 33815",
    "ra": 89.07,
    "dec": 4.675,
    "mag": 5.94,
    "color": "#fed7aa",
    "constellation": "Crux",
    "isAnchor": false
  },
  {
    "id": "star-field-330",
    "name": "HD 134771",
    "ra": 280.226,
    "dec": -23.824,
    "mag": 6.88,
    "color": "#fed7aa",
    "constellation": "Sculptor",
    "isAnchor": false
  },
  {
    "id": "star-field-331",
    "name": "HD 77971",
    "ra": 64.362,
    "dec": -23.426,
    "mag": 4.98,
    "color": "#fef9c3",
    "constellation": "Fornax",
    "isAnchor": false
  },
  {
    "id": "star-field-332",
    "name": "HD 154543",
    "ra": 347.094,
    "dec": 80.989,
    "mag": 5.26,
    "color": "#f8fafc",
    "constellation": "Sagitta",
    "isAnchor": false
  },
  {
    "id": "star-field-333",
    "name": "HD 152441",
    "ra": 101.763,
    "dec": -41.267,
    "mag": 6.92,
    "color": "#fef08a",
    "constellation": "Vulpecula",
    "isAnchor": false
  },
  {
    "id": "star-field-334",
    "name": "HD 104017",
    "ra": 167.182,
    "dec": 51.891,
    "mag": 6.1,
    "color": "#93c5fd",
    "constellation": "Cygnus",
    "isAnchor": false
  },
  {
    "id": "star-field-335",
    "name": "HD 202631",
    "ra": 78.219,
    "dec": 19.079,
    "mag": 5.84,
    "color": "#fef08a",
    "constellation": "Boötes",
    "isAnchor": false
  },
  {
    "id": "star-field-336",
    "name": "HD 226908",
    "ra": 328.016,
    "dec": -20.699,
    "mag": 5.46,
    "color": "#fef9c3",
    "constellation": "Serpens",
    "isAnchor": false
  },
  {
    "id": "star-field-337",
    "name": "Per 8",
    "ra": 310.673,
    "dec": -12.297,
    "mag": 3.61,
    "color": "#fef9c3",
    "constellation": "Perseus",
    "isAnchor": false
  },
  {
    "id": "star-field-338",
    "name": "HD 27490",
    "ra": 44.736,
    "dec": -19.714,
    "mag": 5.48,
    "color": "#93c5fd",
    "constellation": "Puppis",
    "isAnchor": false
  },
  {
    "id": "star-field-339",
    "name": "HD 160164",
    "ra": 129.86,
    "dec": -23.588,
    "mag": 6.31,
    "color": "#fef9c3",
    "constellation": "Aquarius",
    "isAnchor": false
  },
  {
    "id": "star-field-340",
    "name": "HD 84762",
    "ra": 2.144,
    "dec": -61.33,
    "mag": 6.81,
    "color": "#ffffff",
    "constellation": "Corona Borealis",
    "isAnchor": false
  },
  {
    "id": "star-field-341",
    "name": "HD 131027",
    "ra": 327.466,
    "dec": -71.141,
    "mag": 6.47,
    "color": "#ffffff",
    "constellation": "Hydra",
    "isAnchor": false
  },
  {
    "id": "star-field-342",
    "name": "Gem 11",
    "ra": 310.082,
    "dec": 1.862,
    "mag": 4.12,
    "color": "#fef08a",
    "constellation": "Gemini",
    "isAnchor": false
  },
  {
    "id": "star-field-343",
    "name": "HD 18627",
    "ra": 59.431,
    "dec": 26.513,
    "mag": 5.94,
    "color": "#fef9c3",
    "constellation": "Sagittarius",
    "isAnchor": false
  },
  {
    "id": "star-field-344",
    "name": "HD 41889",
    "ra": 276.105,
    "dec": 43.962,
    "mag": 5.75,
    "color": "#93c5fd",
    "constellation": "Draco",
    "isAnchor": false
  },
  {
    "id": "star-field-345",
    "name": "HD 163963",
    "ra": 194.198,
    "dec": -38.297,
    "mag": 6.44,
    "color": "#f8fafc",
    "constellation": "Triangulum",
    "isAnchor": false
  },
  {
    "id": "star-field-346",
    "name": "Aqu 40",
    "ra": 16.26,
    "dec": 33.218,
    "mag": 4.51,
    "color": "#93c5fd",
    "constellation": "Aquila",
    "isAnchor": false
  },
  {
    "id": "star-field-347",
    "name": "HD 38761",
    "ra": 323.041,
    "dec": -62.81,
    "mag": 5.97,
    "color": "#f8fafc",
    "constellation": "Lacerta",
    "isAnchor": false
  },
  {
    "id": "star-field-348",
    "name": "Hyd 59",
    "ra": 332.548,
    "dec": 22.288,
    "mag": 4.71,
    "color": "#fed7aa",
    "constellation": "Hydra",
    "isAnchor": false
  },
  {
    "id": "star-field-349",
    "name": "HD 24751",
    "ra": 91.154,
    "dec": -47.75,
    "mag": 5.95,
    "color": "#fef9c3",
    "constellation": "Virgo",
    "isAnchor": false
  },
  {
    "id": "star-field-350",
    "name": "HD 10908",
    "ra": 79.824,
    "dec": 46.043,
    "mag": 5.28,
    "color": "#ffffff",
    "constellation": "Taurus",
    "isAnchor": false
  },
  {
    "id": "star-field-351",
    "name": "HD 46128",
    "ra": 192.288,
    "dec": 7.87,
    "mag": 5.6,
    "color": "#ffffff",
    "constellation": "Auriga",
    "isAnchor": false
  },
  {
    "id": "star-field-352",
    "name": "HD 229076",
    "ra": 353.118,
    "dec": -53.42,
    "mag": 6.46,
    "color": "#93c5fd",
    "constellation": "Lyra",
    "isAnchor": false
  },
  {
    "id": "star-field-353",
    "name": "HD 92450",
    "ra": 188.005,
    "dec": 62.488,
    "mag": 5.68,
    "color": "#fef08a",
    "constellation": "Leo",
    "isAnchor": false
  },
  {
    "id": "star-field-354",
    "name": "HD 31621",
    "ra": 132.635,
    "dec": -34.189,
    "mag": 6.94,
    "color": "#ffffff",
    "constellation": "Taurus",
    "isAnchor": false
  },
  {
    "id": "star-field-355",
    "name": "HD 144834",
    "ra": 141.115,
    "dec": -57.706,
    "mag": 5.9,
    "color": "#f8fafc",
    "constellation": "Crux",
    "isAnchor": false
  },
  {
    "id": "star-field-356",
    "name": "HD 67696",
    "ra": 323.404,
    "dec": -38.189,
    "mag": 6.33,
    "color": "#f8fafc",
    "constellation": "Crater",
    "isAnchor": false
  },
  {
    "id": "star-field-357",
    "name": "Hyd 33",
    "ra": 12.04,
    "dec": -15.969,
    "mag": 4.69,
    "color": "#fef08a",
    "constellation": "Hydra",
    "isAnchor": false
  },
  {
    "id": "star-field-358",
    "name": "HD 187848",
    "ra": 105.606,
    "dec": 63.053,
    "mag": 5.71,
    "color": "#93c5fd",
    "constellation": "Crux",
    "isAnchor": false
  },
  {
    "id": "star-field-359",
    "name": "Eri 9",
    "ra": 300.488,
    "dec": -3.689,
    "mag": 4.64,
    "color": "#f87171",
    "constellation": "Eridanus",
    "isAnchor": false
  },
  {
    "id": "star-field-360",
    "name": "HD 154817",
    "ra": 130.503,
    "dec": 23.642,
    "mag": 5.18,
    "color": "#93c5fd",
    "constellation": "Centaurus",
    "isAnchor": false
  },
  {
    "id": "star-field-361",
    "name": "HD 155125",
    "ra": 270.529,
    "dec": -4.783,
    "mag": 5.6,
    "color": "#ffffff",
    "constellation": "Crater",
    "isAnchor": false
  },
  {
    "id": "star-field-362",
    "name": "Urs 17",
    "ra": 347.156,
    "dec": -53.737,
    "mag": 3.73,
    "color": "#fed7aa",
    "constellation": "Ursa Minor",
    "isAnchor": false
  },
  {
    "id": "star-field-363",
    "name": "Sag 16",
    "ra": 17.163,
    "dec": -18.777,
    "mag": 3.57,
    "color": "#93c5fd",
    "constellation": "Sagitta",
    "isAnchor": false
  },
  {
    "id": "star-field-364",
    "name": "HD 228094",
    "ra": 333.704,
    "dec": -51.426,
    "mag": 5.8,
    "color": "#f87171",
    "constellation": "Scorpius",
    "isAnchor": false
  },
  {
    "id": "star-field-365",
    "name": "HD 73687",
    "ra": 357.006,
    "dec": -21.058,
    "mag": 5.39,
    "color": "#f8fafc",
    "constellation": "Hercules",
    "isAnchor": false
  },
  {
    "id": "star-field-366",
    "name": "HD 121695",
    "ra": 96.764,
    "dec": -73.114,
    "mag": 6.76,
    "color": "#93c5fd",
    "constellation": "Pegasus",
    "isAnchor": false
  },
  {
    "id": "star-field-367",
    "name": "HD 130326",
    "ra": 75.129,
    "dec": 1.071,
    "mag": 6.43,
    "color": "#93c5fd",
    "constellation": "Perseus",
    "isAnchor": false
  },
  {
    "id": "star-field-368",
    "name": "Gem 61",
    "ra": 309.602,
    "dec": -43.907,
    "mag": 4.59,
    "color": "#fef08a",
    "constellation": "Gemini",
    "isAnchor": false
  },
  {
    "id": "star-field-369",
    "name": "HD 116698",
    "ra": 103.028,
    "dec": -5.627,
    "mag": 6.98,
    "color": "#ffffff",
    "constellation": "Lacerta",
    "isAnchor": false
  },
  {
    "id": "star-field-370",
    "name": "HD 103056",
    "ra": 54.637,
    "dec": -55.026,
    "mag": 5.47,
    "color": "#f8fafc",
    "constellation": "Sagitta",
    "isAnchor": false
  },
  {
    "id": "star-field-371",
    "name": "HD 133471",
    "ra": 317.444,
    "dec": 24.077,
    "mag": 5.6,
    "color": "#ffffff",
    "constellation": "Vela",
    "isAnchor": false
  },
  {
    "id": "star-field-372",
    "name": "HD 18936",
    "ra": 301.04,
    "dec": -44.188,
    "mag": 6.8,
    "color": "#f8fafc",
    "constellation": "Lynx",
    "isAnchor": false
  },
  {
    "id": "star-field-373",
    "name": "HD 54914",
    "ra": 296.427,
    "dec": -67.817,
    "mag": 5.56,
    "color": "#f8fafc",
    "constellation": "Aquila",
    "isAnchor": false
  },
  {
    "id": "star-field-374",
    "name": "Urs 58",
    "ra": 257.89,
    "dec": -76.074,
    "mag": 3.74,
    "color": "#fed7aa",
    "constellation": "Ursa Minor",
    "isAnchor": false
  },
  {
    "id": "star-field-375",
    "name": "HD 85015",
    "ra": 59.889,
    "dec": -51.03,
    "mag": 6.45,
    "color": "#fef08a",
    "constellation": "Lepus",
    "isAnchor": false
  }
];
