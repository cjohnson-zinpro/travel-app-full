// Simple test to trigger the progressive search API
fetch('http://localhost:5000/api/travel/progressive', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    budget: 3000,
    origin: 'JFK',
    travelDuration: 7,
    countries: ['US'],
    interests: ['culture']
  })
})
.then(response => response.json())
.then(data => console.log('Response:', data))
.catch(error => console.error('Error:', error));