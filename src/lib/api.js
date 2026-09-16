const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxYk5O0y4r1dP8AXuGUR06fEIaDTsiydRYECwNIGF5AbGcldrmBj3G7sQOnRbPnk2NEgQ/exec';

export async function apiCall(data) {
  // We use POST with plain text to avoid CORS preflight issues with Google Apps Script
  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    }
  });
  return await response.json();
}
