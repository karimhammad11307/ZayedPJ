export interface DeliveryZone {
  id: string
  label: string
  areas: string[]
  price: number
  duration: string
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'metro', label: 'Metro', areas: ['Metro'], price: 95, duration: '24' },
  { id: 'cairo-giza', label: 'Cairo - Giza', areas: ['Cairo', 'Giza'], price: 105, duration: '24' },
  {
    id: 'greater-cairo-extended',
    label: 'Greater Cairo Extended',
    areas: ['El Marg', 'El Khanka', 'El Khosos', 'Badrashin', 'October', 'El Tagamoa', 'Katameya', 'Mokattam', 'Helwan', 'Hadaeq El Ahram', 'El Salam', 'Sheikh Zayed', 'El Hawamdeya', 'Al Rehab', 'Abu Zaabal', 'Dahshur', 'Ausim', 'Nahya', 'El Mansoureya', 'Kerdasa', 'El Baragil', 'Abu Rawash', 'Manshiyat El Qanater', 'El Mounib', 'Abu El Nomros', 'Shabramant', 'Saqqara', 'Nikla'],
    price: 110,
    duration: '24',
  },
  {
    id: 'new-cities',
    label: 'New Cities',
    areas: ['El Obour', 'Madinaty', 'El Shorouk', 'Badr', '10th of Ramadan', 'El Ayyat', 'El Saff', 'Atfeeh', 'New Heliopolis', 'El Mostakbal'],
    price: 115,
    duration: '24',
  },
  { id: 'canal-alex', label: 'Alexandria - Canal Cities', areas: ['Alexandria', 'Ismailia', 'Suez', 'Port Said'], price: 120, duration: '24-48' },
  { id: 'delta', label: 'Delta Governorates', areas: ['Dakahlia', 'Qalyubia', 'Gharbia', 'Sharqia', 'Damietta', 'Kafr El Sheikh', 'Beheira', 'Monufia'], price: 125, duration: '24-48' },
  { id: 'upper-egypt', label: 'Upper Egypt', areas: ['Fayoum', 'Beni Suef', 'Assiut', 'Sohag', 'Qena', 'Luxor', 'Aswan', 'Minya'], price: 135, duration: '24-48' },
  { id: 'north-red-sea', label: 'North Coast - Red Sea', areas: ['Marsa Matrouh', 'Hurghada', 'North Coast', 'El Alamein', 'Sidi Abdel Rahman', 'El Hamam City'], price: 145, duration: '24-48' },
  { id: 'sharm-el-sheikh', label: 'Sharm El Sheikh', areas: ['Sharm El Sheikh'], price: 160, duration: '24-48' },
  { id: 'south-red-sea-sinai', label: 'South Red Sea - South Sinai', areas: ['Safaga', 'El Quseir', 'Ras Gharib', 'Marsa Alam', 'Makadi Bay', 'Dahab', 'El Tor', 'South Sinai'], price: 165, duration: '24-48' },
]

export function getDeliveryZone(zoneId: string | undefined | null) {
  if (!zoneId) return null
  return DELIVERY_ZONES.find((zone) => zone.id === zoneId) ?? null
}

export function formatDeliveryZone(zone: DeliveryZone) {
  return `${zone.label} - EGP ${zone.price.toLocaleString('en-EG')} (${zone.duration}h)`
}
