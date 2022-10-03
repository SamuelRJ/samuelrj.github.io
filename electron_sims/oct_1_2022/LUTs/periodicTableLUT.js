// Periodic Table - Look-Up Table because I'm an old hardware engineer and I had a bad experience with python dictionaries so I'm not goint to call it a dictionary.

const periodicTableData = [
  {
    name: "Neutron",
    atomicNumber: 0,
    symbol: "n",
    numberOfNeutrons: 1,
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

export const getAtomInfo = (numProtons, numNeutrons) => {
  if (numProtons == null) {
    return -1;
  }
  if (numNeutrons == null) {
    if (periodicTableData[numProtons]) {
      return periodicTableData[numProtons];
    }
  }
  if (periodicTableData[numProtons].isotope[numNeutrons]) {
    return periodicTableData[numProtons].isotope[numNeutrons];
  }
  return -1;
};

// isotopes and types of decay: https://www.google.com/imgres?imgurl=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2Fc%2Fc4%2FTable_isotopes_en.svg%2F1200px-Table_isotopes_en.svg.png&imgrefurl=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FStable_nuclide&tbnid=TeTFC0jYEQXQMM&vet=12ahUKEwj_kdP7xL_6AhUHHTQIHarSAy8QMygEegUIARDrAQ..i&docid=bPhvB96ucTetZM&w=1200&h=1717&q=isotope%20table&ved=2ahUKEwj_kdP7xL_6AhUHHTQIHarSAy8QMygEegUIARDrAQ
//    wiki: https://en.wikipedia.org/wiki/Table_of_nuclides
