export const firstNames = [
  'Hans',
  'Peter',
  'Thomas',
  'Michael',
  'Andreas',
  'Maria',
  'Anna',
  'Ursula',
  'Sandra',
  'Monika'
];

export const lastNames = [
  'Müller',
  'Schmid',
  'Schneider',
  'Fischer',
  'Weber',
  'Meyer',
  'Huber',
  'Wagner',
  'Becker',
  'Hoffmann'
];

let firstNameIndex = 0;
let lastNameIndex = 0;

export function getNextName() {
  const firstName = firstNames[firstNameIndex];
  const lastName = lastNames[lastNameIndex];
  
  // Increment indices
  firstNameIndex = (firstNameIndex + 1) % firstNames.length;
  lastNameIndex = (lastNameIndex + 1) % lastNames.length;
  
  return {
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@actindo.com`
  };
} 