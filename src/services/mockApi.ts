import type { Product, ProductCustomizationConfig } from '../types';

const mockProducts: Product[] = [
  {
    sku: '202526-4751',
    name: "Replica Trikot \"Home\" 2025/26",
    price: 89.95,
    description: `<ul>
<li><strong>offizielles Puma Heimtrikot der Saison 25/26</strong></li>
<li><strong>Kurzarmtrikot</strong></li>
<li><strong>Replica-Version</strong></li>
<li><strong>Rundhalskragen</strong></li>
<li><strong>gesticktes Vereinslogo im linken Brustbereich</strong></li>
<li><strong>gestickter 125 Jahre Schriftzug unter dem Vereinslogo</strong></li>
<li><strong>gesticktes Puma Logo im rechten Brustbereich und an den Ärmeln</strong></li>
<li><strong>gedrucktes Reuter-Sponsorenlogo vorne auf der Brust</strong></li>
<li><strong>gedrucktes Sonepar-Logo auf dem linken Ärmel</strong></li>
<li><strong>gedruckter Mönchengladbach Schriftzug hinten</strong></li>
<li><strong>kleines 125 Jahre Logo auf der Rückseite</strong></li>
<li><strong>dryCELL: Performance-Technologie, die Feuchtigkeit vom Körper ableitet und dafür sorgt, dass du beim Training schweißfrei bleibst</strong></li>
<li><strong>Recycelte Bestandteile: Aus 100 % recyceltem Material als Schritt in eine bessere Zukunft.</strong></li>
<li><strong>Farbe: Off White</strong></li>
<li><strong>Puma UVP 94,95€</strong></li>
</ul>

<p>Das offizielle Puma Heimtrikot der Saison 2025/26 in der Replica-Version verbindet Tradition mit modernen Details. Mit gesticktem Vereinslogo auf der Brust, dem „125 Jahre"-Schriftzug darunter sowie dem Puma Logo auf Brust und Ärmeln zeigt es deine Verbundenheit zu Borussia Mönchengladbach. Gedruckte Sponsorenlogos auf der Vorderseite und dem Ärmel runden den authentischen Look ab. Auf der Rückseite setzen der „Mönchengladbach"-Schriftzug und ein kleines Jubiläumslogo zusätzliche Akzente. Ein echtes Must-have für alle Fans der Fohlenelf!</p>

<p><strong>Hinweis:</strong><br>
Trikots mit Spieler- oder individueller Beflockung sind vom Umtausch ausgeschlossen und die angegebene Lieferzeit kann sich um bis zu drei Werktage verlängern. Bitte beachtet, dass es beim Saisonübergang zu Änderungen im Spielerkader und der Rückennummernvergabe kommen kann.</p>

<p><em>Tim ist 194cm groß und trägt hier die Größe XL.</em></p>`,
    stockLevel: 0, // Will be computed from variants
    imageUrls: [
      'https://bmg-live.cdn.scayle.cloud/images/9c546ff6f82761a2e91e2c8744efec0d.jpg?brightness=1&width=1536&height=2048&quality=75&bg=ffffff',
      'https://bmg-live.cdn.scayle.cloud/images/883771a6a40402897a463dfb8dfb6067.jpg?brightness=1&width=1536&height=2048&quality=75&bg=ffffff'
    ],
    hasVariants: true,
    variantAttributes: [
      { name: 'Modell', values: ['Herren', 'Kinder', 'Mini'] },
      { name: 'Größe', values: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', '128', '140', '152', '164', '92', '98', '104', '116'] }
    ],
    conditionalPrices: [
      { when: { Modell: 'Kinder' }, price: 68.95 },
      { when: { Modell: 'Mini' }, price: 74.95 }
    ],
    conditionalImages: [
      {
        when: { Modell: 'Herren' },
        imageUrls: [
          'https://bmg-live.cdn.scayle.cloud/images/9c546ff6f82761a2e91e2c8744efec0d.jpg?brightness=1&width=1536&height=2048&quality=75&bg=ffffff',
          'https://bmg-live.cdn.scayle.cloud/images/883771a6a40402897a463dfb8dfb6067.jpg?brightness=1&width=1536&height=2048&quality=75&bg=ffffff'
        ]
      },
      {
        when: { Modell: 'Kinder' },
        imageUrls: [
          'https://bmg-live.cdn.scayle.cloud/images/71093571c3350781305d4451dcc46046.jpg?brightness=1&width=1536&height=2048&quality=75&bg=ffffff',
          'https://bmg-live.cdn.scayle.cloud/images/7ce11f6e3ce9eac5fd518cdc6e1b6463.jpg?brightness=1&width=1536&height=2048&quality=75&bg=ffffff'
        ]
      },
      {
        when: { Modell: 'Mini' },
        imageUrls: [
          'https://bmg-live.cdn.scayle.cloud/images/916477457c51dabc85a71987bc21af8e.jpg?brightness=1&width=1536&height=2048&quality=75&bg=ffffff',
          'https://bmg-live.cdn.scayle.cloud/images/0ebbdfec9ee30841cb3345392a4e7836.jpg?brightness=1&width=1536&height=2048&quality=75&bg=ffffff'
        ]
      }
    ],
    customizationConfig: {
      customizations: [
        {
          id: 'flocking',
          name: 'Beflockung',
          description: 'Name und Nummer auf dem Trikot',
          enabled: true,
          sortOrder: 1,
          fields: [
            {
              id: 'preset',
              label: 'Auswahl',
              inputType: 'preset-select',
              allowCustomInput: true,
              customInputPrice: 16.95,
              targetFields: ['name', 'number'],
              presets: [
                { id: 'chiarodia-2', label: 'Chiarodia (#2)', values: { name: 'Chiarodia', number: 2 }, price: 14.95 },
                { id: 'diks-4', label: 'Diks (#4)', values: { name: 'Diks', number: 4 }, price: 14.95 },
                { id: 'friedrich-5', label: 'Friedrich (#5)', values: { name: 'Friedrich', number: 5 }, price: 14.95 },
                { id: 'engelhardt-6', label: 'Engelhardt (#6)', values: { name: 'Engelhardt', number: 6 }, price: 14.95 },
                { id: 'stoeger-7', label: 'Stöger (#7)', values: { name: 'Stöger', number: 7 }, price: 14.95 },
                { id: 'honorat-9', label: 'Honorat (#9)', values: { name: 'Honorat', number: 9 }, price: 14.95 },
                { id: 'neuhaus-10', label: 'Neuhaus (#10)', values: { name: 'Neuhaus', number: 10 }, price: 14.95 },
                { id: 'kleindienst-11', label: 'Kleindienst (#11)', values: { name: 'Kleindienst', number: 11 }, price: 14.95 },
                { id: 'reyna-13', label: 'Reyna (#13)', values: { name: 'Reyna', number: 13 }, price: 14.95 }
              ],
              validation: { required: true }
            },
            {
              id: 'name',
              label: 'Name',
              inputType: 'text',
              placeholder: 'Max 12 Zeichen',
              validation: { required: true, maxLength: 12 },
              dependsOn: { fieldId: 'preset', customOnly: true }
            },
            {
              id: 'number',
              label: 'Nummer',
              inputType: 'number',
              placeholder: '1-99',
              validation: { required: true, min: 1, max: 99 },
              dependsOn: { fieldId: 'preset', customOnly: true }
            }
          ]
        },
        {
          id: 'bundesliga-badge',
          name: 'Bundesliga Badge',
          description: 'Offizielles Bundesliga Logo auf dem Ärmel',
          enabled: true,
          sortOrder: 2,
          availableForVariants: [
            { attributeName: 'Modell', values: ['Herren', 'Kinder'] }
          ],
          basePrice: 2.49,
          fields: []
        }
      ]
    },
    variants: [
      // Herren variants
      { attributes: { Modell: 'Herren', Größe: 'S' }, sku: '202526-4751-h-s', stockLevel: 5 },
      { attributes: { Modell: 'Herren', Größe: 'M' }, sku: '202526-4751-h-m', stockLevel: 10 },
      { attributes: { Modell: 'Herren', Größe: 'L' }, sku: '202526-4751-h-l', stockLevel: 8 },
      { attributes: { Modell: 'Herren', Größe: 'XL' }, sku: '202526-4751-h-xl', stockLevel: 12 },
      { attributes: { Modell: 'Herren', Größe: 'XXL' }, sku: '202526-4751-h-xxl', stockLevel: 6 },
      { attributes: { Modell: 'Herren', Größe: 'XXXL' }, sku: '202526-4751-h-xxxl', stockLevel: 4 },
      // Kinder variants
      { attributes: { Modell: 'Kinder', Größe: '128' }, sku: '202526-4751-k-128', stockLevel: 8 },
      { attributes: { Modell: 'Kinder', Größe: '140' }, sku: '202526-4751-k-140', stockLevel: 10 },
      { attributes: { Modell: 'Kinder', Größe: '152' }, sku: '202526-4751-k-152', stockLevel: 7 },
      { attributes: { Modell: 'Kinder', Größe: '164' }, sku: '202526-4751-k-164', stockLevel: 5 },
      // Mini variants - only individual flocking at 9.95
      {
        attributes: { Modell: 'Mini', Größe: '92' },
        sku: '202526-4751-m-92',
        stockLevel: 6,
        customizationOverrides: [
          {
            customizationId: 'flocking',
            fieldOverrides: [
              {
                fieldId: 'preset',
                presets: [],
                customInputPrice: 9.95
              }
            ]
          }
        ]
      },
      {
        attributes: { Modell: 'Mini', Größe: '98' },
        sku: '202526-4751-m-98',
        stockLevel: 8,
        customizationOverrides: [
          {
            customizationId: 'flocking',
            fieldOverrides: [
              {
                fieldId: 'preset',
                presets: [],
                customInputPrice: 9.95
              }
            ]
          }
        ]
      },
      {
        attributes: { Modell: 'Mini', Größe: '104' },
        sku: '202526-4751-m-104',
        stockLevel: 7,
        customizationOverrides: [
          {
            customizationId: 'flocking',
            fieldOverrides: [
              {
                fieldId: 'preset',
                presets: [],
                customInputPrice: 9.95
              }
            ]
          }
        ]
      },
      {
        attributes: { Modell: 'Mini', Größe: '116' },
        sku: '202526-4751-m-116',
        stockLevel: 5,
        customizationOverrides: [
          {
            customizationId: 'flocking',
            fieldOverrides: [
              {
                fieldId: 'preset',
                presets: [],
                customInputPrice: 9.95
              }
            ]
          }
        ]
      }
    ]
  },
  {
    sku: '5319',
    name: "Nummernschildhalterung",
    price: 8.95,
    description: `
<ul>
<li>Nummernschildhalterung von Borussia Mönchengladbach</li>
<li>geeignet für Nummernschilder bis 53 cm Breite</li>
<li>mit Vereinslogo und Borussia Mönchengladbach Schriftzug</li>
<li>Maße: 52x13cm</li>
</ul>
<p>Mit dieser Nummernschildhalterung zeigst du schon auf der Straße, für welchen Verein dein Herz schlägt. Verziert mit Vereinslogo und Borussia Mönchengladbach Schriftzug, ist sie passend für Nummernschilder bis 53 cm Breite. Die Halterung misst 52 × 13 cm und verbindet Funktionalität mit klarer Fanbotschaft – 
ideal für echte Borussen, die auch unterwegs Flagge zeigen.</p>`,
    stockLevel: 25,
    imageUrls: [
        'https://bmg-live.cdn.scayle.cloud/images/5182542724ad45d67b23c6c52a492125.jpg?brightness=1&width=1536&height=2048&quality=75&bg=ffffff',
        'https://bmg-live.cdn.scayle.cloud/images/873718ae7883c18ebc110b0f1bae1cf8.jpg?brightness=1&width=1536&height=2048&quality=75&bg=ffffff'
    ]
  },
  // Variant product example
  {
    sku: 'test',
    name: 'Karnevals-Jogginganzug "Borussia"',
    price: 49.95,
    description: `<ul>
<li><strong>Karnevals Jogginganzug "Borussia"</strong></li>
<li><strong>mit gesticktem Vereinslogo</strong></li>
<li><strong>2 Teiler hose und Jacke</strong></li>
<li><strong>Rauten Allover Muster</strong></li>
<li><strong>Lockerer Schnitt</strong></li>
</ul>

<p>Der Karnevals-Jogginganzug „Borussia" vereint Komfort mit närrischem Teamgeist. Das auffällige Rauten-Allover-Muster bringt echtes Borussia-Flair in die fünfte Jahreszeit, während das gestickte Vereinslogo den Look perfekt abrundet. Der zweiteilige Anzug, bestehend aus Hose und Jacke, bietet dank seines lockeren Schnitts optimale Bewegungsfreiheit – ideal für Karnevalsumzüge, Sitzungen oder gemütliche Tage zuhause.<br>
Ein Must-have für alle Jecken, die ihre Verbundenheit zur Fohlenelf auch im Karneval zeigen wollen!</p>

<p><em>Unser Model ist 186cm groß und trägt hier die Größe M.</em></p>`,
    imageUrls: [
      'https://bmg-live.cdn.scayle.cloud/images/7cf56656a8c16b3805d3aa4172bd16b9.jpg?brightness=1&width=1536&height=2048&quality=75&bg=ffffff',
      'https://bmg-live.cdn.scayle.cloud/images/5c9ff9af7be4c875dfa9aed9a333018d.jpg?brightness=1&width=1536&height=2048&quality=75&bg=ffffff',
      'https://bmg-live.cdn.scayle.cloud/images/15878d0b1fcd6f71fc545fdc2c0ce367.jpg?brightness=1&width=1536&height=2048&quality=75&bg=ffffff'
    ],
    stockLevel: 0, // Will be computed from variants
    hasVariants: true,
    variantAttributes: [
      { name: 'Größe', values: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    ],
    variants: [
      {
        attributes: { Größe: 'S' },
        sku: 'test-s',
        stockLevel: 5,
      },
      {
        attributes: { Größe: 'M' },
        sku: 'test-m',
        stockLevel: 10,
      },
      {
        attributes: { Größe: 'L' },
        sku: 'test-l',
        stockLevel: 3,
      },
      {
        attributes: { Größe: 'XL' },
        sku: 'test-xl',
        stockLevel: 10,
      },
      {
        attributes: { Größe: 'XXL' },
        sku: 'test-xxl',
        stockLevel: 20,
      },
      {
        attributes: { Größe: 'XXXL' },
        sku: 'test-xxxl',
        stockLevel: 30,
      },
    ]
  },
  /*
  {
    sku: 'ks-002',
    name: 'Bergen Pro Sandstone',
    price: 119.00,
    description: 'The Sport watch is designed for active lifestyles. With water resistance up to 200m, a durable rubber strap, and a rotating bezel for timing functions.',
    imageUrl: 'https://kns-live.cdn.aboutyou.cloud/images/a2e1f45e9cdf1aa42da2d00c8dc63440.jpg?brightness=1&impolicy=imdb-transparent-background&width=1160&height=1547&quality=75&bg=FFFFFF',
    stockLevel: 15
  },
  {
    sku: 'ks-003',
    name: 'Bergen Pro Muted Sage',
    price: 119.90,
    description: 'The Chronograph features a sophisticated movement with stopwatch functionality. The elegant design includes a tachymeter scale and multiple sub-dials.',
    imageUrl: 'https://kns-live.cdn.aboutyou.cloud/images/4aa5ff0f0b782b2495c40f9c8a3882ca.jpg?brightness=1&impolicy=imdb-transparent-background&width=1160&height=1547&quality=75&bg=FFFFFF',
    stockLevel: 8
  },
  {
    sku: 'ks-004',
    name: 'Zurich Oversize Dark Tortoise Green',
    price: 119.90,
    description: 'The Automatic watch showcases a self-winding mechanical movement. With a transparent case back, you can admire the intricate inner workings.',
    imageUrl: 'https://kns-live.cdn.aboutyou.cloud/images/5b2720ada94ceb538169daced0d0845e.jpg?brightness=1&impolicy=imdb-transparent-background&width=1160&height=1547&quality=75&bg=FFFFFF',
    stockLevel: 12
  },*/
];

export async function fetchProducts(): Promise<Product[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockProducts;
}

export async function createOrder(_orderData: any): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Generate a random order number
  return `BMG-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
} 