import { Household, Room } from '../../core/models/property.model';

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
    tenant: booked ? { gender: gender === 'f' ? 'female' : 'male', country } : undefined
  } satisfies Room;
})]));
