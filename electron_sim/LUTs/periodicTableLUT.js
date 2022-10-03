// Periodic Table - Look-Up Table because I'm an old hardware engineer and I had a bad experience with python dictionaries so I'm not goint to call it a dictionary.

import { getPT } from "./ptData.js";
let pt = getPT();
console.log(pt);

let eMass = 1; //  Normalizing to electron mass
let pMass = 50; // 1836.15267 ;x of electron
let nMass = 50; // 1838.68366 ;x of electron

const elemParticle = [
  {
    name: "Electron",
    symbol: "e-",
  },
  {
    name: "Neutron",
    symbol: "n",
  },
  {
    name: "Proton",
    symbol: "p+",
  },
  {
    name: "Unknown",
    symbol: "",
  },
];

const periodicTableData = [
  {
    name: "Not anything, you dingus. Fix your code.",
    atomicNumber: 0,
    symbol: "nothin",
    numberOfNeutrons: 0,
  },
  {
    name: "Hydrogen",
    atomicNumber: 1,
    symbol: "H",
    isotope: [
      {
        name: "Protium",
        numberOfNeutrons: 0,
      },
      {
        name: "Deuterium",
        numberOfNeutrons: 1,
      },
      {
        name: "Tritium",
        numberOfNeutrons: 3,
      },
    ],
  },
  {
    name: "Helium",
    atomicNumber: 2,
    symbol: "He",
    isotope: [
      {
        name: "Two Protons",
        numberOfNeutrons: 0,
      },
      {
        name: "Helium-3",
        numberOfNeutrons: 1,
      },
      {
        name: "Helium-4",
        numberOfNeutrons: 2,
      },
    ],
  },
];

export const getPMass = (selP) => {
  return (selP.numE || 0) + pMass * (selP.numP || 0) + nMass * (selP.numN || 0);
};

export const getPCharge = (selP) => {
  return (selP.numP || 0) - (selP.numE || 0);
};

export const getPInfo = (selP, specifyIsotope) => {
  if (selP == null) {
    return elemParticle[3];
  }
  if (selP.numP == 0) {
    return getElemParticle(selP);
  }
  // if (specifyIsotope) {
  //   if (periodicTableData[selP.numP].isotope[selP.numN]) {
  //     return periodicTableData[selP.numP].isotope[selP.numN];
  //   }
  //   return "Whatever you just gave me is not an isotope.";
  // }
  // if (periodicTableData[selP.numP]) {
  //   return periodicTableData[selP.numP];
  // }
  if (selP.numP > 0 ** selP.numP < 117) {
    let nP = selP.numP;
    return pt[nP - 1];
  }
};

const getElemParticle = (selP) => {
  if (selP.numE > 0 && selP.numN == 0) {
    return elemParticle[0];
  } else if (selP.numN > 0 && selP.numE == 0) {
    return elemParticle[1];
  }
};

export const getNeutrons = (numP) => {
  var atomicMass = pt[numP - 1].atomicMass;
  if (atomicMass == null) {
    return 0;
  }
  atomicMass = atomicMass.substr(0, atomicMass.indexOf("("));
  var numN = atomicMass - numP;
  numN = Math.round(numN);
  return numN;
};

// isotopes and types of decay: https://www.google.com/imgres?imgurl=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2Fc%2Fc4%2FTable_isotopes_en.svg%2F1200px-Table_isotopes_en.svg.png&imgrefurl=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FStable_nuclide&tbnid=TeTFC0jYEQXQMM&vet=12ahUKEwj_kdP7xL_6AhUHHTQIHarSAy8QMygEegUIARDrAQ..i&docid=bPhvB96ucTetZM&w=1200&h=1717&q=isotope%20table&ved=2ahUKEwj_kdP7xL_6AhUHHTQIHarSAy8QMygEegUIARDrAQ
//    wiki: https://en.wikipedia.org/wiki/Table_of_nuclides
