function getGames() {
    return games
}

function getRandomGame() {
   let index = Math.floor(Math.random() * games.length);
   return games[index]
}


// Export the functions
module.exports = {
  getGames,
  getRandomGame
};


const games = [
  {
    "title":"Security Celebrities",
    "categories":{
      "Famous Cryptographers":[
        "William Friedman",
        "Adi Shamir",
        "Whit Diffie",
        "Claude Shannon",
      ],
      "Former NSA Directors":[
        "Paul Nakasone",
        "Keith Alexander",
        "Michael Hayden",
        "John McConnell",
      ],
      "Famous Security CEOs":[
        "George Kurtz",
        "Eugene Kaspersky",
        "Kevin Mandia",
        "Eva Chen",
      ],
      "Media":[
        "Brian Krebs",
        "Andy Greenberg",
        "Kevin Poulsen",
        "Kim Zetter",
      ]      
    }
  },
  {
    "title":"Threat Intelligence",
    "categories":{
      "Nation State Threat Actors":[
        "Salt Typhoon",
        "APT43",
        "Sandworm",
        "Seashell Blizzard",
      ],
      "Names for Malware":[
        "Moonrat",
        "Cobalt Strike",
        "Mango Punch",
        "Agent Tesla",
      ],
      "Financially Motivated Threat Actors":[
        "DarkSide",
        "Scattered Spider",
        "FIN12",
        "Sangria Tempest",
      ],
      "Tropical Cocktails":[
        "Rum Punch",
        "Painkiller",
        "Jamaican Breeze",
        "Blue Hawaii",
      ],
    }
  },
  {
    "title":"Security Solutions",
    "categories":{
      "Mandiant Services":[
        "Incident Response",
        "Penetration Testing",
        "Cyber Risk Management",
        "Crisis Communications",
      ],
      "Google Cloud Security Demos at BlackHat":[
        "AI for Defenders",
        "Cloud Security",
        "Chrome Enterprise",
        "Google SecOps",
      ],
      "SAIF Framework Components":[
        "Data Security ",
        "Application Security",
        "Model Security",
        "Infrastructure Security",
      ],
      "BlackHat Briefing Tracks":[
        "Cryptography",
        "Cyber-Physical Systems & IOT",
        "Exploit Development & Vulnerability Discovery",
        "Network Security",
      ]  
    }
  },
  {
    "title":"Vegas",
    "categories":{
      "Vegas Movies":[
        "Oceans 11",
        "Casino",
        "Hangover",
        "Fear and Loathing in Las Vegas",
      ],
      "Vegas Casinos":[
        "MGM",
        "Manadalay Bay",
        "Cosmopolitan",
        "New York, New York",
      ],
      "Vegas Casino Founders":[
        "Wynn",
        "Binion",
        "Hughes",
        "Kekorian",
      ],
      "Vegas Celebrities":[
        "Presley",
        "Sinatra",
        "Angel",
        "Newton",
      ]  
    }
  }
]

const oldgames2 = [
  {
    "title":"Threat Actor",
    "categories":{
      "Nation State Threat Actors":[
        "Salt Typhoon",
        "APT43",
        "Sandworm",
        "Seashell Blizzard",
      ],
      "Names for Malware":[
        "Moonrat",
        "Cobalt Strike",
        "Mango Punch",
        "Agent Tesla",
      ],
      "Financially Motivated Threat Actors":[
        "DarkSide",
        "Scattered Spider",
        "FIN12",
        "Sangria Tempest",
      ],
      "Ransomware Names":[
        "WannaCry",
        "ALPHV",
        "Bad Rabbit",
        "CryptoLocker",
      ],
    }
  },
  {
    "title":"Google Cloud Security Offerings",
    "categories":{
      "SAIF Framework Components":[
        "Data Security",
        "Application Security",
        "Model Security",
        "Infrastructure Security",
      ],
      "Capabilities in Google Unified Security":[
        "Security Operations",
        "Threat Intelligence",
        "Secure Browsing",
        "Cloud Posture Management",
      ],
      "Products in Google Cloud Security Foundation":[
        "Cloud Armor",
        "Cloud DLP",
        "Cloud Firewalls",
        "Identity Platform",
      ],
      "Mandiant Service Offerings":[
        "Incident Response",
        "Penetration Testing",
        "Cyber Risk Management",
        "Cyber Defense Development & Operations",
      ],
    }
  },
  {
    "title":"M-Trends",
    "categories":{
      "Top Initial Infection Vectors per M-Trends 2025":[
        "Exploits",
        "Phishing",
        "Stolen Credentials",
        "Web Compromise",
      ],
      "Most seen MITRE ATT&CK Techniques":[
        "Command and Scripting Interpreter",
        "Obfuscated Files or Information",
        "Remote Services",
        "File and Directory Discovery",
      ],
      "Most observed tools (ransomware related)":[
        "Utility",
        "Credential Stealer",
        "Remote Control and Administration Tool",
        "Reconnaissance Tool",
      ],
      "M-Trends  2025 Recommendations":[
        "Deploy and optimize advanced threat detection technologies",
        "Scan and patch vulnerabilities",
        "Strengthen Access Controls",
        "Invest in ongoing security awareness training",
      ],
    }
  },
  
  {
    "title":"Google Cloud Partners",
    "categories":{
      "GSI":[
        "PWC",
        "TCS",
        "Accenture",
        "Deloitte",
      ],
      "MSSP":[
        "Optiv ",
        "Foresite",
        "Thales",
        "Netenrich ",
      ],
      "Tech ISV":[
        "Wiz",
        "CrowdStrike",
        "Menlo Security",
        "SentinelOne",
      ],
      "VAR":[
        "Guidepoint",
        "NTT",
        "Sada",
        "CDW",
      ]      
    }
  },
  {
    "title":"Security Celebrities",
    "categories":{
      "Famous Cryptographers":[
        "William Friedman",
        "Adi Shamir",
        "Leonard Adleman",
        "Claude Shannon",
      ],
      "Former NSA Directors":[
        "Paul Nakasone",
        "Keith Alexander",
        "Michael Hayden",
        "John McConnell",
      ],
      "Famous Security CEOs":[
        "George Kurtz",
        "Eugene Kaspersky",
        "Kevin Mandia",
        "Eva Chen",
      ],
      "Media":[
        "Brian Krebs",
        "Andy Greenberg",
        "Kevin Poulsen",
        "Kim Zetter",
      ]      
    }
  }
]


const oldGames = {
  "title":"Secure AI Framework (SAIF)",
  "categories":{
    "SAIF AI Components":[
      "Data",
      "Application",
      "Model",
      "Infrastructure",
    ],
    "SAIF Risks":[
      "Data Poisoning",
      "Model Exfiltration",
      "Prompt Injection",
      "Sensitive Data Disclosure",
    ],
    "SAIF Security Controls":[
      "Model and Data Access Controls",
      "Input Validation and Sanitization",
      "Vulnerability Management",
      "Red Teaming",
    ],
    "Factors  for choosing an AI Model":[
      "Accuracy and Performance",
      "Cost",
      "Input types",
      "Security and privacy",
    ]      
  }
}