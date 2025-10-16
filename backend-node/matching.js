export const KEYWORDS = [
  "cve","cwe","zero-day","exploit","injection","overflow","underflow",
  "password","credential","token","session","mfa","sso","bypass",
  "privilege","escalation","access control","permission","role",
  "encryption","decryption","plaintext","hashing","key leak","tls","ssl",
  "sanitization","validation","buffer","parsing",
  "buffer overflow","stack overflow","memory corruption","use-after-free","heap",
  "certificate","handshake","man-in-the-middle","downgrade",
  "hardening","default settings","insecure configuration","misconfiguration",
  "race condition","deadlock","boundary check","input handling",
  "kernel","driver","sandbox","container escape","vm","hypervisor",
  "audit","logging","error handling","debug","exposure","information disclosure",
  "improper restriction","elevation","patch","hotfix","mitigation","remediation","security advisory"
]
export function scoreMatch(vendor, product, version, advisory){
  let score = 0
  const title = `${advisory.title||''} ${advisory.summary||''}`.toLowerCase()
  for(const token of [vendor?.toLowerCase(), product?.toLowerCase()]){
    if(token && title.includes(token)) score += 0.2
  }
  const hits = KEYWORDS.reduce((acc,k)=> acc + (title.includes(k)?1:0), 0)
  score += Math.min(0.3, 0.05 * hits)
  const cvss = Number(advisory?.cvss?.score || advisory?.cvss || advisory?.cvssv3?.score || NaN)
  if(!isNaN(cvss)){
    if (cvss >= 9) score += 0.2
    else if (cvss >= 7) score += 0.1
  }
  return Math.min(1, Number(score.toFixed(2)))
}
