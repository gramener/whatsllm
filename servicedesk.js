// Simulate a random number generator since Math.random() has no seed
// https://stackoverflow.com/a/47593316/100904
function splitmix32(a) {
  return function () {
    a |= 0;
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

const getRandomDate = (start, end, random) => new Date(start.getTime() + random() * (end.getTime() - start.getTime()));

export async function generateManuscriptHistory(seed) {
  const random = splitmix32(seed);

  const history = [];
  let currentState = "Submitted";
  let currentDate = getRandomDate(new Date(2020, 0, 1), new Date(), random);

  history.push({ date: currentDate, state: currentState });

  while (currentState !== "Accepted" && currentState !== "Rejected" && currentState !== "Published") {
    let possibleNextStates;

    switch (currentState) {
      case "Submitted":
        possibleNextStates = ["Under Review"];
        break;
      case "Under Review":
        possibleNextStates = ["Review Completed"];
        break;
      case "Review Completed":
        possibleNextStates = ["Accepted", "Rejected", "Major Revision Required", "Minor Revision Required"];
        break;
      case "Major Revision Required":
      case "Minor Revision Required":
        possibleNextStates = ["In Revision"];
        break;
      case "In Revision":
        possibleNextStates = ["Resubmitted"];
        break;
      case "Resubmitted":
        possibleNextStates = ["Under Review"];
        break;
      case "Accepted":
        possibleNextStates = ["In Production"];
        break;
      case "In Production":
        possibleNextStates = ["Published"];
        break;
      default:
        possibleNextStates = [];
        break;
    }

    if (possibleNextStates.length === 0 || random() < 0.2) break;

    currentState = possibleNextStates[Math.floor(random() * possibleNextStates.length)];
    currentDate = getRandomDate(currentDate, new Date(), random);

    history.push({ date: currentDate, state: currentState });
  }

  return history;
}
