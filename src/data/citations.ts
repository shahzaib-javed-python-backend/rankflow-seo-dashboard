export interface Citation {
  id: string;
  directory: string;
  url: string;
  businessName: string;
  address: string;
  phone: string;
  nameMatch: boolean;
  addressMatch: boolean;
  phoneMatch: boolean;
  lastSynced: string;
  status: 'consistent' | 'inconsistent' | 'missing';
}

export const citations: Citation[] = [
  { id: 'ct1', directory: 'Yelp', url: 'yelp.com/biz/shaheen-print-hub', businessName: 'Shaheen Print Hub', address: '123 D Ground, Faisalabad', phone: '+92 41 873 2245', nameMatch: true, addressMatch: true, phoneMatch: true, lastSynced: '2h ago', status: 'consistent' },
  { id: 'ct2', directory: 'YellowPages', url: 'yellowpages.com/shaheen-print', businessName: 'Shaheen PrintHub', address: '123 D-Ground, Faisalabad', phone: '+92 41 8732245', nameMatch: false, addressMatch: true, phoneMatch: false, lastSynced: '1d ago', status: 'inconsistent' },
  { id: 'ct3', directory: 'Facebook', url: 'facebook.com/shaheenprinthub', businessName: 'Shaheen Print Hub', address: '123 D Ground, Faisalabad', phone: '+92 41 873 2245', nameMatch: true, addressMatch: true, phoneMatch: true, lastSynced: '3h ago', status: 'consistent' },
  { id: 'ct4', directory: 'Google Business', url: 'maps.google.com/shaheen-print', businessName: 'Shaheen Print Hub', address: '123 D Ground, Faisalabad', phone: '+92 41 873 2245', nameMatch: true, addressMatch: true, phoneMatch: true, lastSynced: '5m ago', status: 'consistent' },
  { id: 'ct5', directory: 'Foursquare', url: 'foursquare.com/shaheen-print', businessName: 'Shaheen Print Hub', address: '123-D Ground Faisalabad', phone: '+92 41 873-2245', nameMatch: true, addressMatch: false, phoneMatch: false, lastSynced: '4d ago', status: 'inconsistent' },
  { id: 'ct6', directory: 'Bing Places', url: 'bingplaces.com/shaheen', businessName: '', address: '', phone: '', nameMatch: false, addressMatch: false, phoneMatch: false, lastSynced: 'never', status: 'missing' },
  { id: 'ct7', directory: 'Apple Maps', url: 'maps.apple.com/shaheen-print', businessName: 'Shaheen Print Hub', address: '123 D Ground, Faisalabad', phone: '+92 41 873 2245', nameMatch: true, addressMatch: true, phoneMatch: true, lastSynced: '6h ago', status: 'consistent' },
  { id: 'ct8', directory: 'TripAdvisor', url: 'tripadvisor.com/shaheen-print', businessName: 'Shaheen Printing', address: '123 D Ground, Fsd', phone: '+92 41 873 2245', nameMatch: false, addressMatch: false, phoneMatch: true, lastSynced: '2w ago', status: 'inconsistent' },
];

export const canonicalNAP = {
  businessName: 'Shaheen Print Hub',
  address: '123 D Ground, Faisalabad',
  phone: '+92 41 873 2245',
};
