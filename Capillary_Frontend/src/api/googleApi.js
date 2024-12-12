// src/api/googleApi.js
import axios from 'axios';

const GOOGLE_API_KEY = 'AIzaSyA76xfjC2lJOVwIE5FjmcoF7F2T3M6VaX4'; // Replace with your actual API key

// Function to fetch city and state from Google Places API
export const fetchCitiesAndStates = async (userInput) => {
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      {
        params: {
          input: userInput, // The input text (e.g., a city or state name)
          types: 'geocode', // We want geocode results like city names or addresses
          key: GOOGLE_API_KEY, // API key
        },
      }
    );
    return response.data.predictions; // Return the predictions (list of places)
  } catch (error) {
    console.error('Error fetching city/state data from Google API:', error);
    throw error; // Propagate the error
  }
};
