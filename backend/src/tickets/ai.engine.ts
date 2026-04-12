// src/tickets/ai.engine.ts

interface AIResponse {
  message: string
  shouldEscalate: boolean
}

const KNOWLEDGE_BASE = [
  {
    keywords: ['no internet', 'not connecting', 'connection lost', 'cant connect', "can't connect", 'offline', 'no connection', 'internet down'],
    response: `I can help with that! Here are the steps to restore your connection:

1. **Restart your router** — unplug it from the power source, wait 30 seconds, then plug it back in
2. **Wait 2 minutes** for it to fully reconnect
3. **Check the lights** — the internet light should be solid (not blinking)
4. **Restart your device** — sometimes your device needs a fresh connection

If this doesn't work after 5 minutes, your line may need a technical check. Would you like me to connect you with a support agent?`,
    shouldEscalate: false,
  },
  {
    keywords: ['slow internet', 'slow speed', 'speed slow', 'low speed', 'bad speed', 'lagging', 'buffering', 'slow connection'],
    response: `Slow speeds can be frustrating! Let's troubleshoot:

1. **Run a speed test** at speedtest.net and note your results
2. **Check connected devices** — too many devices can slow things down
3. **Move closer to your router** if on WiFi
4. **Restart your router** — unplug for 30 seconds, plug back in
5. **Use a wired connection** for best speeds

Your current plan provides up to the speed on your subscription. If speeds are consistently below 50% of your plan speed, we can investigate further. Want to talk to a support agent?`,
    shouldEscalate: false,
  },
  {
    keywords: ['maintenance', 'outage', 'network down', 'service down', 'no service', 'area affected'],
    response: `Our network monitoring shows **scheduled maintenance** may be ongoing in some areas.

🔧 Maintenance windows are typically between **12AM — 5AM**
📍 Affected areas are usually restored within **2-4 hours**

You can check our service status page for real-time updates. If this is outside maintenance hours, there may be an unplanned outage. Would you like me to escalate this to our support team?`,
    shouldEscalate: false,
  },
  {
    keywords: ['billing', 'payment', 'charge', 'invoice', 'overcharged', 'refund', 'wrong amount'],
    response: `For billing enquiries, here's what I can tell you:

💳 Payments are processed at the start of each billing cycle
📧 Invoices are sent to your registered email
🔄 Renewals happen automatically 3 days before expiry

If you believe there's an error in your billing, I'll need to connect you with our billing team who can review your account in detail. **Would you like me to connect you with a support agent?**`,
    shouldEscalate: true,
  },
  {
    keywords: ['router', 'modem', 'device', 'equipment', 'blinking', 'lights', 'red light', 'orange light'],
    response: `Here's what the router lights mean:

🟢 **Solid green** — Connected and working normally
🟡 **Blinking amber** — Trying to connect, please wait
🔴 **Red light** — No signal, try restarting
⚪ **All lights off** — Power issue, check the cable

**Quick fix:** Unplug your router, wait 30 seconds, plug back in. Most light issues resolve within 2 minutes.

Still having issues? I can connect you with a technician.`,
    shouldEscalate: false,
  },
  {
    keywords: ['upgrade', 'change plan', 'higher plan', 'faster plan', 'upgrade plan'],
    response: `Great news — you can upgrade your plan anytime! 🚀

Available plans:
- **Basic** — 10Mbps — ₦5,000/month
- **Standard** — 50Mbps — ₦15,000/month  
- **Fiber** — 100Mbps — ₦25,000/month

You can upgrade directly from your **Subscription** page. The new speed takes effect immediately after payment.

Would you like help with anything else, or shall I connect you to an agent?`,
    shouldEscalate: false,
  },
  {
    keywords: ['renew', 'renewal', 'expired', 'expiry', 'subscription expired', 'reconnect'],
    response: `Your subscription renewal is simple! 

📅 You can renew anytime from your **Subscription** page
⏱ Renewal adds **30 days** from your current expiry date
💳 Payment is simulated for this demo

If your subscription has already expired, renewing will immediately restore your connection. Need help with anything else?`,
    shouldEscalate: false,
  },
  {
    keywords: ['installation', 'install', 'technician', 'setup', 'new connection', 'technician coming'],
    response: `For installation and technical visits:

📅 **Scheduled installations** are visible on your Installation page
👷 A technician will be assigned before the visit
📍 They'll contact you 30 minutes before arrival
⏱ Installation typically takes **1-2 hours**

If you need to reschedule or have questions about your installation, I'll connect you with our team.`,
    shouldEscalate: false,
  },
  {
    keywords: ['password', 'forgot password', 'reset password', 'cant login', "can't login", 'login issue'],
    response: `For account access issues:

🔑 Use the **Forgot Password** link on the login page
📧 A reset link will be sent to your registered email
⏱ The link expires after **1 hour**

If you no longer have access to your registered email, I'll need to connect you with our support team to verify your identity.`,
    shouldEscalate: false,
  },
]

const FALLBACK_RESPONSE = `Thanks for reaching out! I'm ISP AutoPilot's support assistant.

I can help with:
- 🔌 Connection issues
- 🐢 Slow speeds  
- 🔧 Router/equipment problems
- 💳 Billing questions
- 📅 Subscription renewal
- 🛠 Installation queries

I didn't quite understand your message. Could you describe your issue in more detail, or would you prefer to **speak with a human support agent**?`

export function getAIResponse(message: string): AIResponse {
  const lower = message.toLowerCase()

  for (const entry of KNOWLEDGE_BASE) {
    const matched = entry.keywords.some((kw) => lower.includes(kw))
    if (matched) {
      return {
        message:        entry.response,
        shouldEscalate: entry.shouldEscalate,
      }
    }
  }

  return {
    message:        FALLBACK_RESPONSE,
    shouldEscalate: false,
  }
}