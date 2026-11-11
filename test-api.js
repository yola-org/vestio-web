const API_URL = "http://localhost:8080"

async function testEndpoint(endpoint) {
  console.log(`Testing ${endpoint}...`)
  try {
    const response = await fetch(`${API_URL}${endpoint}`)
    console.log(`Status: ${response.status}`)
    const text = await response.text()
    console.log(`Raw Response (first 500 chars): ${text.substring(0, 500)}`)
    try {
      const json = JSON.parse(text)
      console.log(`Is Array: ${Array.isArray(json)}`)
      if (typeof json === "object" && json !== null) {
        console.log(`Keys: ${Object.keys(json).join(", ")}`)
      }
    } catch (e) {
      console.log("Not JSON")
    }
  } catch (error) {
    console.error(`Error: ${error.message}`)
  }
  console.log("---")
}

async function run() {
  await testEndpoint("/api/categories")
  await testEndpoint("/api/cities")
  await testEndpoint("/api/sizes")
}

run()
