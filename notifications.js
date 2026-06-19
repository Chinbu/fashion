const list = [
  {
    text: "🔥 Join our Telegram Channel for exclusive deals!",
    link: "https://t.me/+GKfm_HwivHM1YWFl",
    emoji: "📱"
  },
  {
    text: "💬 Join WhatsApp Channel for daily updates!",
    link: "https://whatsapp.com/channel/0029Vb6Uy0dCRs1phBNPrq0a",
    emoji: "💬"
  },
  {
    text: "⭐ Get early access to new products!",
    link: "https://t.me/+GKfm_HwivHM1YWFl",
    emoji: "⭐"
  },
  {
    text: "🎁 Special discounts for channel members!",
    link: "https://whatsapp.com/channel/0029Vb6Uy0dCRs1phBNPrq0a",
    emoji: "🎁"
  },
  {
    text: "🚀 Discover amazing deals every day!",
    link: "https://t.me/+GKfm_HwivHM1YWFl",
    emoji: "🚀"
  },
  {
    text: "💎 Exclusive offers only for our community!",
    link: "https://whatsapp.com/channel/0029Vb6Uy0dCRs1phBNPrq0a",
    emoji: "💎"
  }
];

let activePopup = null;
let notificationCount = 0;

function showNotification() {
  // Remove existing popup if any
  if(activePopup) {
    activePopup.remove();
  }
  
  const n = list[Math.floor(Math.random() * list.length)];
  notificationCount++;
  
  const box = document.createElement("div");
  box.className = "popup";
  
  box.innerHTML = `
    <span onclick="this.parentElement.remove()">✕</span>
    <p>${n.emoji} ${n.text}</p>
    <a href="${n.link}" target="_blank">Join Now →</a>
  `;
  
  document.body.appendChild(box);
  activePopup = box;
  
  // Auto remove after 8 seconds
  setTimeout(() => {
    if(box && box.remove) {
      box.remove();
      if(activePopup === box) activePopup = null;
    }
  }, 8000);
}

// Show first notification after 5 seconds
setTimeout(showNotification, 5000);

// Show every 3 minutes (180000 milliseconds)
setInterval(showNotification, 180000);

console.log("✅ Notifications set to show every 3 minutes");