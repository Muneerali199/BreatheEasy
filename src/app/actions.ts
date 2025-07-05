'use server'

const MOCK_LOCATIONS = [
    "New York, NY, USA",
    "Los Angeles, CA, USA",
    "Chicago, IL, USA",
    "Houston, TX, USA",
    "Phoenix, AZ, USA",
    "Philadelphia, PA, USA",
    "San Antonio, TX, USA",
    "San Diego, CA, USA",
    "Dallas, TX, USA",
    "San Jose, CA, USA",
    "London, England, UK",
    "Paris, Ile-de-France, France",
    "Tokyo, Tokyo, Japan",
    "Delhi, Delhi, India",
    "Shanghai, Shanghai, China",
    "Sao Paulo, Sao Paulo, Brazil",
    "Mumbai, Maharashtra, India",
    "Beijing, Beijing, China",
    "Cairo, Cairo, Egypt",
    "Dhaka, Dhaka, Bangladesh",
];

export async function getSupportedLocations(query: string): Promise<string[]> {
    if (!query) {
        return MOCK_LOCATIONS.slice(0, 5);
    }
    const filteredLocations = MOCK_LOCATIONS.filter(location => 
        location.toLowerCase().includes(query.toLowerCase())
    );
    return filteredLocations.slice(0, 5); // Return top 5 matches
}
