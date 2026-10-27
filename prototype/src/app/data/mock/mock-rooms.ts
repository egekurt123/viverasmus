import { Household, Room } from '../../core/models/property.model';

const asset = (path: string): string => `/assets/Viverasmus Real Photos/${path}`;

const REAL_ROOM_IMAGES: Record<string, string[][]> = {
  paris: [
    [asset('PARIS/HAB1/HAB1-1.jpg'), asset('PARIS/HAB1/HAB1-2.jpg')],
    [asset('PARIS/HAB2/HAB2-1.jpg'), asset('PARIS/HAB2/HAB2-2.jpg')],
    [asset('PARIS/HAB3/HAB3-1.jpg'), asset('PARIS/HAB3/HAB3-2.jpg')],
    [asset('PARIS/HAB4/HAB4-1.jpg'), asset('PARIS/HAB4/HAB4-2.jpg')],
    [asset('PARIS/HAB5/HAB5-1.jpg'), asset('PARIS/HAB5/HAB5-2.jpg')]
  ],
  helsinki: [
    [asset('HELSINKI/HAB1/HAB 1-1.jpg'), asset('HELSINKI/HAB1/HAB 1-2.jpg')],
    [asset('HELSINKI/HAB2/HAB 2-1.jpg'), asset('HELSINKI/HAB2/HAB 2-2.jpg')],
    [asset('HELSINKI/HAB3/HAB 3-1.jpg'), asset('HELSINKI/HAB3/HAB 3-2.jpg')],
    [asset('HELSINKI/HAB4/HAB 4-1.jpg'), asset('HELSINKI/HAB4/HAB 4-2.jpg')]
  ],
  zagreb: [
    [asset('ZAGREB/HAB1/HAB1-1 (1).jpg'), asset('ZAGREB/HAB1/HAB1-2.jpg')],
    [asset('ZAGREB/HAB2/HAB2-1.jpg'), asset('ZAGREB/HAB2/HAB2-2.jpg')],
    [asset('ZAGREB/HAB3/HAB3-1.jpg'), asset('ZAGREB/HAB3/HAB3-2.jpg')],
    [asset('ZAGREB/HAB4/HAB4-1.jpg'), asset('ZAGREB/HAB4/HAB4-2 (1).jpg')]
  ],
  tallin: [
    [asset('TALINN/HABI1/HAB1-1.jpg'), asset('TALINN/HABI1/HAB1-2.jpg')],
    [asset('TALINN/HAB2/HAB2-1.jpg'), asset('TALINN/HAB2/HAB2-2.jpg')],
    [asset('TALINN/HAB3/HAB3-1.jpg'), asset('TALINN/HAB3/HAB3-2.jpg')],
    [asset('TALINN/HAB4/HAB4-1.jpg'), asset('TALINN/HAB4/HAB4-2.jpg')]
  ],
  oslo: [
    [asset('OSLO/HAB1/HAB 1-1.jpg'), asset('OSLO/HAB1/HAB 1-2.jpg')],
    [asset('OSLO/HAB2/HAB 2-1.jpg'), asset('OSLO/HAB2/HAB 2-2.jpg')],
    [asset('OSLO/HAB3/HAB 3-1.jpg'), asset('OSLO/HAB3/HAB 3-2.jpg')],
    [asset('OSLO/HAB4 /HAB 4-1.jpg'), asset('OSLO/HAB4 /HAB 4-2.jpg')],
    [asset('OSLO/HAB5/HAB 5-1.jpg'), asset('OSLO/HAB5/HAB 5-2.jpg')]
  ],
  amsterdam: [
    [asset('AMSTERDAM/HAB1/HAB1-1.jpg'), asset('AMSTERDAM/HAB1/HAB1-2.jpg')],
    [asset('AMSTERDAM/HAB2/HAB2-4.jpg'), asset('AMSTERDAM/HAB2/HAB2-5.jpg')],
    [asset('AMSTERDAM/HAB3/HAB3-2.jpg'), asset('AMSTERDAM/HAB3/HAB3-4.jpg')],
    [asset('AMSTERDAM/HAB4/HAB4-1.jpg'), asset('AMSTERDAM/HAB4/HAB4-2.jpg')],
    [asset('AMSTERDAM/HAB5/HAB5-1.jpg'), asset('AMSTERDAM/HAB5/HAB5-2.jpg')],
    [asset('AMSTERDAM/HAB6/HAB6-1.jpg'), asset('AMSTERDAM/HAB6/HAB6-2.jpg')],
    [asset('AMSTERDAM/HAB7/HAB7-1.jpg'), asset('AMSTERDAM/HAB7/HAB7-2.jpg')]
  ],
  ottawa: [
    [asset('OTTAWA/HAB1/HAB1-1.jpg'), asset('OTTAWA/HAB1/HAB1-2.jpg')],
    [asset('OTTAWA/HAB2/HAB2-1.jpg'), asset('OTTAWA/HAB2/HAB2-2.jpg')],
    [asset('OTTAWA/HAB3/HAB3-1.jpg'), asset('OTTAWA/HAB3/HAB3-2.jpg')],
    [asset('OTTAWA/HAB4/HAB4-1.jpg'), asset('OTTAWA/HAB4/HAB4-2.jpg')],
    [asset('OTTAWA/HAB5/HAB5-1.jpg'), asset('OTTAWA/HAB5/HAB5-2.jpg')],
    [asset('OTTAWA/HAB6/HAB 6-1.jpg'), asset('OTTAWA/HAB6/HAB 6-2.jpg')],
    [asset('OTTAWA/HAB7/HAB7-1.jpg'), asset('OTTAWA/HAB7/HAB7-2.jpg')],
    [asset('OTTAWA/HAB8/HAB8-1.jpg'), asset('OTTAWA/HAB8/HAB8-2.jpg')],
    [asset('OTTAWA/HAB9/HAB9-1.jpg'), asset('OTTAWA/HAB9/HAB9-2.jpg')]
  ],
  berlin: [
    [asset('BERLIN/HAB1/HAB 1-1.jpg'), asset('BERLIN/HAB1/HAB 1-2.jpg')],
    [asset('BERLIN/HAB2/HAB2-1.jpg'), asset('BERLIN/HAB2/HAB2-2.jpg')],
    [asset('BERLIN/HAB3/HAB3-1.jpg'), asset('BERLIN/HAB3/HAB3-2.jpg')],
    [asset('BERLIN/HAB4/HAB4-1.jpg'), asset('BERLIN/HAB4/HAB4-2.jpg')],
    [asset('BERLIN/HAB5/HAB5-1.jpg'), asset('BERLIN/HAB5/HAB5-2.jpg')],
    [asset('BERLIN/HAB6/HAB6-1.jpg'), asset('BERLIN/HAB6/HAB6-2.jpg')],
    [asset('BERLIN/HAB7/HAB7-1.jpg'), asset('BERLIN/HAB7/HAB7-2.jpg')],
    [asset('BERLIN/HAB8/HAB8-1.jpg'), asset('BERLIN/HAB8/HAB8-2.jpg')],
    [asset('BERLIN/HAB9/HAB9-1.jpg'), asset('BERLIN/HAB9/HAB9-2.jpg')],
    [asset('BERLIN/HAB10/HAB10-1.jpg'), asset('BERLIN/HAB10/HAB10-2.jpg')],
    [asset('BERLIN/HAB11/HAB11-1.jpg'), asset('BERLIN/HAB11/HAB11-2.jpg')]
  ],
  'torre-del-oro': Array.from({ length: 20 }, (_, index) => {
    const room = index + 1;
    const folder = room === 20 ? 'HAB20' : `HAB${room}`;
    const filenameRoom = room === 20 ? 19 : room;
    return [asset(`TORRE DEL ORO/${folder}/HAB${filenameRoom}-1.jpg`), asset(`TORRE DEL ORO/${folder}/HAB${filenameRoom}-2.jpg`)];
  })
};

/** [monthly rent, m², free from, booked by ('f' | 'm') + ':' + country] */
type RoomRow = [number, number, string, string?];

const ROWS: Record<string, RoomRow[]> = {
  'paris':         [[300,10,'2027-02-01'],[350,12,'2027-09-01','f:Denmark'],[400,14,'2027-02-01'],[450,15,'2027-09-01','m:Sweden'],[480,17,'2027-02-01','f:Germany']],
  'helsinki':      [[365,10,'2027-02-01'],[395,12,'2027-02-01','f:Finland'],[395,12,'2027-02-01'],[420,13,'2027-09-01','f:Norway']],
  'zagreb':        [[380,11,'2027-02-01','m:Italy'],[410,12,'2027-02-01'],[430,13,'2027-02-01'],[460,15,'2027-09-01','m:Poland']],
  'tallin':        [[350,10,'2027-09-01'],[375,11,'2027-09-01','f:Ireland'],[375,11,'2027-09-01'],[410,13,'2027-09-01']],
  'oslo':          [[340,9,'2027-09-01'],[375,11,'2027-09-01','m:Poland'],[375,11,'2027-09-01'],[410,13,'2027-09-01','f:Ireland'],[440,15,'2027-09-01']],
  'amsterdam':     [[400,10,'2027-02-01'],[420,11,'2027-02-01','f:Netherlands'],[450,13,'2027-02-01'],[450,13,'2027-09-01','m:Belgium'],[470,14,'2027-02-01'],[490,15,'2027-02-01','f:France'],[520,17,'2027-09-01']],
  'ottawa':        [[380,10,'2027-02-01'],[395,11,'2027-02-01','f:United States'],[410,11,'2027-02-01'],[430,12,'2027-02-01','f:Sweden'],[430,12,'2027-09-01'],[450,13,'2027-02-01','f:Belgium'],[465,14,'2027-02-01'],[480,15,'2027-09-01','f:Greece'],[510,17,'2027-02-01']],
  'berlin':        [[360,10,'2027-02-01'],[380,10,'2027-02-01','m:Austria'],[390,11,'2027-02-01'],[400,11,'2027-02-01','f:Czechia'],[420,12,'2027-09-01'],[420,12,'2027-02-01','m:Germany'],[440,13,'2027-02-01'],[450,13,'2027-09-01','f:Hungary'],[470,14,'2027-02-01'],[490,15,'2027-02-01','m:Switzerland'],[520,17,'2027-09-01']],
  'torre-del-oro': [[320,9,'2027-02-01'],[330,9,'2027-02-01','m:Portugal'],[340,10,'2027-02-01'],[340,10,'2027-02-01','f:Spain'],[350,10,'2027-09-01'],[360,11,'2027-02-01','f:Italy'],[360,11,'2027-02-01'],[370,11,'2027-09-01','m:France'],[380,12,'2027-02-01'],[380,12,'2027-02-01','f:Germany'],[390,12,'2027-02-01'],[400,13,'2027-09-01','m:Denmark'],[410,13,'2027-02-01'],[420,14,'2027-02-01','f:Netherlands'],[430,14,'2027-02-01'],[440,15,'2027-09-01'],[450,15,'2027-02-01','m:United Kingdom'],[470,16,'2027-02-01'],[490,17,'2027-09-01','f:Finland'],[520,18,'2027-02-01']]
};

export const HOUSEHOLDS: Record<string, Household> = { 'helsinki':'women', 'tallin':'women', 'ottawa':'women', 'zagreb':'men' };

const featuresFor = (area: number): string[] => area >= 15 ? ['Double bed','Desk','Wardrobe','Balcony access'] : area >= 12 ? ['Double bed','Desk','Wardrobe'] : ['Single bed','Desk','Wardrobe'];

export const ROOMS: Record<string, Room[]> = Object.fromEntries(Object.entries(ROWS).map(([propertyId, rows]) => [propertyId, rows.map(([monthlyRent, area, availableFrom, booked], index) => {
  const [gender, country] = booked?.split(':') ?? [];
  return {
    id:`${propertyId}-room-${index + 1}`, name:`Room ${index + 1}`, monthlyRent, area, availableFrom, features:featuresFor(area),
    status: booked ? 'booked' : 'available',
    tenant: booked ? { gender: gender === 'f' ? 'female' : 'male', country } : undefined,
    images: REAL_ROOM_IMAGES[propertyId]?.[index] ?? []
  } satisfies Room;
})]));
