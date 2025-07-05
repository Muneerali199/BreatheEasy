'use server'

const MOCK_LOCATIONS = [
    "New York, New York, USA",
    "Los Angeles, California, USA",
    "Chicago, Illinois, USA",
    "Houston, Texas, USA",
    "Phoenix, Arizona, USA",
    "Philadelphia, Pennsylvania, USA",
    "San Antonio, Texas, USA",
    "San Diego, California, USA",
    "Dallas, Texas, USA",
    "San Jose, California, USA",
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
