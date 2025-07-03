export const officials = [
  {
    id: 1,
    name_en: "Xi Jinping",
    name_cn: "习近平",
    age: 70,
    generation: 5.0,
    home_province: "Shaanxi",
    positions: [
      { title: "General Secretary", institution: "Chinese Communist Party" },
      { title: "President", institution: "People's Republic of China" },
      { title: "Chairman", institution: "Central Military Commission" }
    ],
    degrees: [
      {
        name: "PhD in Law",
        level: "doctoral",
        type: "humanities"
      },
      {
        name: "BS in Chemical Engineering",
        level: "bachelors",
        type: "stem"
      }
    ]
  },
  {
    id: 2,
    name_en: "Li Qiang",
    name_cn: "李强",
    age: 64,
    generation: 5.0,
    home_province: "Zhejiang",
    positions: [
      { title: "Premier", institution: "State Council" }
    ],
    degrees: [
      {
        name: "BS in Agricultural Engineering",
        level: "bachelors",
        type: "stem"
      }
    ]
  },
  {
    id: 3,
    name_en: "Zhao Leji",
    name_cn: "赵乐际",
    age: 67,
    generation: 5.0,
    home_province: "Qinghai",
    positions: [
      { title: "Chairman", institution: "National People's Congress Standing Committee" }
    ],
    degrees: [
      {
        name: "BS in Economics",
        level: "bachelors",
        type: "humanities"
      }
    ]
  }
]

export const bodies = [
  {
    id: 1,
    name: "Chinese Communist Party",
    members: [
      { id: 1, title: "General Secretary" }
    ],
    parent: null,
    caption: "Party Leadership"
  },
  {
    id: 2,
    name: "Politburo Standing Committee",
    members: [
      { id: 1, title: "General Secretary" },
      { id: 2, title: null },
      { id: 3, title: null }
    ],
    parent: 1,
    caption: "Top Leadership"
  },
  {
    id: 3,
    name: "State Council",
    members: [
      { id: 2, title: "Premier" }
    ],
    parent: null,
    caption: "Government"
  },
  {
    id: 4,
    name: "National People's Congress",
    members: [
      { id: 3, title: "Chairman" }
    ],
    parent: null,
    caption: "Legislature"
  }
]
