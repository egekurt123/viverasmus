import { Property } from '../../core/models/property.model';
import { HOUSEHOLDS, ROOMS } from './mock-rooms';

const asset = (path: string): string => `/assets/apartments/${path}`;
const commonPhotos: Record<string, string[]> = {
  paris: ['PARIS/ZONA COMUNES/COC-SAL-1.jpg', 'PARIS/ZONA COMUNES/COC-SAL-2.jpg', 'PARIS/ZONA COMUNES/BAÑO-1.jpg'],
  helsinki: ['HELSINKI/ZONA COMUNES/COCINA1.jpg', 'HELSINKI/ZONA COMUNES/COCINA2.jpg', 'HELSINKI/ZONA COMUNES/BAÑO-1.jpg'],
  zagreb: ['ZAGREB/ZONA COMUNES/COC-1 (3).jpg', 'ZAGREB/ZONA COMUNES/COC-2 (1).jpg', 'ZAGREB/ZONA COMUNES/SAL-1.jpg'],
  tallin: ['TALINN/ZONA COMUNES/PLANO.png'],
  oslo: ['OSLO/ZONA COMUNES/COCINA1.jpg', 'OSLO/ZONA COMUNES/COCINA2.jpg', 'OSLO/ZONA COMUNES/BAÑO.jpg'],
  amsterdam: ['AMSTERDAM/ZONA COMUNES/COCINA1.jpg', 'AMSTERDAM/ZONA COMUNES/BAÑO1.jpg', 'AMSTERDAM/ZONA COMUNES/BAÑO2.jpg'],
  ottawa: ['OTTAWA/ZONA COMUNES/COCINA1.jpg', 'OTTAWA/ZONA COMUNES/COCINA2.jpg', 'OTTAWA/ZONA COMUNES/BAÑO1.jpg'],
  berlin: ['BERLIN/ZONA COMUNES/COCINA-1.jpg', 'BERLIN/ZONA COMUNES/COCINA-2.jpg', 'BERLIN/ZONA COMUNES/BAÑO-1.jpg'],
  'torre-del-oro': ['TORRE DEL ORO/ZONA COMUN/COC-1.jpg', 'TORRE DEL ORO/ZONA COMUN/COC-2.jpg', 'TORRE DEL ORO/ZONA COMUN/COM-100.jpg']
};
commonPhotos['tores-studio'] = [
  'AT-1 PLAZA DE TOROS/ZONA COMUNES/DSC_0107 (1).jpg',
  'AT-1 PLAZA DE TOROS/ZONA COMUNES/DSC_0110 (1).jpg',
  'AT-1 PLAZA DE TOROS/ZONA COMUNES/MAES1-1.jpg',
  'AT-1 PLAZA DE TOROS/ZONA COMUNES/MAES1-2.jpg'
];

const photosFor = (propertyId: string): string[] => (commonPhotos[propertyId] ?? []).map(asset);

/** Used to fill the gallery of a flat the office adds with fewer than three photos. */
export const PLACEHOLDER_IMAGES: string[] = [];

const LISTINGS: Property[] = [
  { id:'paris', title:'Paris', description:'A calm, bright flat share in a characterful building just off Triana’s lively streets. The flat has a proper dining space, a well-equipped kitchen and a small balcony for slow mornings. Ideal if you want a comfortable base and friendly flatmates while you settle into Sevilla.', propertyType:'Private room', monthlyRent:0, neighborhood:'Triana', address:'Calle San Jacinto, Triana', bedrooms:5, bathrooms:2, area:110, furnished:true, availableFrom:'2027-02-01', minimumStayMonths:5, deposit:0, utilitiesIncluded:false, occupants:5, amenities:['Wi-Fi','Air conditioning','Washing machine','Desk','Balcony'], images:photosFor('paris'), latitude:37.3837, longitude:-6.0034 },
  { id:'tores-studio', title:'Tores Studio', description:'A furnished studio apartment close to Plaza de Toros and the Guadalquivir. It offers a private kitchen and bathroom, with a practical layout for an independent Sevilla stay.', propertyType:'Studio', monthlyRent:690, neighborhood:'Centro', address:'Plaza de Toros, Centro', bedrooms:1, bathrooms:1, area:34, furnished:true, availableFrom:'2027-02-01', minimumStayMonths:5, deposit:690, utilitiesIncluded:true, occupants:1, amenities:['Wi-Fi','Air conditioning','Washing machine','Desk'], images:photosFor('tores-studio'), latitude:37.3863, longitude:-5.9966 },
  { id:'helsinki', title:'Helsinki', description:'A welcoming flat share with a furnished common area, a practical kitchen and a washing machine. Each room has a bed, desk and wardrobe. A clear, no-fuss place to start your Sevilla stay.', propertyType:'Private room', monthlyRent:0, neighborhood:'San Bernardo', address:'Calle José Recuerda Rubio, San Bernardo', bedrooms:4, bathrooms:2, area:90, furnished:true, availableFrom:'2027-02-01', minimumStayMonths:5, deposit:0, utilitiesIncluded:false, occupants:4, amenities:['Wi-Fi','Washing machine','Desk','Heating'], images:photosFor('helsinki'), latitude:37.3813, longitude:-5.9813 },
  { id:'zagreb', title:'Zagreb', description:'A flat share on a lively street near the Alameda, with a big shared table and a bright living room. Cafés, bars and the Thursday market are right on the doorstep.', propertyType:'Private room', monthlyRent:0, neighborhood:'Alameda', address:'Calle Feria, Casco Antiguo', bedrooms:4, bathrooms:2, area:95, furnished:true, availableFrom:'2027-02-01', minimumStayMonths:5, deposit:0, utilitiesIncluded:true, occupants:4, amenities:['Wi-Fi','Air conditioning','Washing machine','Desk'], images:photosFor('zagreb'), latitude:37.4001, longitude:-5.9915 },
  { id:'tallin', title:'Tallin', description:'A tidy flat share close to everyday shops and good transport links. The kitchen is spacious, the building has a lift and the household enjoys keeping shared spaces welcoming.', propertyType:'Private room', monthlyRent:0, neighborhood:'Nervión', address:'Calle Luis Montoto, Nervión', bedrooms:4, bathrooms:1, area:85, furnished:true, availableFrom:'2027-09-01', minimumStayMonths:5, deposit:0, utilitiesIncluded:false, occupants:4, amenities:['Wi-Fi','Air conditioning','Washing machine','Elevator'], images:photosFor('tallin'), latitude:37.3824, longitude:-5.9709 },
  { id:'oslo', title:'Oslo', description:'Bright rooms with desks and storage, most with a window onto a quiet street. Share a comfortable kitchen and living room with your flatmates. The rent is clear and the home comes furnished for an easy arrival.', propertyType:'Private room', monthlyRent:0, neighborhood:'Macarena', address:'Calle Parlamento de Andalucía, Macarena', bedrooms:5, bathrooms:2, area:115, furnished:true, availableFrom:'2027-09-01', minimumStayMonths:5, deposit:0, utilitiesIncluded:false, occupants:5, amenities:['Wi-Fi','Washing machine','Desk','Heating'], images:photosFor('oslo'), latitude:37.4053, longitude:-5.9907 },
  { id:'amsterdam', title:'Amsterdam', description:'A spacious flat share with a proper dining table, a well-equipped kitchen and air conditioning for the warmer months. Big enough to always find company, with a quiet corner when you need to study.', propertyType:'Private room', monthlyRent:0, neighborhood:'Los Remedios', address:'Calle Virgen de Luján, Los Remedios', bedrooms:7, bathrooms:3, area:160, furnished:true, availableFrom:'2027-02-01', minimumStayMonths:5, deposit:0, utilitiesIncluded:true, occupants:7, amenities:['Wi-Fi','Air conditioning','Washing machine','Elevator','Desk'], images:photosFor('amsterdam'), latitude:37.3758, longitude:-6.0063 },
  { id:'ottawa', title:'Ottawa', description:'A large student house with nine rooms, two living areas and a generous kitchen for shared dinners. Each room has a desk and wardrobe; Wi-Fi and washing machines are in the house.', propertyType:'Private room', monthlyRent:0, neighborhood:'Nervión', address:'Avenida de Eduardo Dato, Nervión', bedrooms:9, bathrooms:3, area:210, furnished:true, availableFrom:'2027-02-01', minimumStayMonths:5, deposit:0, utilitiesIncluded:false, occupants:9, amenities:['Wi-Fi','Air conditioning','Washing machine','Desk','Dishwasher'], images:photosFor('ottawa'), latitude:37.3811, longitude:-5.9723 },
  { id:'berlin', title:'Berlin', description:'A big, sociable flat share spread over two floors in the old town, with a roof terrace, a common lounge and four bathrooms. Perfect if you want an international household from day one.', propertyType:'Private room', monthlyRent:0, neighborhood:'Alameda', address:'Calle Relator, Casco Antiguo', bedrooms:11, bathrooms:4, area:260, furnished:true, availableFrom:'2027-02-01', minimumStayMonths:5, deposit:0, utilitiesIncluded:true, occupants:11, amenities:['Wi-Fi','Air conditioning','Washing machine','Desk','Balcony'], images:photosFor('berlin'), latitude:37.4008, longitude:-5.9929 },
  { id:'torre-del-oro', title:'Torre del Oro', description:'Our biggest home: a student residence-style building a few minutes from the river and the Torre del Oro. Twenty furnished rooms, several shared kitchens and lounges, and a laundry room — lots of people to meet.', propertyType:'Private room', monthlyRent:0, neighborhood:'Centro', address:'Calle Almirante Lobo, Centro', bedrooms:20, bathrooms:8, area:480, furnished:true, availableFrom:'2027-02-01', minimumStayMonths:5, deposit:0, utilitiesIncluded:true, occupants:20, amenities:['Wi-Fi','Air conditioning','Heating','Washing machine','Elevator','Desk'], images:photosFor('torre-del-oro'), latitude:37.3826, longitude:-5.9958 }
];

/** Flat shares list their rooms; the flat's headline rent is its cheapest room. */
export const PROPERTIES: Property[] = LISTINGS.map(listing => {
  const rooms = ROOMS[listing.id];
  if (!rooms) return listing;
  return { ...listing, rooms, household:HOUSEHOLDS[listing.id] ?? 'mixed', bedrooms:rooms.length, occupants:rooms.length, monthlyRent:Math.min(...rooms.map(room => room.monthlyRent)), deposit:Math.min(...rooms.map(room => room.monthlyRent)) };
});
