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
  
  // Replace umlauts in email
  const emailFirstName = firstName.toLowerCase()
    .replace('ä', 'ae')
    .replace('ö', 'oe')
    .replace('ü', 'ue');
  const emailLastName = lastName.toLowerCase()
    .replace('ä', 'ae')
    .replace('ö', 'oe')
    .replace('ü', 'ue');
  
  return {
    firstName,
    lastName,
    email: `${emailFirstName}.${emailLastName}@actindo.com`
  };
} 