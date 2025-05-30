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
  'Monika',
  'Boris'
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
  'Hoffmann',
  'Krstic'
];


export function getNextName() {
  const firstNameIndex = Math.floor(Math.random() * firstNames.length);
  const lastNameIndex = Math.floor(Math.random() * lastNames.length);
  
  const firstName = firstNames[firstNameIndex];
  const lastName = lastNames[lastNameIndex];
  
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